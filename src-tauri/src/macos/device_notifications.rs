use crate::errors::Result;
use cpal::traits::{DeviceTrait, HostTrait};
use std::collections::HashSet;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

pub struct MacDeviceNotifier;

impl MacDeviceNotifier {
    /// Starts background monitoring for macOS audio device additions, removals, and default changes
    pub fn start_listening(app_handle: AppHandle) -> Result<()> {
        log::info!("Starting macOS CoreAudio device change monitor...");

        std::thread::spawn(move || {
            let mut last_device_names: HashSet<String> = HashSet::new();
            let mut last_default_device: Option<String> = None;

            // Initialize initial device fingerprint
            let host = cpal::default_host();
            if let Ok(devs) = host.output_devices() {
                for d in devs {
                    if let Ok(name) = d.name() {
                        last_device_names.insert(name);
                    }
                }
            }
            if let Some(def) = host.default_output_device() {
                last_default_device = def.name().ok();
            }

            loop {
                // Poll every 1.5 seconds for device changes (Bluetooth connect/disconnect, USB DAC plug/unplug)
                std::thread::sleep(Duration::from_millis(1500));

                let host = cpal::default_host();
                let mut current_names: HashSet<String> = HashSet::new();

                if let Ok(devs) = host.output_devices() {
                    for d in devs {
                        if let Ok(name) = d.name() {
                            current_names.insert(name);
                        }
                    }
                }

                let current_default = host.default_output_device().and_then(|d| d.name().ok());

                // Detect device connection / disconnection
                if current_names != last_device_names {
                    log::info!("macOS audio devices changed (connected/disconnected). Emitting device-state-changed event.");
                    last_device_names = current_names;
                    let _ = app_handle.emit("device-state-changed", ());
                }

                // Detect default audio device change
                if current_default != last_default_device {
                    log::info!("macOS default audio device changed to {:?}. Emitting default-device-changed event.", current_default);
                    last_default_device = current_default;
                    let _ = app_handle.emit("default-device-changed", ());
                }
            }
        });

        Ok(())
    }
}
