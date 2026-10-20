use crate::audio::audio_mixer::ToneGenerator;
use crate::audio::device_manager::DeviceManager;
use crate::audio::output_stream::{OutputStream, SafeStream};
use crate::errors::{MultiWaveError, Result};
use crate::models::audio_device::AudioDevice;
use crate::models::playback_state::{PlaybackMetrics, PlaybackStatus, ToneType};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use parking_lot::Mutex;
use std::collections::HashMap;
use std::sync::Arc;

pub struct PlaybackEngine {
    status: PlaybackStatus,
    tone_type: ToneType,
    master_volume: f32,
    master_mute: bool,
    shared_generator: Arc<Mutex<ToneGenerator>>,
    active_streams: HashMap<String, OutputStream>,
    loopback_stream: Option<SafeStream>,
    capture_device_name: Arc<Mutex<String>>,
    input_signal_level: Arc<std::sync::atomic::AtomicU32>, // bits of f32
    last_signal_timestamp: Arc<std::sync::atomic::AtomicU64>, // millis timestamp
    device_volumes: HashMap<String, f32>,
    device_mutes: HashMap<String, bool>,
    device_delays: HashMap<String, u32>,
    device_effects: HashMap<String, u32>,
}

impl PlaybackEngine {
    pub fn new() -> Self {
        let tone_type = ToneType::SystemLoopback;
        let shared_generator = Arc::new(Mutex::new(ToneGenerator::new(48000, tone_type)));

        Self {
            status: PlaybackStatus::Stopped,
            tone_type,
            master_volume: 0.8,
            master_mute: false,
            shared_generator,
            active_streams: HashMap::new(),
            loopback_stream: None,
            capture_device_name: Arc::new(Mutex::new("Auto (Virtual Speakers)".to_string())),
            input_signal_level: Arc::new(std::sync::atomic::AtomicU32::new(0)),
            last_signal_timestamp: Arc::new(std::sync::atomic::AtomicU64::new(0)),
            device_volumes: HashMap::new(),
            device_mutes: HashMap::new(),
            device_delays: HashMap::new(),
            device_effects: HashMap::new(),
        }
    }

    pub fn set_tone_type(&mut self, tone_type: ToneType) {
        self.tone_type = tone_type;
        self.shared_generator.lock().set_tone_type(tone_type);
        if tone_type == ToneType::SystemLoopback && self.status == PlaybackStatus::Playing {
            self.ensure_loopback_stream();
        } else if tone_type != ToneType::SystemLoopback {
            self.loopback_stream = None;
        }
    }

    pub fn is_playing(&self) -> bool {
        self.status == PlaybackStatus::Playing
    }

    pub fn is_stream_active(&self, device_id: &str) -> bool {
        self.active_streams.get(device_id).map(|s| s.is_active()).unwrap_or(false)
    }

    pub fn remove_stream(&mut self, device_id: &str) {
        if let Some(mut stream) = self.active_streams.remove(device_id) {
            let _ = stream.pause();
        }
    }

    pub fn set_capture_device(&mut self, target_name: Option<String>) {
        if let Some(name) = target_name {
            *self.capture_device_name.lock() = name;
        }
        self.loopback_stream = None;
        if self.status == PlaybackStatus::Playing && self.tone_type == ToneType::SystemLoopback {
            self.ensure_loopback_stream();
        }
    }

