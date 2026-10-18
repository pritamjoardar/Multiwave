/// Audio volume and gain calculation utilities with perceptual curve and soft limiting

#[derive(Debug, Clone, Copy)]
pub struct VolumeGain {
    pub volume: f32, // 0.0 to 1.0
    pub is_muted: bool,
}

impl Default for VolumeGain {
    fn default() -> Self {
        Self {
            volume: 1.0,
            is_muted: false,
        }
    }
}

impl VolumeGain {
    pub fn new(volume: f32, is_muted: bool) -> Self {
        Self {
            volume: volume.clamp(0.0, 1.0),
            is_muted,
        }
    }

    /// Calculate linear multiplier from volume [0.0, 1.0] using a cubic perceptual curve
    #[inline]
    pub fn calculate_gain(&self) -> f32 {
        if self.is_muted || self.volume <= 0.0001 {
            return 0.0;
        }
        if self.volume >= 0.9999 {
            return 1.0;
        }
        // Perceptual audio taper: gain = volume^2.5
        self.volume.powf(2.5)
    }
}

/// Smooth single-sample limiter / soft clipper to avoid harsh digital overflow
#[inline]
pub fn soft_limiter(sample: f32) -> f32 {
    if sample > 1.2 {
        1.0
    } else if sample < -1.2 {
        -1.0
    } else if sample > 0.6 {
        let diff = sample - 0.6;
        0.6 + diff / (1.0 + diff * diff * 0.8)
    } else if sample < -0.6 {
        let diff = sample + 0.6;
        -0.6 + diff / (1.0 + diff * diff * 0.8)
    } else {
        sample
    }
}

/// Applies gain with soft limiting to an audio buffer in-place
pub fn apply_gain_and_limit(buffer: &mut [f32], gain: f32) {
    if gain <= 0.00001 {
        for s in buffer.iter_mut() {
            *s = 0.0;
        }
        return;
    }

    for s in buffer.iter_mut() {
        *s = soft_limiter(*s * gain);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_volume_clamping() {
        let vg_low = VolumeGain::new(-0.5, false);
        assert_eq!(vg_low.volume, 0.0);
        assert_eq!(vg_low.calculate_gain(), 0.0);

        let vg_high = VolumeGain::new(1.5, false);
        assert_eq!(vg_high.volume, 1.0);
        assert_eq!(vg_high.calculate_gain(), 1.0);
    }

    #[test]
    fn test_mute_behavior() {
        let vg = VolumeGain::new(0.8, true);
        assert_eq!(vg.calculate_gain(), 0.0);
    }

    #[test]
    fn test_soft_limiter_range() {
        assert_eq!(soft_limiter(0.0), 0.0);
        assert!(soft_limiter(0.5) <= 0.5);
        assert!(soft_limiter(2.0) <= 1.0);
        assert!(soft_limiter(-2.0) >= -1.0);
    }
}
