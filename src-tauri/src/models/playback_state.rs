use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PlaybackStatus {
    Stopped,
    Playing,
    Paused,
}

impl Default for PlaybackStatus {
    fn default() -> Self {
        PlaybackStatus::Stopped
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ToneType {
    SystemLoopback,
    MelodyArpeggio,
    MajorChord,
    Sine440,
    Sine880,
    PinkNoise,
    WhiteNoise,
}

impl Default for ToneType {
    fn default() -> Self {
        ToneType::SystemLoopback
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybackMetrics {
    pub status: PlaybackStatus,
    pub active_stream_count: usize,
    pub master_volume: f32,
    pub master_mute: bool,
    pub tone_type: ToneType,
    pub sample_rate: u32,
    pub underrun_count: u64,
    pub input_level: f32,
    pub capture_device: String,
}

impl Default for PlaybackMetrics {
    fn default() -> Self {
        Self {
            status: PlaybackStatus::Stopped,
            active_stream_count: 0,
            master_volume: 1.0,
            master_mute: false,
            tone_type: ToneType::SystemLoopback,
            sample_rate: 48000,
            underrun_count: 0,
            input_level: 0.0,
            capture_device: "Virtual Speakers (Auto)".to_string(),
        }
    }
}
