use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use super::playback_state::ToneType;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub selected_device_ids: Vec<String>,
    pub device_volumes: HashMap<String, f32>,
    pub device_mutes: HashMap<String, bool>,
    pub device_delays: HashMap<String, u32>,
    pub master_volume: f32,
    pub master_mute: bool,
    pub tone_type: ToneType,
    pub buffer_size_frames: Option<u32>,
    pub theme: String,
    pub auto_reconnect: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            selected_device_ids: Vec::new(),
            device_volumes: HashMap::new(),
            device_mutes: HashMap::new(),
            device_delays: HashMap::new(),
            master_volume: 1.0,
            master_mute: false,
            tone_type: ToneType::SystemLoopback,
            buffer_size_frames: None,
            theme: "dark".to_string(),
            auto_reconnect: true,
        }
    }
}
