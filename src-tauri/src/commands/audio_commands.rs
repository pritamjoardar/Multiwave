use crate::commands::device_commands::AppState;
use crate::errors::{MultiWaveError, Result};
use crate::models::audio_device::DeviceType;
use crate::models::playback_state::{PlaybackMetrics, ToneType};
use crate::persistence::ConfigStore;
#[cfg(windows)]
use crate::windows::WindowsAudioPolicy;
#[cfg(target_os = "macos")]
use crate::macos::MacAudioPolicy;
use tauri::State;


#[tauri::command]
pub fn start_playback(state: State<'_, AppState>) -> Result<PlaybackMetrics> {
    let devices = state.devices.lock();
    let selected: Vec<_> = devices.iter().filter(|d| d.is_selected).cloned().collect();

    if selected.is_empty() {
        return Err(MultiWaveError::ValidationError(
            "No output devices selected. Please check at least one device.".into(),
        ));
    }

    let mut engine = state.engine.lock();
    engine.start(&selected)?;
    Ok(engine.get_metrics())
}

#[tauri::command]
pub fn pause_playback(state: State<'_, AppState>) -> Result<PlaybackMetrics> {
    let mut engine = state.engine.lock();
    engine.pause()?;
    Ok(engine.get_metrics())
}

#[tauri::command]
pub fn resume_playback(state: State<'_, AppState>) -> Result<PlaybackMetrics> {
    let mut engine = state.engine.lock();
    engine.resume()?;
    Ok(engine.get_metrics())
}

#[tauri::command]
pub fn stop_playback(state: State<'_, AppState>) -> Result<PlaybackMetrics> {
    let mut engine = state.engine.lock();
    engine.stop()?;
    Ok(engine.get_metrics())
}

#[tauri::command]
pub fn set_device_volume(device_id: String, volume: f32, state: State<'_, AppState>) -> Result<()> {
    let vol = volume.clamp(0.0, 1.0);

    {
        let mut devices = state.devices.lock();
        for dev in devices.iter_mut() {
            if dev.id == device_id {
                dev.software_volume = vol;
                break;
            }
        }
    }

    {
        let mut engine = state.engine.lock();
        engine.set_device_volume(&device_id, vol);
    }

    {
        let mut settings = state.settings.lock();
        settings.device_volumes.insert(device_id, vol);
        let _ = ConfigStore::save_settings(&settings);
    }

    Ok(())
}

#[tauri::command]
pub fn set_device_mute(device_id: String, mute: bool, state: State<'_, AppState>) -> Result<()> {
    {
        let mut devices = state.devices.lock();
        for dev in devices.iter_mut() {
            if dev.id == device_id {
                dev.software_mute = mute;
                break;
            }
        }
    }

    {
        let mut engine = state.engine.lock();
        engine.set_device_mute(&device_id, mute);
    }

    {
        let mut settings = state.settings.lock();
        settings.device_mutes.insert(device_id, mute);
        let _ = ConfigStore::save_settings(&settings);
    }

    Ok(())
}

#[tauri::command]
pub fn set_device_delay(device_id: String, delay_ms: u32, state: State<'_, AppState>) -> Result<()> {
    let d = delay_ms.min(500);

    {
        let mut devices = state.devices.lock();
        for dev in devices.iter_mut() {
            if dev.id == device_id {
                dev.sync_delay_ms = d;
                break;
            }
        }
    }

    {
        let mut engine = state.engine.lock();
        engine.set_device_delay(&device_id, d);
    }

    {
        let mut settings = state.settings.lock();
        settings.device_delays.insert(device_id, d);
        let _ = ConfigStore::save_settings(&settings);
    }

    Ok(())
}

#[tauri::command]
pub fn set_master_volume(volume: f32, state: State<'_, AppState>) -> Result<PlaybackMetrics> {
    let v = volume.clamp(0.0, 1.0);
    let mut engine = state.engine.lock();
    engine.set_master_volume(v);

    let mut settings = state.settings.lock();
    settings.master_volume = v;
    let _ = ConfigStore::save_settings(&settings);

    Ok(engine.get_metrics())
}

#[tauri::command]
pub fn set_master_mute(mute: bool, state: State<'_, AppState>) -> Result<PlaybackMetrics> {
    let mut engine = state.engine.lock();
    engine.set_master_mute(mute);

    let mut settings = state.settings.lock();
    settings.master_mute = mute;
    let _ = ConfigStore::save_settings(&settings);

    Ok(engine.get_metrics())
}

#[tauri::command]
pub fn set_tone_type(tone_type: ToneType, state: State<'_, AppState>) -> Result<PlaybackMetrics> {
    let mut engine = state.engine.lock();
    engine.set_tone_type(tone_type);

    let mut settings = state.settings.lock();
    settings.tone_type = tone_type;
    let _ = ConfigStore::save_settings(&settings);

    Ok(engine.get_metrics())
}

#[tauri::command]
pub fn test_output_device(device_id: String, state: State<'_, AppState>) -> Result<()> {
    let devices = state.devices.lock();
    let dev = devices
        .iter()
        .find(|d| d.id == device_id)
        .ok_or_else(|| MultiWaveError::DeviceNotFound(format!("Device ID {device_id} not found")))?
        .clone();

    let mut engine = state.engine.lock();
    engine.test_single_device(&dev)?;
    Ok(())
}

#[tauri::command]
pub fn get_playback_state(state: State<'_, AppState>) -> Result<PlaybackMetrics> {
    let engine = state.engine.lock();
    Ok(engine.get_metrics())
}

