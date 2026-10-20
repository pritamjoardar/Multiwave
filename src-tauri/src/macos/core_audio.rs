use crate::errors::{MultiWaveError, Result};
use crate::models::audio_device::{AudioDevice, DeviceState, DeviceType};
use cpal::traits::{DeviceTrait, HostTrait};

pub struct MacCoreAudio;

impl MacCoreAudio {
    /// Enumerate all active audio render (output) endpoints on macOS using CoreAudio and cpal
    pub fn enumerate_output_devices() -> Result<Vec<AudioDevice>> {
        let host = cpal::default_host();
        let cpal_devices = host
            .output_devices()
            .map_err(|e| MultiWaveError::DeviceNotFound(format!("Failed to enumerate macOS audio devices: {e}")))?;

        let default_device_name = host.default_output_device().and_then(|d| d.name().ok());

        let mut devices = Vec::new();

        for dev in cpal_devices {
            let name = match dev.name() {
                Ok(n) => n,
                Err(_) => continue,
            };

            let name_lower = name.to_lowercase();

            // Suppress redundant 16-channel virtual devices to keep UI clean and prevent confusion
            if name_lower.contains("16ch") || name_lower.contains("16 ch") {
                continue;
            }

            let is_default = default_device_name.as_ref().map(|d| d == &name).unwrap_or(false);
            let dev_type = Self::classify_device(&name);

            // Create a deterministic unique ID for macOS endpoints
            let id = format!("mac_out_{}", name.replace(' ', "_").to_lowercase());

            let mut audio_dev = AudioDevice::new(id, name.clone());
            audio_dev.device_type = dev_type;
            audio_dev.is_default = is_default;
            audio_dev.is_default_comm = is_default;
            audio_dev.state = DeviceState::Active;

            // Extract default stream configuration
            if let Ok(config) = dev.default_output_config() {
                audio_dev.sample_rate = Some(config.sample_rate().0);
                audio_dev.channels = Some(config.channels());
            } else {
                audio_dev.sample_rate = Some(48000);
                audio_dev.channels = Some(2);
            }

            // On macOS, default software volume is 1.0
            audio_dev.software_volume = 1.0;
            audio_dev.software_mute = false;
            audio_dev.system_volume = Some(1.0);
            audio_dev.system_mute = Some(false);

            // Rename generic virtual audio sinks for branding consistency
            if dev_type == DeviceType::Virtual && !name_lower.contains("multiwave") {
                if name_lower.contains("blackhole") {
                    audio_dev.name = format!("MultiWave Virtual Speaker ({name})");
                }
            }

            devices.push(audio_dev);
        }

        // If no devices were found via default host, return empty or fallback
        Ok(devices)
    }

    /// Accurately classify macOS CoreAudio device names into standard MultiWave DeviceTypes
    pub fn classify_device(name: &str) -> DeviceType {
        let name_lower = name.to_lowercase();

        // 1. Virtual Audio Routing / BlackHole / MultiWave / Loopback
        if name_lower.contains("virtual")
            || name_lower.contains("blackhole")
            || name_lower.contains("soundflower")
            || name_lower.contains("multiwave")
            || name_lower.contains("audiorelay")
            || name_lower.contains("cable")
            || name_lower.contains("multi-output")
            || name_lower.contains("aggregate")
            || name_lower.contains("loopback")
        {
            return DeviceType::Virtual;
        }

        // 2. Bluetooth (AirPods, AirPods Pro, AirPods Max, Beats, Sony, etc.)
        if name_lower.contains("airpods")
            || name_lower.contains("bluetooth")
            || name_lower.contains("wireless")
            || name_lower.contains("wh-1000")
            || name_lower.contains("wf-1000")
            || name_lower.contains("buds")
            || name_lower.contains("beats")
            || name_lower.contains("bose")
            || name_lower.contains("sony")
            || name_lower.contains("jbl")
            || name_lower.contains("sennheiser")
            || name_lower.contains("freebuds")
            || name_lower.contains("galaxy buds")
            || name_lower.contains("neckband")
            || name_lower.contains("earbuds")
        {
            return DeviceType::Bluetooth;
        }

        // 3. USB Audio DACs, Audio Interfaces & Headsets
        if name_lower.contains("usb")
            || name_lower.contains("dac")
            || name_lower.contains("scarlett")
            || name_lower.contains("focusrite")
            || name_lower.contains("audioquest")
            || name_lower.contains("fiio")
            || name_lower.contains("schout")
            || name_lower.contains("yeti")
            || name_lower.contains("rode")
            || name_lower.contains("hyperx")
            || name_lower.contains("steelseries")
        {
            return DeviceType::Usb;
        }

        // 4. HDMI / DisplayPort / Thunderbolt Displays
        if name_lower.contains("hdmi")
            || name_lower.contains("displayport")
            || name_lower.contains("display")
            || name_lower.contains("studio display")
            || name_lower.contains("pro display")
            || name_lower.contains("lg")
            || name_lower.contains("dell")
            || name_lower.contains("samsung")
            || name_lower.contains("tv")
            || name_lower.contains("thunderbolt")
        {
            return DeviceType::HdmiDisplayPort;
        }

        // 5. Headset / External Headphones (3.5mm Headphone Jack)
        if name_lower.contains("headphone")
            || name_lower.contains("headset")
            || name_lower.contains("earphones")
            || name_lower.contains("external headphones")
        {
            return DeviceType::Headset;
        }

        // 6. Built-in MacBook Speakers / Internal Speakers
        if name_lower.contains("macbook")
            || name_lower.contains("internal")
            || name_lower.contains("built-in")
            || name_lower.contains("speakers")
            || name_lower.contains("speaker")
        {
            return DeviceType::AuxLine;
        }

        DeviceType::Unknown
    }
}