    fn ensure_loopback_stream(&mut self) {
        if self.loopback_stream.is_some() {
            return;
        }

        let host = cpal::default_host();
        let target_pref = self.capture_device_name.lock().clone();

        // Find candidate device:
        // 1. If explicit pref (not Auto), match it
        // 2. Else find ANY device containing "virtual" or "audiorelay"
        // 3. Fall back to default output device
        let mut chosen_device: Option<cpal::Device> = None;
        let devices = host.output_devices().map(|iter| iter.collect::<Vec<_>>()).unwrap_or_default();

        if target_pref != "Auto (Virtual Speakers)" && !target_pref.is_empty() {
            for dev in &devices {
                if let Ok(name) = dev.name() {
                    if name.contains(&target_pref) || target_pref.contains(&name) {
                        chosen_device = Some(dev.clone());
                        break;
                    }
                }
            }
        }

        // Look for Virtual Speakers (MultiWave, BlackHole, Soundflower, CABLE)
        if chosen_device.is_none() {
            for dev in &devices {
                if let Ok(name) = dev.name() {
                    let n_low = name.to_lowercase();
                    if n_low.contains("multiwave")
                        || n_low.contains("virtual")
                        || n_low.contains("blackhole")
                        || n_low.contains("soundflower")
                        || n_low.contains("audiorelay")
                        || n_low.contains("cable")
                    {
                        chosen_device = Some(dev.clone());
                        *self.capture_device_name.lock() = name;
                        break;
                    }
                }
            }
        }

        // Fallback to default
        if chosen_device.is_none() {
            if let Some(def) = host.default_output_device() {
                if let Ok(name) = def.name() {
                    *self.capture_device_name.lock() = name;
                }
                chosen_device = Some(def);
            }
        }

        if let Some(dev) = chosen_device {
            let dev_name = dev.name().unwrap_or_else(|_| "Unknown".into());
            log::info!("Connecting WASAPI loopback capture on device: {}", dev_name);

            if let Ok(config) = dev.default_output_config() {
                let stream_config = config.config();
                let gen = self.shared_generator.clone();
                let channels = config.channels() as usize;
                let level_atomic = self.input_signal_level.clone();
                let last_ts = self.last_signal_timestamp.clone();

                let stream_res = match config.sample_format() {
                    cpal::SampleFormat::F32 => {
                        let last_ts = last_ts.clone();
                        dev.build_input_stream(
                            &stream_config,
                            move |data: &[f32], _: &cpal::InputCallbackInfo| {
                                let now_ms = std::time::SystemTime::now()
                                    .duration_since(std::time::UNIX_EPOCH)
                                    .unwrap_or_default()
                                    .as_millis() as u64;
                                last_ts.store(now_ms, std::sync::atomic::Ordering::Relaxed);

                                // Compute RMS signal level
                                let sum_sq: f32 = data.iter().map(|&s| s * s).sum();
                                let rms = (sum_sq / (data.len().max(1) as f32)).sqrt();
                                let level = if rms < 0.0012 { 0.0 } else { rms };
                                level_atomic.store(level.to_bits(), std::sync::atomic::Ordering::Relaxed);

                                gen.lock().push_loopback_samples(data, channels);
                            },
                            |err| log::warn!("Loopback input error: {err}"),
                            None,
                        )
                    },
                    cpal::SampleFormat::I16 => {
                        dev.build_input_stream(
                            &stream_config,
                            move |data: &[i16], _: &cpal::InputCallbackInfo| {
                                let now_ms = std::time::SystemTime::now()
                                    .duration_since(std::time::UNIX_EPOCH)
                                    .unwrap_or_default()
                                    .as_millis() as u64;
                                last_ts.store(now_ms, std::sync::atomic::Ordering::Relaxed);

                                let float_samples: Vec<f32> =
                                    data.iter().map(|&s| s as f32 / 32768.0).collect();

                                let sum_sq: f32 = float_samples.iter().map(|&s| s * s).sum();
                                let rms = (sum_sq / (float_samples.len().max(1) as f32)).sqrt();
                                let level = if rms < 0.0012 { 0.0 } else { rms };
                                level_atomic.store(level.to_bits(), std::sync::atomic::Ordering::Relaxed);

                                gen.lock().push_loopback_samples(&float_samples, channels);
                            },
                            |err| log::warn!("Loopback input error: {err}"),
                            None,
                        )
                    },
                    _ => return,
                };

                if let Ok(stream) = stream_res {
                    if stream.play().is_ok() {
                        log::info!("Successfully started live WASAPI loopback capture on {}", dev_name);
                        self.loopback_stream = Some(SafeStream(stream));
                    }
                }
            }
        }
    }

    pub fn set_master_volume(&mut self, volume: f32) {
        self.master_volume = volume.clamp(0.0, 1.0);
        self.apply_effective_volumes();
    }

    pub fn set_master_mute(&mut self, mute: bool) {
        self.master_mute = mute;
        self.apply_effective_volumes();
    }

    pub fn set_device_volume(&mut self, device_id: &str, volume: f32) {
        let v = volume.clamp(0.0, 1.0);
        self.device_volumes.insert(device_id.to_string(), v);
        self.apply_effective_device_volume(device_id);
    }

