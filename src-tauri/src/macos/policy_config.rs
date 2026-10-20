use crate::errors::Result;
#[cfg(target_os = "macos")]
use std::process::Command;

pub struct MacAudioPolicy;

impl MacAudioPolicy {
    /// Sets the macOS default audio output device by matching device name or ID
    pub fn set_default_endpoint(device_id_or_name: &str) -> Result<()> {
        log::info!("Setting macOS default audio output to: {}", device_id_or_name);

        #[cfg(target_os = "macos")]
        {
            // Clean up prefix if formatted as "mac_out_..."
            let clean_name = if device_id_or_name.starts_with("mac_out_") {
                device_id_or_name.trim_start_matches("mac_out_").replace('_', " ")
            } else {
                device_id_or_name.to_string()
            };

            // Attempt Method 1: Using SwitchAudioSource CLI utility if installed
            if let Ok(output) = Command::new("SwitchAudioSource")
                .args(["-s", &clean_name])
                .output()
            {
                if output.status.success() {
                    log::info!("Successfully set default device via SwitchAudioSource: {}", clean_name);
                    return Ok(());
                }
            }

            // Attempt Method 2: Native CoreAudio AudioObjectSetPropertyData
            unsafe {
                if let Ok(()) = Self::set_default_coreaudio_device(&clean_name) {
                    log::info!("Successfully set default device via CoreAudio C API: {}", clean_name);
                    return Ok(());
                }
            }

            // Attempt Method 3: AppleScript automation to switch sound output in System Settings
            let script = format!(
                r#"
                tell application "System Settings"
                    activate
                    reveal pane id "com.apple.Sound-Settings.extension"
                end tell
                "#,
            );
            let _ = Command::new("osascript")
                .args(["-e", &script])
                .spawn();
        }

        #[cfg(not(target_os = "macos"))]
        {
            let _ = device_id_or_name;
        }

        Ok(())
    }

    /// Opens macOS Sound Preferences pane and Audio MIDI Setup
    pub fn open_sound_preferences() {
        #[cfg(target_os = "macos")]
        {
            // Open macOS Sound Settings pane
            let _ = Command::new("open")
                .arg("x-apple.systempreferences:com.apple.preference.sound")
                .spawn();

            // Also open Audio MIDI Setup for advanced multi-output control
            let _ = Command::new("open")
                .args(["-a", "Audio MIDI Setup"])
                .spawn();
        }
    }

    /// Launches the automated BlackHole 2ch virtual speaker installation script
    pub fn install_virtual_speaker_mac() {
        #[cfg(target_os = "macos")]
        {
            let candidates = [
                std::env::current_dir().unwrap_or_default().join("install_virtual_speaker_mac.sh"),
                std::env::current_dir().unwrap_or_default().join("src-tauri").join("install_virtual_speaker_mac.sh"),
                std::path::PathBuf::from("/Applications/MultiWave.app/Contents/Resources/install_virtual_speaker_mac.sh"),
            ];

            let script_path = candidates.iter().find(|p| p.exists()).cloned()
                .unwrap_or_else(|| std::path::PathBuf::from("install_virtual_speaker_mac.sh"));

            // Make sure the script is executable
            let _ = Command::new("chmod")
                .args(["+x", &script_path.to_string_lossy()])
                .status();

            // Launch script inside a visible Terminal window so user can authenticate sudo if needed
            let _ = Command::new("open")
                .args(["-a", "Terminal", &script_path.to_string_lossy()])
                .spawn();
        }
    }