#[tauri::command]
pub fn set_capture_device(device_name: Option<String>, state: State<'_, AppState>) -> Result<PlaybackMetrics> {
    let mut engine = state.engine.lock();
    engine.set_capture_device(device_name);
    Ok(engine.get_metrics())
}

#[tauri::command]
pub fn open_windows_sound_settings() -> Result<()> {
    #[cfg(windows)]
    {
        let _ = std::process::Command::new("powershell")
            .args(["-NoProfile", "-Command", "Start-Process 'ms-settings:sound'"])
            .spawn();
    }
    #[cfg(target_os = "macos")]
    {
        crate::macos::MacAudioPolicy::open_sound_preferences();
    }
    Ok(())
}

#[tauri::command]
pub fn set_default_output_device(device_id: String) -> Result<()> {
    #[cfg(windows)]
    {
        WindowsAudioPolicy::set_default_endpoint(&device_id)
    }
    #[cfg(target_os = "macos")]
    {
        MacAudioPolicy::set_default_endpoint(&device_id)
    }
    #[cfg(not(any(windows, target_os = "macos")))]
    {
        let _ = device_id;
        Ok(())
    }
}

#[tauri::command]
pub fn activate_multiwave_routing(state: State<'_, AppState>) -> Result<PlaybackMetrics> {
    // 1. Locate virtual speaker in available devices (excluding redundant 16ch)
    let devices = state.devices.lock().clone();
    let virtual_dev = devices.iter().find(|d| {
        let n = d.name.to_lowercase();
        (d.device_type == DeviceType::Virtual
            || n.contains("virtual")
            || n.contains("blackhole")
            || n.contains("soundflower")
            || n.contains("audiorelay")
            || n.contains("multiwave")
            || n.contains("cable"))
            && !n.contains("16ch")
            && !n.contains("16 ch")
    }).cloned();

    if let Some(vdev) = virtual_dev {
        // Set system default audio endpoint to this virtual speaker
        #[cfg(windows)]
        let _ = WindowsAudioPolicy::set_default_endpoint(&vdev.id);

        #[cfg(target_os = "macos")]
        let _ = MacAudioPolicy::set_default_endpoint(&vdev.id);

        let mut engine = state.engine.lock();
        engine.set_capture_device(Some(vdev.name));

        // Select default physical device if none are currently selected
        let mut dev_guard = state.devices.lock();
        let any_selected = dev_guard.iter().any(|d| d.is_selected && d.device_type != DeviceType::Virtual);
        if !any_selected {
            if let Some(pos) = dev_guard.iter().position(|d| d.is_default && d.device_type != DeviceType::Virtual)
                .or_else(|| dev_guard.iter().position(|d| d.device_type != DeviceType::Virtual)) {
                dev_guard[pos].is_selected = true;
            }
        }

        let selected: Vec<_> = dev_guard.iter().filter(|d| d.is_selected).cloned().collect();
        drop(dev_guard);

        engine.start(&selected)?;
        Ok(engine.get_metrics())
    } else {
        // Automatically trigger installer if no virtual device is found
        let _ = install_virtual_speaker_driver();

        // Fallback: start loopback on current default device so playback is not blocked
        let mut dev_guard = state.devices.lock();
        let any_selected = dev_guard.iter().any(|d| d.is_selected);
        if !any_selected {
            if let Some(pos) = dev_guard.iter().position(|d| d.is_default && d.device_type != DeviceType::Virtual)
                .or_else(|| dev_guard.iter().position(|d| d.device_type != DeviceType::Virtual)) {
                dev_guard[pos].is_selected = true;
            }
        }
        let selected: Vec<_> = dev_guard.iter().filter(|d| d.is_selected).cloned().collect();
        drop(dev_guard);

        let mut engine = state.engine.lock();
        let _ = engine.start(&selected);

        Ok(engine.get_metrics())
    }
}

#[tauri::command]
pub fn install_virtual_speaker_driver() -> Result<()> {
    #[cfg(windows)]
    {
        let candidates = [
            std::env::current_dir().unwrap_or_default().join("install_virtual_speaker.ps1"),
            std::env::current_dir().unwrap_or_default().join("src-tauri").join("install_virtual_speaker.ps1"),
            std::path::PathBuf::from(r"c:\Users\prita\OneDrive\Desktop\MultiWave\install_virtual_speaker.ps1"),
            std::path::PathBuf::from(r"c:\Users\prita\OneDrive\Desktop\MultiWave\src-tauri\install_virtual_speaker.ps1"),
        ];

        let script_path = candidates.iter().find(|p| p.exists()).cloned()
            .unwrap_or_else(|| std::path::PathBuf::from("install_virtual_speaker.ps1"));

        let _ = std::process::Command::new("powershell")
            .args([
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                &format!(
                    "Start-Process powershell.exe -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"{}\"' -Verb RunAs",
                    script_path.display()
                ),
            ])
            .spawn();
    }
    #[cfg(target_os = "macos")]
    {
        MacAudioPolicy::install_virtual_speaker_mac();
    }
    Ok(())
}

#[tauri::command]
pub fn configure_virtual_speaker_name() -> Result<()> {
    #[cfg(windows)]
    {
        let exe_dir = std::env::current_dir().unwrap_or_default();
        let bat_path = exe_dir.join("setup_multiwave_virtual_speaker.bat");
        let _ = std::process::Command::new("cmd.exe")
            .args(["/c", bat_path.to_str().unwrap_or("setup_multiwave_virtual_speaker.bat")])
            .spawn();
    }
    #[cfg(target_os = "macos")]
    {
        // On macOS, launch Audio MIDI Setup
        let _ = std::process::Command::new("open")
            .args(["-a", "Audio MIDI Setup"])
            .spawn();
    }
    Ok(())
}