    pub fn set_device_mute(&mut self, device_id: &str, mute: bool) {
        self.device_mutes.insert(device_id.to_string(), mute);
        self.apply_effective_device_volume(device_id);
    }

    pub fn set_device_delay(&mut self, device_id: &str, delay_ms: u32) {
        let d = delay_ms.min(500);
        self.device_delays.insert(device_id.to_string(), d);
        if let Some(stream) = self.active_streams.get(device_id) {
            stream.set_delay_ms(d);
        }
    }

    pub fn set_device_effect(&mut self, device_id: &str, effect_code: u32) {
        self.device_effects.insert(device_id.to_string(), effect_code);
        if let Some(stream) = self.active_streams.get(device_id) {
            stream.set_effect(effect_code);
        }
    }

    fn apply_effective_volumes(&self) {
        for (id, stream) in &self.active_streams {
            let dev_vol = self.device_volumes.get(id).copied().unwrap_or(1.0);
            let effective_vol = if self.master_mute { 0.0 } else { dev_vol * self.master_volume };
            let dev_muted = self.device_mutes.get(id).copied().unwrap_or(false);
            stream.set_volume(effective_vol);
            stream.set_mute(dev_muted || self.master_mute);
        }
    }

    fn apply_effective_device_volume(&self, device_id: &str) {
        if let Some(stream) = self.active_streams.get(device_id) {
            let dev_vol = self.device_volumes.get(device_id).copied().unwrap_or(1.0);
            let effective_vol = if self.master_mute { 0.0 } else { dev_vol * self.master_volume };
            let dev_muted = self.device_mutes.get(device_id).copied().unwrap_or(false);
            stream.set_volume(effective_vol);
            stream.set_mute(dev_muted || self.master_mute);
        }
    }

    /// Starts simultaneous multi-device playback on all selected devices
    pub fn start(&mut self, selected_devices: &[AudioDevice]) -> Result<()> {
        if selected_devices.is_empty() {
            return Err(MultiWaveError::ValidationError(
                "No output devices selected. Please select at least one output device to play audio.".into(),
            ));
        }

        self.shared_generator.lock().set_tone_type(self.tone_type);

        // Remove active streams for devices that are no longer selected
        let selected_ids: std::collections::HashSet<&str> = selected_devices.iter().map(|d| d.id.as_str()).collect();
        self.active_streams.retain(|id, _| selected_ids.contains(id.as_str()));

        // Create and start streams for selected devices (excluding virtual capture sinks)
        for dev in selected_devices {
            let n_low = dev.name.to_lowercase();
            if dev.device_type == crate::models::audio_device::DeviceType::Virtual
                || n_low.contains("virtual")
                || n_low.contains("blackhole")
                || n_low.contains("soundflower")
                || n_low.contains("audiorelay")
                || n_low.contains("multiwave")
            {
                log::info!("Skipping output stream on virtual capture sink: {}", dev.name);
                continue;
            }

            if !self.active_streams.contains_key(&dev.id) {
                match DeviceManager::find_cpal_device(&dev.id, &dev.name) {
                    Ok(cpal_dev) => {
                        let vol = self.device_volumes.get(&dev.id).copied().unwrap_or(dev.software_volume);
                        let effective_vol = if self.master_mute { 0.0 } else { vol * self.master_volume };
                        let mute = self.device_mutes.get(&dev.id).copied().unwrap_or(dev.software_mute);
                        let delay = self.device_delays.get(&dev.id).copied().unwrap_or(dev.sync_delay_ms);
                        let effect = self.device_effects.get(&dev.id).copied().unwrap_or(0);

                        match OutputStream::new(
                            &cpal_dev,
                            dev.id.clone(),
                            dev.name.clone(),
                            effective_vol,
                            mute || self.master_mute,
                            delay,
                            effect,
                            self.shared_generator.clone(),
                        ) {
                            Ok(mut stream) => {
                                if let Err(e) = stream.play() {
                                    log::warn!("Failed to play stream on {}: {e}", dev.name);
                                }
                                self.active_streams.insert(dev.id.clone(), stream);
                            }
                            Err(e) => {
                                log::error!("Failed to initialize stream for {}: {e}", dev.name);
                            }
                        }
                    }
                    Err(e) => {
                        log::warn!("Could not match device {}: {e}", dev.name);
                    }
                }
            } else if let Some(stream) = self.active_streams.get_mut(&dev.id) {
                let _ = stream.play();
            }
        }

        if self.tone_type == ToneType::SystemLoopback {
            self.ensure_loopback_stream();
        }

        self.status = PlaybackStatus::Playing;
        self.apply_effective_volumes();
        Ok(())
    }

