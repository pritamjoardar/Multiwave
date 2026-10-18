use crate::audio::audio_mixer::{DelayLine, ToneGenerator};
use crate::audio::volume::{apply_gain_and_limit, VolumeGain};
use crate::errors::{MultiWaveError, Result};
use cpal::traits::{DeviceTrait, StreamTrait};
use parking_lot::Mutex;
use std::sync::atomic::{AtomicBool, AtomicU32, AtomicU64, Ordering};
use std::sync::Arc;

pub struct OutputStream {
    pub device_id: String,
    pub device_name: String,
    pub sample_rate: u32,
    pub channels: usize,
    stream: Option<cpal::Stream>,
    volume: Arc<AtomicU32>, // f32 to_bits
    muted: Arc<AtomicBool>,
    delay_ms: Arc<AtomicU32>,
    is_active: Arc<AtomicBool>,
    _underrun_count: Arc<AtomicU64>,
    last_error: Arc<Mutex<Option<String>>>,
}

impl OutputStream {
    pub fn new(
        device: &cpal::Device,
        device_id: String,
        device_name: String,
        initial_volume: f32,
        initial_mute: bool,
        initial_delay_ms: u32,
        shared_generator: Arc<Mutex<ToneGenerator>>,
    ) -> Result<Self> {
        let config = device
            .default_output_config()
            .map_err(|e| MultiWaveError::StreamError(format!("Failed to query default config for {device_name}: {e}")))?;

        let sample_rate = config.sample_rate().0;
        let channels = config.channels() as usize;

        let volume_bits = Arc::new(AtomicU32::new(initial_volume.clamp(0.0, 1.0).to_bits()));
        let muted = Arc::new(AtomicBool::new(initial_mute));
        let delay_ms = Arc::new(AtomicU32::new(initial_delay_ms.min(500)));
        let is_active = Arc::new(AtomicBool::new(false));
        let underrun_count = Arc::new(AtomicU64::new(0));
        let last_error = Arc::new(Mutex::new(None));

        let vol_clone = volume_bits.clone();
        let muted_clone = muted.clone();
        let delay_clone = delay_ms.clone();
        let active_clone = is_active.clone();
        let error_clone = last_error.clone();

        let max_delay_samples = (sample_rate as usize * 500) / 1000;
        let mut delay_lines: Vec<DelayLine> = (0..channels)
            .map(|_| DelayLine::new(max_delay_samples))
            .collect();

        let err_dev_name = device_name.clone();
        let err_callback = move |err: cpal::StreamError| {
            log::warn!("Audio stream error on {}: {}", err_dev_name, err);
            active_clone.store(false, Ordering::SeqCst);
            *error_clone.lock() = Some(err.to_string());
        };

        let stream_config = config.config();

        let stream = match config.sample_format() {
            cpal::SampleFormat::F32 => {
                let gen = shared_generator.clone();
                let mut reader_frame = 0usize;
                let mut resampler_phase = 0.0f64;
                device.build_output_stream(
                    &stream_config,
                    move |data: &mut [f32], _: &cpal::OutputCallbackInfo| {
                        let dst_frames = data.len() / channels;

                        // Continuous sub-sample resampler & broadcast channel mapper directly to output
                        {
                            let mut gen_lock = gen.lock();
                            gen_lock.read_and_resample(
                                &mut reader_frame,
                                &mut resampler_phase,
                                data,
                                sample_rate,
                                channels,
                            );
                        }

                        // Apply delay compensation for Bluetooth sync
                        let delay_ms_val = delay_clone.load(Ordering::Relaxed) as usize;
                        let delay_samples = (sample_rate as usize * delay_ms_val) / 1000;

                        for c in 0..channels {
                            delay_lines[c].set_delay_samples(delay_samples);
                        }

                        for f in 0..dst_frames {
                            for c in 0..channels {
                                let idx = f * channels + c;
                                data[idx] = delay_lines[c].process_sample(data[idx]);
                            }
                        }

                        // Apply software volume & soft limiting
                        let vol = f32::from_bits(vol_clone.load(Ordering::Relaxed));
                        let is_muted = muted_clone.load(Ordering::Relaxed);
                        let gain_calc = VolumeGain::new(vol, is_muted).calculate_gain();

                        apply_gain_and_limit(data, gain_calc);
                    },
                    err_callback,
                    None,
                )
            }
            cpal::SampleFormat::I16 => {
                let gen = shared_generator.clone();
                let mut reader_frame = 0usize;
                let mut resampler_phase = 0.0f64;
                let mut float_dst = vec![0.0f32; 2048];
                device.build_output_stream(
                    &stream_config,
                    move |data: &mut [i16], _: &cpal::OutputCallbackInfo| {
                        let dst_frames = data.len() / channels;

                        if float_dst.len() < data.len() {
                            float_dst.resize(data.len(), 0.0);
                        }

                        let target_slice = &mut float_dst[..data.len()];

                        {
                            let mut gen_lock = gen.lock();
                            gen_lock.read_and_resample(
                                &mut reader_frame,
                                &mut resampler_phase,
                                target_slice,
                                sample_rate,
                                channels,
                            );
                        }

                        let delay_ms_val = delay_clone.load(Ordering::Relaxed) as usize;
                        let delay_samples = (sample_rate as usize * delay_ms_val) / 1000;

                        for c in 0..channels {
                            delay_lines[c].set_delay_samples(delay_samples);
                        }

                        for f in 0..dst_frames {
                            for c in 0..channels {
                                let idx = f * channels + c;
                                target_slice[idx] = delay_lines[c].process_sample(target_slice[idx]);
                            }
                        }

                        let vol = f32::from_bits(vol_clone.load(Ordering::Relaxed));
                        let is_muted = muted_clone.load(Ordering::Relaxed);
                        let gain_calc = VolumeGain::new(vol, is_muted).calculate_gain();

                        apply_gain_and_limit(target_slice, gain_calc);

                        for (i, sample) in target_slice.iter().enumerate() {
                            let s = (*sample * 32767.0).clamp(-32768.0, 32767.0);
                            data[i] = s as i16;
                        }
                    },
                    err_callback,
                    None,
                )
            }
            other => {
                return Err(MultiWaveError::UnsupportedFormat(format!(
                    "Unsupported sample format {:?} for device {}",
                    other, device_name
                )));
            }
        }
        .map_err(|e| MultiWaveError::StreamError(format!("Failed to build stream for {device_name}: {e}")))?;

        Ok(Self {
            device_id,
            device_name,
            sample_rate,
            channels,
            stream: Some(stream),
            volume: volume_bits,
            muted,
            delay_ms,
            is_active,
            _underrun_count: underrun_count,
            last_error,
        })
    }