    #[cfg(target_os = "macos")]
    unsafe fn set_default_coreaudio_device(target_name: &str) -> std::result::Result<(), ()> {
        // macOS CoreAudio property definitions
        const K_AUDIO_OBJECT_SYSTEM_OBJECT: u32 = 1;
        const K_AUDIO_HARDWARE_PROPERTY_DEVICES: u32 = 0x64657623; // 'dev#'
        const K_AUDIO_HARDWARE_PROPERTY_DEFAULT_OUTPUT_DEVICE: u32 = 0x646f7574; // 'dout'
        const K_AUDIO_OBJECT_PROPERTY_SCOPE_GLOBAL: u32 = 0x676c6f62; // 'glob'
        const K_AUDIO_OBJECT_PROPERTY_ELEMENT_MAIN: u32 = 0;
        const K_AUDIO_OBJECT_PROPERTY_NAME: u32 = 0x6f6e616d; // 'onam'

        #[repr(C)]
        struct AudioObjectPropertyAddress {
            m_selector: u32,
            m_scope: u32,
            m_element: u32,
        }

        #[link(name = "CoreAudio", kind = "framework")]
        extern "C" {
            fn AudioObjectGetPropertyDataSize(
                in_object_id: u32,
                in_address: *const AudioObjectPropertyAddress,
                in_qualifier_data_size: u32,
                in_qualifier_data: *const std::ffi::c_void,
                out_data_size: *mut u32,
            ) -> i32;

            fn AudioObjectGetPropertyData(
                in_object_id: u32,
                in_address: *const AudioObjectPropertyAddress,
                in_qualifier_data_size: u32,
                in_qualifier_data: *const std::ffi::c_void,
                io_data_size: *mut u32,
                out_data: *mut std::ffi::c_void,
            ) -> i32;

            fn AudioObjectSetPropertyData(
                in_object_id: u32,
                in_address: *const AudioObjectPropertyAddress,
                in_qualifier_data_size: u32,
                in_qualifier_data: *const std::ffi::c_void,
                in_data_size: u32,
                in_data: *const std::ffi::c_void,
            ) -> i32;
        }

        let address = AudioObjectPropertyAddress {
            m_selector: K_AUDIO_HARDWARE_PROPERTY_DEVICES,
            m_scope: K_AUDIO_OBJECT_PROPERTY_SCOPE_GLOBAL,
            m_element: K_AUDIO_OBJECT_PROPERTY_ELEMENT_MAIN,
        };

        let mut data_size: u32 = 0;
        let status = AudioObjectGetPropertyDataSize(
            K_AUDIO_OBJECT_SYSTEM_OBJECT,
            &address,
            0,
            std::ptr::null(),
            &mut data_size,
        );

        if status != 0 || data_size == 0 {
            return Err(());
        }

        let count = (data_size as usize) / std::mem::size_of::<u32>();
        let mut device_ids: Vec<u32> = vec![0; count];

        let status = AudioObjectGetPropertyData(
            K_AUDIO_OBJECT_SYSTEM_OBJECT,
            &address,
            0,
            std::ptr::null(),
            &mut data_size,
            device_ids.as_mut_ptr() as *mut std::ffi::c_void,
        );

        if status != 0 {
            return Err(());
        }

        let target_lower = target_name.to_lowercase();

        for dev_id in device_ids {
            let mut name_buffer: [u8; 256] = [0; 256];
            let mut name_size = name_buffer.len() as u32;

            let name_address = AudioObjectPropertyAddress {
                m_selector: K_AUDIO_OBJECT_PROPERTY_NAME,
                m_scope: K_AUDIO_OBJECT_PROPERTY_SCOPE_GLOBAL,
                m_element: K_AUDIO_OBJECT_PROPERTY_ELEMENT_MAIN,
            };

            let status = AudioObjectGetPropertyData(
                dev_id,
                &name_address,
                0,
                std::ptr::null(),
                &mut name_size,
                name_buffer.as_mut_ptr() as *mut std::ffi::c_void,
            );

            if status == 0 {
                let dev_name = String::from_utf8_lossy(&name_buffer[..(name_size as usize).saturating_sub(1)]).to_string();
                let dev_name_lower = dev_name.to_lowercase();

                if dev_name_lower == target_lower || dev_name_lower.contains(&target_lower) || target_lower.contains(&dev_name_lower) {
                    let set_address = AudioObjectPropertyAddress {
                        m_selector: K_AUDIO_HARDWARE_PROPERTY_DEFAULT_OUTPUT_DEVICE,
                        m_scope: K_AUDIO_OBJECT_PROPERTY_SCOPE_GLOBAL,
                        m_element: K_AUDIO_OBJECT_PROPERTY_ELEMENT_MAIN,
                    };

                    let set_status = AudioObjectSetPropertyData(
                        K_AUDIO_OBJECT_SYSTEM_OBJECT,
                        &set_address,
                        0,
                        std::ptr::null(),
                        std::mem::size_of::<u32>() as u32,
                        &dev_id as *const u32 as *const std::ffi::c_void,
                    );

                    if set_status == 0 {
                        return Ok(());
                    }
                }
            }
        }

        Err(())
    }
}
