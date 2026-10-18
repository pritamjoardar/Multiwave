use crate::errors::{MultiWaveError, Result};
use crate::models::audio_device::AudioDevice;
use crate::windows::WindowsCoreAudio;
use cpal::traits::{DeviceTrait, HostTrait};

pub struct DeviceManager;

impl DeviceManager {
    /// Retrieve full enumerated audio output devices with Core Audio properties + cpal stream capabilities
    pub fn get_available_devices() -> Result<Vec<AudioDevice>> {
        // Fast enumeration directly from Windows Core Audio WASAPI endpoints (~5ms instead of 2000ms)
        WindowsCoreAudio::enumerate_output_devices()
    }

    /// Find a cpal::Device that matches the given device ID or device name
    pub fn find_cpal_device(device_id: &str, device_name: &str) -> Result<cpal::Device> {
        let host = cpal::default_host();
        let devices = host
            .output_devices()
            .map_err(|e| MultiWaveError::DeviceNotFound(format!("Failed to enumerate cpal devices: {e}")))?;

        let mut matched: Option<cpal::Device> = None;
        let target_lower = device_name.to_lowercase();
        let is_virtual_target = target_lower.contains("virtual") || target_lower.contains("multiwave") || target_lower.contains("cable");

        for dev in devices {
            if let Ok(name) = dev.name() {
                let name_lower = name.to_lowercase();
                // Never match the 16ch endpoint
                if name_lower.contains("16ch") || name_lower.contains("16 ch") {
                    continue;
                }

                if is_virtual_target && (name_lower.contains("cable input") || name_lower.contains("multiwave") || name_lower.contains("virtual cable")) {
                    matched = Some(dev);
                    break;
                }

                if name == device_name || device_name.contains(&name) || name.contains(device_name) {
                    matched = Some(dev);
                    break;
                }
            }
        }

        if let Some(dev) = matched {
            Ok(dev)
        } else if let Some(def_dev) = host.default_output_device() {
            log::info!("Device {} fell back to default cpal output device", device_name);
            Ok(def_dev)
        } else {
            Err(MultiWaveError::DeviceNotFound(format!(
                "Could not find audio device '{}' (ID: {})",
                device_name, device_id
            )))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_enumerate_devices() {
        let devs = DeviceManager::get_available_devices().unwrap_or_default();
        println!("Detected devices: {}", devs.len());
        for d in &devs {
            println!("Device: {} (Type: {:?}, Default: {})", d.name, d.device_type, d.is_default);
        }

        let host = cpal::default_host();
        let cpal_devs = host.output_devices().unwrap();
        println!("\n--- CPAL Output Devices ---");
        for cd in cpal_devs {
            if let Ok(name) = cd.name() {
                let cfg = cd.default_output_config();
                println!("CPAL dev: '{}' -> cfg: {:?}", name, cfg);
            }
        }
    }
}