    pub fn play(&mut self) -> Result<()> {
        if let Some(ref stream) = self.stream {
            stream
                .play()
                .map_err(|e| MultiWaveError::StreamError(format!("Failed to start stream on {}: {e}", self.device_name)))?;
            self.is_active.store(true, Ordering::SeqCst);
            *self.last_error.lock() = None;
        }
        Ok(())
    }

    pub fn pause(&mut self) -> Result<()> {
        if let Some(ref stream) = self.stream {
            stream
                .pause()
                .map_err(|e| MultiWaveError::StreamError(format!("Failed to pause stream on {}: {e}", self.device_name)))?;
            self.is_active.store(false, Ordering::SeqCst);
        }
        Ok(())
    }

    pub fn set_volume(&self, volume: f32) {
        self.volume.store(volume.clamp(0.0, 1.0).to_bits(), Ordering::Relaxed);
    }

    pub fn set_mute(&self, is_muted: bool) {
        self.muted.store(is_muted, Ordering::Relaxed);
    }

    pub fn set_delay_ms(&self, delay_ms: u32) {
        self.delay_ms.store(delay_ms.min(500), Ordering::Relaxed);
    }

    pub fn is_active(&self) -> bool {
        self.is_active.load(Ordering::Relaxed)
    }

    pub fn get_error(&self) -> Option<String> {
        self.last_error.lock().clone()
    }
}

pub struct SafeStream(pub cpal::Stream);
unsafe impl Send for SafeStream {}
unsafe impl Sync for SafeStream {}

unsafe impl Send for OutputStream {}
unsafe impl Sync for OutputStream {}

impl Drop for OutputStream {
    fn drop(&mut self) {
        if let Some(stream) = self.stream.take() {
            let _ = stream.pause();
        }
    }
}
