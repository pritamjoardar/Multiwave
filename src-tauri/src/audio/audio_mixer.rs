use crate::models::playback_state::ToneType;

const BUFFER_CAPACITY_FRAMES: usize = 96000; // 2 seconds of stereo audio at 48kHz

/// High-precision audio broadcast buffer and resampler for system loopback audio
pub struct ToneGenerator {
    pub sample_rate: u32,
    tone_type: ToneType,
    // Broadcast Loopback Ring Buffer (capacity * 2 samples for interleaved stereo)
    loopback_buffer: Vec<f32>,
    write_frame_total: usize,
}

impl ToneGenerator {
    pub fn new(sample_rate: u32, tone_type: ToneType) -> Self {
        Self {
            sample_rate: sample_rate.max(8000),
            tone_type,
            loopback_buffer: vec![0.0f32; BUFFER_CAPACITY_FRAMES * 2],
            write_frame_total: 0,
        }
    }

    pub fn set_tone_type(&mut self, tone_type: ToneType) {
        self.tone_type = tone_type;
    }

    /// Push live audio samples captured from Windows loopback (broadcasts to all active output devices)
    pub fn push_loopback_samples(&mut self, data: &[f32], channels: usize) {
        if channels == 0 || data.is_empty() {
            return;
        }

        let frame_count = data.len() / channels;

        for f in 0..frame_count {
            let (l, r) = match channels {
                1 => (data[f], data[f]),
                2 => (data[f * 2], data[f * 2 + 1]),
                _ => (data[f * channels], data[f * channels + 1]),
            };

            let buf_idx = ((self.write_frame_total + f) % BUFFER_CAPACITY_FRAMES) * 2;
            self.loopback_buffer[buf_idx] = l;
            self.loopback_buffer[buf_idx + 1] = r;
        }

        self.write_frame_total += frame_count;
    }

    /// Read audio from the broadcast loopback buffer and resample with continuous sub-sample linear interpolation
    /// directly into the target device's interleaved output slice.
    pub fn read_and_resample(
        &mut self,
        reader_frame: &mut usize,
        resampler_phase: &mut f64,
        target_interleaved: &mut [f32],
        target_rate: u32,
        target_channels: usize,
    ) {
        let dst_frames = target_interleaved.len() / target_channels.max(1);
        if dst_frames == 0 {
            return;
        }

        let ratio = self.sample_rate as f64 / target_rate.max(8000) as f64;
        let current_write = self.write_frame_total;

        // If this stream reader is uninitialized or fell behind by more than 1 second (48000 frames) or ahead of write:
        // re-align reader position with a smooth 20ms lead (960 frames at 48kHz)
        let lead_frames = (self.sample_rate as usize * 20) / 1000;
        if *reader_frame == 0
            || *reader_frame > current_write
            || current_write.saturating_sub(*reader_frame) > BUFFER_CAPACITY_FRAMES / 2
        {
            *reader_frame = current_write.saturating_sub(lead_frames);
            *resampler_phase = 0.0;
        }

        for d in 0..dst_frames {
            if *reader_frame < current_write {
                let f0 = *reader_frame % BUFFER_CAPACITY_FRAMES;
                let f1 = (*reader_frame + 1) % BUFFER_CAPACITY_FRAMES;

                let l0 = self.loopback_buffer[f0 * 2];
                let r0 = self.loopback_buffer[f0 * 2 + 1];

                let l1 = self.loopback_buffer[f1 * 2];
                let r1 = self.loopback_buffer[f1 * 2 + 1];

                let frac = *resampler_phase as f32;
                let l = l0 + (l1 - l0) * frac;
                let r = r0 + (r1 - r0) * frac;

                if target_channels == 2 {
                    target_interleaved[d * 2] = l;
                    target_interleaved[d * 2 + 1] = r;
                } else if target_channels == 1 {
                    target_interleaved[d] = (l + r) * 0.5;
                } else {
                    target_interleaved[d * target_channels] = l;
                    target_interleaved[d * target_channels + 1] = r;
                    for c in 2..target_channels {
                        target_interleaved[d * target_channels + c] = 0.0;
                    }
                }

                *resampler_phase += ratio;
                let step = resampler_phase.floor() as usize;
                *reader_frame += step;
                *resampler_phase -= step as f64;
            } else {
                // Underrun / silence when no more frames available
                for c in 0..target_channels {
                    target_interleaved[d * target_channels + c] = 0.0;
                }
            }
        }
    }

    /// Fills a buffer for a specific stream reader without consuming audio from other streams
    pub fn fill_stream_buffer(&mut self, reader_frame: &mut usize, buffer: &mut [f32]) {
        let mut phase = 0.0f64;
        self.read_and_resample(reader_frame, &mut phase, buffer, self.sample_rate, 2);
    }

    /// Fills a buffer with interleaved stereo samples
    pub fn fill_interleaved_stereo(&mut self, buffer: &mut [f32]) {
        let needed_frames = buffer.len() / 2;
        let mut r = self.write_frame_total.saturating_sub(needed_frames);
        self.fill_stream_buffer(&mut r, buffer);
    }
}

/// Ring-buffer delay line for audio stream synchronization (compensating Bluetooth delay)
#[derive(Debug, Clone)]
pub struct DelayLine {
    buffer: Vec<f32>,
    write_pos: usize,
    delay_samples: usize,
}

impl DelayLine {
    pub fn new(max_delay_samples: usize) -> Self {
        Self {
            buffer: vec![0.0; max_delay_samples.max(1)],
            write_pos: 0,
            delay_samples: 0,
        }
    }

    pub fn set_delay_samples(&mut self, delay_samples: usize) {
        self.delay_samples = delay_samples.min(self.buffer.len().saturating_sub(1));
    }

    /// Process a single sample through the delay line
    #[inline]
    pub fn process_sample(&mut self, input: f32) -> f32 {
        if self.delay_samples == 0 {
            return input;
        }

        let cap = self.buffer.len();
        self.buffer[self.write_pos] = input;

        let read_pos = (self.write_pos + cap - self.delay_samples) % cap;
        self.write_pos = (self.write_pos + 1) % cap;

        self.buffer[read_pos]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tone_generator_loopback_and_resampling() {
        let mut gen = ToneGenerator::new(48000, ToneType::SystemLoopback);
        // Push 100 frames of stereo test samples
        let input: Vec<f32> = (0..200).map(|i| (i as f32) * 0.005).collect();
        gen.push_loopback_samples(&input, 2);

        let mut output = vec![0.0f32; 100];
        let mut reader_frame = 0;
        let mut phase = 0.0f64;
        gen.read_and_resample(&mut reader_frame, &mut phase, &mut output, 44100, 2);

        // Verify audio is populated and bounded
        let max_val = output.iter().copied().fold(0.0f32, |m, v| m.max(v.abs()));
        assert!(max_val > 0.0);
        assert!(max_val <= 1.5);
    }

    #[test]
    fn test_delay_line() {
        let mut delay = DelayLine::new(10);
        delay.set_delay_samples(3);

        // Feed impulse: 1.0, 0.0, 0.0, 0.0...
        assert_eq!(delay.process_sample(1.0), 0.0);
        assert_eq!(delay.process_sample(0.0), 0.0);
        assert_eq!(delay.process_sample(0.0), 0.0);
        // At 4th sample, delayed impulse emerges
        assert_eq!(delay.process_sample(0.0), 1.0);
    }
}
