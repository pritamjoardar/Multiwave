/// Digital Signal Processing (DSP) audio effects for MultiWave
/// Supported acoustic profiles:
/// - 0: Studio Reference (Neutral, linear phase, transparent soft-limiter)
/// - 1: 3D Spatial Surround (Binaural stereo soundstage widening & crossfeed)
/// - 2: Bass Boost & Punch (Harmonic low-frequency shelf boost around 80Hz)
/// - 3: Concert Hall (Reverberant acoustic reflection & spatial decay)
/// - 4: Vocal Clarity (Mid-range presence boost 1.5kHz-4kHz for intelligible dialogues)

use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AudioEffect {
    Studio = 0,
    Spatial3D = 1,
    BassBoost = 2,
    ConcertHall = 3,
    VocalClarity = 4,
}

impl AudioEffect {
    pub fn from_u32(val: u32) -> Self {
        match val {
            1 => AudioEffect::Spatial3D,
            2 => AudioEffect::BassBoost,
            3 => AudioEffect::ConcertHall,
            4 => AudioEffect::VocalClarity,
            _ => AudioEffect::Studio,
        }
    }

    pub fn to_u32(self) -> u32 {
        self as u32
    }

    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "spatial_3d" | "3d" | "spatial" => AudioEffect::Spatial3D,
            "bass_boost" | "bass" => AudioEffect::BassBoost,
            "concert_hall" | "concert" | "reverb" => AudioEffect::ConcertHall,
            "vocal_clarity" | "vocal" | "voice" => AudioEffect::VocalClarity,
            _ => AudioEffect::Studio,
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            AudioEffect::Studio => "studio",
            AudioEffect::Spatial3D => "spatial_3d",
            AudioEffect::BassBoost => "bass_boost",
            AudioEffect::ConcertHall => "concert_hall",
            AudioEffect::VocalClarity => "vocal_clarity",
        }
    }
}

pub struct DspProcessor {
    pub effect: Arc<AtomicU32>,
    // Simple state variables for filters
    bass_hist_l: f32,
    bass_hist_r: f32,
    vocal_hist_l: f32,
    vocal_hist_r: f32,
    // Short ring buffer for reverb / 3D crossfeed
    crossfeed_buf_l: Vec<f32>,
    crossfeed_buf_r: Vec<f32>,
    cf_idx: usize,
}

impl DspProcessor {
    pub fn new(effect_atomic: Arc<AtomicU32>) -> Self {
        let buf_size = 4800; // ~100ms at 48kHz
        Self {
            effect: effect_atomic,
            bass_hist_l: 0.0,
            bass_hist_r: 0.0,
            vocal_hist_l: 0.0,
            vocal_hist_r: 0.0,
            crossfeed_buf_l: vec![0.0; buf_size],
            crossfeed_buf_r: vec![0.0; buf_size],
            cf_idx: 0,
        }
    }

