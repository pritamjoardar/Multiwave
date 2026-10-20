use crate::audio::DeviceManager;
use crate::errors::{MultiWaveError, Result};
use crate::models::audio_device::AudioDevice;
use crate::models::settings::AppSettings;
use crate::persistence::ConfigStore;
use parking_lot::Mutex;
use std::collections::HashSet;
use tauri::State;

pub struct AppState {
    pub engine: Mutex<crate::audio::PlaybackEngine>,
    pub devices: Mutex<Vec<AudioDevice>>,
    pub settings: Mutex<AppSettings>,
}

#[tauri::command]
pub fn get_audio_devices(state: State<'_, AppState>) -> Result<Vec<AudioDevice>> {
    let mut current_devices = DeviceManager::get_available_devices()?;
    let settings = state.settings.lock();

    let selected_set: HashSet<&str> = settings.selected_device_ids.iter().map(|s| s.as_str()).collect();

    if !selected_set.is_empty() {
        for dev in current_devices.iter_mut() {
            if selected_set.contains(dev.id.as_str()) {
                dev.is_selected = true;
            }
        }
    } else {
        // Only select the single default physical audio device on first launch (do not mix all devices)
        let default_id = current_devices.iter()
            .find(|d| d.is_default && d.device_type != crate::models::audio_device::DeviceType::Virtual)
            .or_else(|| current_devices.iter().find(|d| d.device_type != crate::models::audio_device::DeviceType::Virtual))
            .map(|d| d.id.clone());

        if let Some(ref target_id) = default_id {
            for dev in current_devices.iter_mut() {
                if dev.id == *target_id {
                    dev.is_selected = true;
                    break;
                }
            }
        }
    }

    let engine = state.engine.lock();
    for dev in current_devices.iter_mut() {
        dev.is_active_streaming = engine.is_stream_active(&dev.id);
        if let Some(&vol) = settings.device_volumes.get(&dev.id) {
            dev.software_volume = vol;
        }
        if let Some(&mute) = settings.device_mutes.get(&dev.id) {
            dev.software_mute = mute;
        }
        if let Some(&delay) = settings.device_delays.get(&dev.id) {
            dev.sync_delay_ms = delay;
        }
    }
    drop(engine);

    *state.devices.lock() = current_devices.clone();
    Ok(current_devices)
}

#[tauri::command]
pub fn refresh_audio_devices(state: State<'_, AppState>) -> Result<Vec<AudioDevice>> {
    get_audio_devices(state)
}

#[tauri::command]
pub fn select_output_device(device_id: String, state: State<'_, AppState>) -> Result<()> {
    let mut devices = state.devices.lock();
    let mut found = false;
    for dev in devices.iter_mut() {
        if dev.id == device_id {
            dev.is_selected = true;
            found = true;
            break;
        }
    }

    if !found {
        return Err(MultiWaveError::DeviceNotFound(format!("Device ID {device_id} not found")));
    }

    let mut settings = state.settings.lock();
    if !settings.selected_device_ids.contains(&device_id) {
        settings.selected_device_ids.push(device_id.clone());
        let _ = ConfigStore::save_settings(&settings);
    }

    // Dynamically add to live audio stream if currently playing
    let mut engine = state.engine.lock();
    if engine.is_playing() {
        let selected: Vec<_> = devices.iter().filter(|d| d.is_selected).cloned().collect();
        let _ = engine.start(&selected);
    }

    Ok(())
}

#[tauri::command]
pub fn deselect_output_device(device_id: String, state: State<'_, AppState>) -> Result<()> {
    let mut devices = state.devices.lock();
    for dev in devices.iter_mut() {
        if dev.id == device_id {
            dev.is_selected = false;
            dev.is_active_streaming = false;
            break;
        }
    }

    let mut settings = state.settings.lock();
    settings.selected_device_ids.retain(|id| id != &device_id);
    let _ = ConfigStore::save_settings(&settings);

    // Dynamically stop stream for this device
    let mut engine = state.engine.lock();
    if engine.is_playing() {
        engine.remove_stream(&device_id);
    }

    Ok(())
}

#[tauri::command]
pub fn select_all_devices(state: State<'_, AppState>) -> Result<()> {
    let mut devices = state.devices.lock();
    let mut settings = state.settings.lock();

    settings.selected_device_ids.clear();
    for dev in devices.iter_mut() {
        if dev.device_type != crate::models::audio_device::DeviceType::Virtual {
            dev.is_selected = true;
            settings.selected_device_ids.push(dev.id.clone());
        }
    }

    let _ = ConfigStore::save_settings(&settings);

    let mut engine = state.engine.lock();
    if engine.is_playing() {
        let selected: Vec<_> = devices.iter().filter(|d| d.is_selected).cloned().collect();
        let _ = engine.start(&selected);
    }

    Ok(())
}

#[tauri::command]
pub fn deselect_all_devices(state: State<'_, AppState>) -> Result<()> {
    let mut devices = state.devices.lock();
    let mut settings = state.settings.lock();

    settings.selected_device_ids.clear();
    for dev in devices.iter_mut() {
        dev.is_selected = false;
        dev.is_active_streaming = false;
    }

    let _ = ConfigStore::save_settings(&settings);

    let mut engine = state.engine.lock();
    if engine.is_playing() {
        let _ = engine.stop();
    }

    Ok(())
}

