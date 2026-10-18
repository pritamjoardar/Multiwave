use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DeviceType {
    Bluetooth,
    Usb,
    AuxLine,
    HdmiDisplayPort,
    Headset,
    Virtual,
    Unknown,
}

impl Default for DeviceType {
    fn default() -> Self {
        DeviceType::Unknown
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DeviceState {
    Active,
    Disabled,
    Unplugged,
    NotPresent,
}

impl Default for DeviceState {
    fn default() -> Self {
        DeviceState::Active
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub device_type: DeviceType,
    pub is_default: bool,
    pub is_default_comm: bool,
    pub state: DeviceState,
    pub is_selected: bool,
    pub software_volume: f32, // 0.0 to 1.0
    pub software_mute: bool,
    pub system_volume: Option<f32>, // 0.0 to 1.0 (from Windows Core Audio)
    pub system_mute: Option<bool>,
    pub sample_rate: Option<u32>,
    pub channels: Option<u16>,
    pub sync_delay_ms: u32, // 0 to 500ms delay compensation
    pub is_active_streaming: bool,
    pub error_message: Option<String>,
}

impl AudioDevice {
    pub fn new(id: String, name: String) -> Self {
        Self {
            id,
            name,
            device_type: DeviceType::Unknown,
            is_default: false,
            is_default_comm: false,
            state: DeviceState::Active,
            is_selected: false,
            software_volume: 1.0,
            software_mute: false,
            system_volume: None,
            system_mute: None,
            sample_rate: None,
            channels: None,
            sync_delay_ms: 0,
            is_active_streaming: false,
            error_message: None,
        }
    }
}