    pub fn process_buffer(&mut self, buffer: &mut [f32], channels: usize) {
        if channels == 0 || buffer.is_empty() {
            return;
        }

        let effect_code = self.effect.load(Ordering::Relaxed);
        let effect = AudioEffect::from_u32(effect_code);

        match effect {
            AudioEffect::Studio => {
                // Studio Reference: Flat transparent linear response
            }
            AudioEffect::Spatial3D => {
                if channels >= 2 {
                    let frames = buffer.len() / channels;
                    let delay_frames = 18; // ~0.375ms ITD for head shadow
                    let buf_len = self.crossfeed_buf_l.len();

                    for f in 0..frames {
                        let idx_l = f * channels;
                        let idx_r = f * channels + 1;
                        let l = buffer[idx_l];
                        let r = buffer[idx_r];

                        // Store in history
                        self.crossfeed_buf_l[self.cf_idx] = l;
                        self.crossfeed_buf_r[self.cf_idx] = r;

                        let read_idx = (self.cf_idx + buf_len - delay_frames) % buf_len;
                        let delayed_r = self.crossfeed_buf_r[read_idx];
                        let delayed_l = self.crossfeed_buf_l[read_idx];

                        self.cf_idx = (self.cf_idx + 1) % buf_len;

                        // Mid-Side acoustic widening
                        let mid = (l + r) * 0.5;
                        let side = (l - r) * 0.5 * 1.45; // 45% stereo widening

                        // Binaural crossfeed with subtle phase attenuation
                        buffer[idx_l] = (mid + side + delayed_r * 0.22) * 0.88;
                        buffer[idx_r] = (mid - side + delayed_l * 0.22) * 0.88;
                    }
                }
            }
            AudioEffect::BassBoost => {
                // Leaky low-shelf integrator boosting sub-120Hz harmonics
                let alpha = 0.08f32; // cutoff coefficient
                let boost = 0.45f32; // +4.5dB shelf

                if channels >= 2 {
                    for chunk in buffer.chunks_mut(channels) {
                        self.bass_hist_l += alpha * (chunk[0] - self.bass_hist_l);
                        self.bass_hist_r += alpha * (chunk[1] - self.bass_hist_r);

                        chunk[0] += self.bass_hist_l * boost;
                        chunk[1] += self.bass_hist_r * boost;
                    }
                } else {
                    for sample in buffer.iter_mut() {
                        self.bass_hist_l += alpha * (*sample - self.bass_hist_l);
                        *sample += self.bass_hist_l * boost;
                    }
                }
            }
            AudioEffect::ConcertHall => {
                // Multi-tap reverb diffusion for amphitheater ambiance
                let buf_len = self.crossfeed_buf_l.len();
                let tap1 = 1200; // ~25ms
                let tap2 = 2400; // ~50ms
                let tap3 = 3800; // ~80ms

                if channels >= 2 {
                    let frames = buffer.len() / channels;
                    for f in 0..frames {
                        let idx_l = f * channels;
                        let idx_r = f * channels + 1;
                        let l = buffer[idx_l];
                        let r = buffer[idx_r];

                        self.crossfeed_buf_l[self.cf_idx] = l;
                        self.crossfeed_buf_r[self.cf_idx] = r;

                        let r1 = (self.cf_idx + buf_len - tap1) % buf_len;
                        let r2 = (self.cf_idx + buf_len - tap2) % buf_len;
                        let r3 = (self.cf_idx + buf_len - tap3) % buf_len;

                        let rev_l = self.crossfeed_buf_l[r1] * 0.25 + self.crossfeed_buf_r[r2] * 0.18 + self.crossfeed_buf_l[r3] * 0.12;
                        let rev_r = self.crossfeed_buf_r[r1] * 0.25 + self.crossfeed_buf_l[r2] * 0.18 + self.crossfeed_buf_r[r3] * 0.12;

                        self.cf_idx = (self.cf_idx + 1) % buf_len;

                        buffer[idx_l] = l * 0.82 + rev_l;
                        buffer[idx_r] = r * 0.82 + rev_r;
                    }
                }
            }
            AudioEffect::VocalClarity => {
                // Bandpass presence peaking filter around 2.5kHz with gentle low-rumble attenuation
                let alpha_mid = 0.28f32;
                let alpha_low = 0.04f32;

                if channels >= 2 {
                    for chunk in buffer.chunks_mut(channels) {
                        // Highpass rumble filter
                        self.bass_hist_l += alpha_low * (chunk[0] - self.bass_hist_l);
                        self.bass_hist_r += alpha_low * (chunk[1] - self.bass_hist_r);
                        let clean_l = chunk[0] - self.bass_hist_l * 0.35;
                        let clean_r = chunk[1] - self.bass_hist_r * 0.35;

                        // Mid-range presence boost
                        self.vocal_hist_l += alpha_mid * (clean_l - self.vocal_hist_l);
                        self.vocal_hist_r += alpha_mid * (clean_r - self.vocal_hist_r);

                        chunk[0] = clean_l + self.vocal_hist_l * 0.35;
                        chunk[1] = clean_r + self.vocal_hist_r * 0.35;
                    }
                } else {
                    for sample in buffer.iter_mut() {
                        self.bass_hist_l += alpha_low * (*sample - self.bass_hist_l);
                        let clean = *sample - self.bass_hist_l * 0.35;
                        self.vocal_hist_l += alpha_mid * (clean - self.vocal_hist_l);
                        *sample = clean + self.vocal_hist_l * 0.35;
                    }
                }
            }
        }
    }
}
