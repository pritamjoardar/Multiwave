/// Real-time sample rate and channel layout converter for heterogeneous audio outputs

#[derive(Debug, Clone)]
pub struct Resampler {
    pub source_rate: u32,
    pub target_rate: u32,
    pub source_channels: usize,
    pub target_channels: usize,
    phase: f64,
    last_samples: [f32; 8], // Support up to 8 channels
}

impl Resampler {
    pub fn new(source_rate: u32, target_rate: u32, source_channels: usize, target_channels: usize) -> Self {
        Self {
            source_rate: source_rate.max(8000),
            target_rate: target_rate.max(8000),
            source_channels: source_channels.clamp(1, 8),
            target_channels: target_channels.clamp(1, 8),
            phase: 0.0,
            last_samples: [0.0; 8],
        }
    }

    /// Reset internal interpolation state
    pub fn reset(&mut self) {
        self.phase = 0.0;
        self.last_samples = [0.0; 8];
    }

    /// Map source channel frame to target channel count
    #[inline]
    pub fn map_channels(source_frame: &[f32], target_frame: &mut [f32]) {
        let src_len = source_frame.len();
        let dst_len = target_frame.len();

        if src_len == dst_len {
            target_frame.copy_from_slice(source_frame);
            return;
        }

        match (src_len, dst_len) {
            // Mono -> Stereo: duplicate channel
            (1, 2) => {
                target_frame[0] = source_frame[0];
                target_frame[1] = source_frame[0];
            }
            // Stereo -> Mono: downmix average
            (2, 1) => {
                target_frame[0] = (source_frame[0] + source_frame[1]) * 0.5;
            }
            // Stereo -> 5.1 / 7.1: Front L/R, Center = (L+R)*0.5, LFE = 0, Surrounds = L/R * 0.7
            (2, n) if n >= 6 => {
                target_frame[0] = source_frame[0]; // FL
                target_frame[1] = source_frame[1]; // FR
                target_frame[2] = (source_frame[0] + source_frame[1]) * 0.5; // Center
                target_frame[3] = 0.0; // LFE
                target_frame[4] = source_frame[0] * 0.7; // SL
                target_frame[5] = source_frame[1] * 0.7; // SR
                for i in 6..n {
                    target_frame[i] = 0.0;
                }
            }
            // Generic fallback
            _ => {
                for i in 0..dst_len {
                    target_frame[i] = if i < src_len { source_frame[i] } else { 0.0 };
                }
            }
        }
    }

    /// Process incoming interleaved source frames into interleaved target frames using linear interpolation
    pub fn process(&mut self, source_interleaved: &[f32], target_interleaved: &mut [f32]) {
        let src_channels = self.source_channels;
        let dst_channels = self.target_channels;
        let ratio = self.source_rate as f64 / self.target_rate as f64;

        let src_frames = source_interleaved.len() / src_channels;
        let dst_frames = target_interleaved.len() / dst_channels;

        let mut current_frame = [0.0f32; 8];
        let mut next_frame = [0.0f32; 8];
        let mut mapped_frame = [0.0f32; 8];

        for d in 0..dst_frames {
            let src_idx_f = self.phase;
            let src_idx = src_idx_f as usize;
            let frac = (src_idx_f - src_idx as f64) as f32;

            if src_idx < src_frames {
                for c in 0..src_channels {
                    current_frame[c] = source_interleaved[src_idx * src_channels + c];
                }
            } else {
                current_frame = self.last_samples;
            }

            if src_idx + 1 < src_frames {
                for c in 0..src_channels {
                    next_frame[c] = source_interleaved[(src_idx + 1) * src_channels + c];
                }
            } else {
                next_frame = current_frame;
            }

            // Interpolate source frame
            for c in 0..src_channels {
                current_frame[c] = current_frame[c] * (1.0 - frac) + next_frame[c] * frac;
            }

            // Map channels
            Self::map_channels(&current_frame[..src_channels], &mut mapped_frame[..dst_channels]);

            for c in 0..dst_channels {
                target_interleaved[d * dst_channels + c] = mapped_frame[c];
            }

            self.phase += ratio;
        }

        // Keep last sample for boundary continuity
        if src_frames > 0 {
            for c in 0..src_channels {
                self.last_samples[c] = source_interleaved[(src_frames - 1) * src_channels + c];
            }
        }

        // Wrap phase
        if self.phase >= src_frames as f64 {
            self.phase -= src_frames as f64;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_channel_mapping_stereo_to_mono() {
        let stereo = [1.0, 0.5];
        let mut mono = [0.0];
        Resampler::map_channels(&stereo, &mut mono);
        assert_eq!(mono[0], 0.75);
    }

    #[test]
    fn test_channel_mapping_mono_to_stereo() {
        let mono = [0.8];
        let mut stereo = [0.0, 0.0];
        Resampler::map_channels(&mono, &mut stereo);
        assert_eq!(stereo[0], 0.8);
        assert_eq!(stereo[1], 0.8);
    }

    #[test]
    fn test_resampling_ratio_one() {
        let mut resampler = Resampler::new(48000, 48000, 2, 2);
        let src = vec![0.5, -0.5, 0.2, -0.2];
        let mut dst = vec![0.0; 4];
        resampler.process(&src, &mut dst);
        assert_eq!(dst.len(), 4);
    }
}