    pub fn pause(&mut self) -> Result<()> {
        if let Some(ref s) = self.loopback_stream {
            let _ = s.0.pause();
        }
        for stream in self.active_streams.values_mut() {
            let _ = stream.pause();
        }
        self.status = PlaybackStatus::Paused;
        Ok(())
    }

    pub fn resume(&mut self) -> Result<()> {
        if let Some(ref s) = self.loopback_stream {
            let _ = s.0.play();
        }
        for stream in self.active_streams.values_mut() {
            let _ = stream.play();
        }
        self.status = PlaybackStatus::Playing;
        Ok(())
    }

    pub fn stop(&mut self) -> Result<()> {
        self.loopback_stream = None;
        for stream in self.active_streams.values_mut() {
            let _ = stream.pause();
        }
        self.active_streams.clear();
        self.status = PlaybackStatus::Stopped;
        Ok(())
    }

    /// Test a single output device independently for 3 seconds
    pub fn test_single_device(&mut self, device: &AudioDevice) -> Result<()> {
        let cpal_dev = DeviceManager::find_cpal_device(&device.id, &device.name)?;
        let test_vol = self.device_volumes.get(&device.id).copied().unwrap_or(0.85);
        let effect = self.device_effects.get(&device.id).copied().unwrap_or(0);

        let mut stream = OutputStream::new(
            &cpal_dev,
            device.id.clone(),
            device.name.clone(),
            test_vol,
            false,
            0,
            effect,
            self.shared_generator.clone(),
        )?;

        stream.play()?;

        // Spawn a background timer to stop the test stream after 2.5 seconds
        std::thread::spawn(move || {
            std::thread::sleep(std::time::Duration::from_millis(2500));
            let _ = stream.pause();
        });

        Ok(())
    }

    pub fn get_metrics(&self) -> PlaybackMetrics {
        let active_count = self.active_streams.values().filter(|s| s.is_active()).count();
        let now_ms = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
        let last_ts = self.last_signal_timestamp.load(std::sync::atomic::Ordering::Relaxed);
        let raw_bits = self.input_signal_level.load(std::sync::atomic::Ordering::Relaxed);
        let raw_level = f32::from_bits(raw_bits);

        // If no audio packet received in the last 250ms or amplitude is below threshold, report exact silence (0.0)
        let input_level = if now_ms.saturating_sub(last_ts) > 250 || raw_level < 0.0012 {
            0.0
        } else {
            raw_level
        };

        PlaybackMetrics {
            status: self.status,
            active_stream_count: active_count,
            master_volume: self.master_volume,
            master_mute: self.master_mute,
            tone_type: self.tone_type,
            sample_rate: 48000,
            underrun_count: 0,
            input_level,
            capture_device: self.capture_device_name.lock().clone(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_loopback_on_virtual_speaker() {
        let host = cpal::default_host();
        let devices = host.output_devices().unwrap();
        let mut virtual_dev: Option<cpal::Device> = None;

        for dev in devices {
            if let Ok(name) = dev.name() {
                println!("Testing cpal output device: {name}");
                if name.to_lowercase().contains("virtual") {
                    virtual_dev = Some(dev);
                    break;
                }
            }
        }

        if let Some(dev) = virtual_dev {
            println!("Found virtual device: {:?}", dev.name());
            let config = dev.default_output_config().expect("default config");
            println!("Virtual device config: sample_rate={}, channels={}, format={:?}", config.sample_rate().0, config.channels(), config.sample_format());
            let stream = dev.build_input_stream(
                &config.config(),
                move |data: &[f32], _| {
                    let _ = data.len();
                },
                |err| println!("Error callback: {err}"),
                None,
            );
            assert!(stream.is_ok(), "Failed to build input stream on virtual speaker: {:?}", stream.err());
            println!("SUCCESSFULLY BUILT WASAPI LOOPBACK ON VIRTUAL SPEAKER!");
        } else {
            println!("No virtual device found in this test run");
        }
    }
}
