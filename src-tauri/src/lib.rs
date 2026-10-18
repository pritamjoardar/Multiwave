pub mod audio;
pub mod commands;
pub mod errors;
pub mod models;
pub mod persistence;
pub mod windows;

use commands::device_commands::AppState;
use parking_lot::Mutex;
use persistence::ConfigStore;
use tauri::Manager;
use windows::device_notifications::DeviceNotifier;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let settings = ConfigStore::load_settings();
    let mut engine = audio::PlaybackEngine::new();
    engine.set_master_volume(settings.master_volume);
    engine.set_master_mute(settings.master_mute);
    engine.set_tone_type(settings.tone_type);

    let app_state = AppState {
        engine: Mutex::new(engine),
        devices: Mutex::new(Vec::new()),
        settings: Mutex::new(settings),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .setup(|app| {
            let handle = app.handle().clone();
            // Start listening for Windows Core Audio device notifications
            if let Err(e) = DeviceNotifier::start_listening(handle.clone()) {
                log::warn!("Could not start Windows Core Audio device listener: {e}");
            }

            // Run initial device setup and audio routing on a BACKGROUND thread
            // so the main UI window message loop starts instantly without freezing (eliminates "Not Responding")!
            let app_handle_bg = app.handle().clone();
            std::thread::spawn(move || {
                let state = app_handle_bg.state::<AppState>();
                if let Ok(mut current_devices) = audio::DeviceManager::get_available_devices() {
                    // 1. Locate genuine stereo virtual speaker endpoint (exclude redundant 16ch)
                    let virtual_dev = current_devices.iter().find(|d| {
                        let n = d.name.to_lowercase();
                        (d.device_type == models::audio_device::DeviceType::Virtual
                            || n.contains("virtual")
                            || n.contains("audiorelay")
                            || n.contains("multiwave")
                            || n.contains("cable"))
                            && !n.contains("16ch")
                            && !n.contains("16 ch")
                    }).cloned();

                    if let Some(vdev) = virtual_dev {
                        // Extract GUID from ID (e.g. {0.0.0.00000000}.{ed382e76-6803-46b5-b67e-04866917a932})
                        if let Some(pos) = vdev.id.rfind(".{") {
                            let guid = &vdev.id[pos + 1..];
                            let _ = windows::WindowsAudioPolicy::rename_endpoint_to_multiwave(guid);
                        } else if vdev.id.starts_with('{') {
                            let _ = windows::WindowsAudioPolicy::rename_endpoint_to_multiwave(&vdev.id);
                        }

                        // Set Windows default audio endpoint to MultiWave Virtual Speaker
                        if let Err(e) = windows::WindowsAudioPolicy::set_default_endpoint(&vdev.id) {
                            log::warn!("Failed to set default endpoint to virtual speaker: {e}");
                        } else {
                            log::info!("Windows default audio output successfully set to MultiWave Virtual Speaker!");
                        }

                        let mut engine = state.engine.lock();
                        engine.set_capture_device(Some(vdev.name));

                        // 2. Auto-select physical devices
                        // 2. Select saved devices or only the default physical device (never mix all devices by default)
                        let settings = state.settings.lock();
                        let saved_ids: std::collections::HashSet<&str> = settings.selected_device_ids.iter().map(|s| s.as_str()).collect();

                        if !saved_ids.is_empty() {
                            for dev in current_devices.iter_mut() {
                                if saved_ids.contains(dev.id.as_str()) {
                                    dev.is_selected = true;
                                }
                            }
                        } else {
                            // Select ONLY the default physical audio device
                            let default_id = current_devices.iter()
                                .find(|d| d.is_default && d.device_type != models::audio_device::DeviceType::Virtual)
                                .or_else(|| current_devices.iter().find(|d| d.device_type != models::audio_device::DeviceType::Virtual))
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

                        let selected: Vec<_> = current_devices.iter().filter(|d| d.is_selected).cloned().collect();
                        drop(settings);

                        // 3. Automatically start playback broadcast for selected device(s)
                        if !selected.is_empty() {
                            if let Err(e) = engine.start(&selected) {
                                log::warn!("Auto-playback start notice: {e}");
                            } else {
                                log::info!("MultiWave auto-started live loopback broadcast on {} devices", selected.len());
                            }
                        }
                    } else {
                        // Automatically trigger virtual speaker installation if missing on launch
                        log::info!("No virtual speaker found on startup. Automatically launching driver installer...");
                        let _ = commands::install_virtual_speaker_driver();

                        let settings = state.settings.lock();
                        let saved_ids: std::collections::HashSet<&str> = settings.selected_device_ids.iter().map(|s| s.as_str()).collect();

                        if !saved_ids.is_empty() {
                            for dev in current_devices.iter_mut() {
                                if saved_ids.contains(dev.id.as_str()) {
                                    dev.is_selected = true;
                                }
                            }
                        } else {
                            let default_id = current_devices.iter()
                                .find(|d| d.is_default && d.device_type != models::audio_device::DeviceType::Virtual)
                                .or_else(|| current_devices.iter().find(|d| d.device_type != models::audio_device::DeviceType::Virtual))
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
                    }

                    *state.devices.lock() = current_devices;
                    use tauri::Emitter;
                    let _ = app_handle_bg.emit("device-state-changed", ());
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_audio_devices,
            commands::refresh_audio_devices,
            commands::select_output_device,
            commands::deselect_output_device,
            commands::select_all_devices,
            commands::deselect_all_devices,
            commands::set_device_volume,
            commands::set_device_mute,
            commands::set_device_delay,
            commands::set_master_volume,
            commands::set_master_mute,
            commands::set_tone_type,
            commands::start_playback,
            commands::pause_playback,
            commands::resume_playback,
            commands::stop_playback,
            commands::test_output_device,
            commands::get_playback_state,
            commands::get_settings,
            commands::update_settings,
            commands::set_capture_device,
            commands::open_windows_sound_settings,
            commands::set_default_output_device,
            commands::activate_multiwave_routing,
            commands::configure_virtual_speaker_name,
            commands::install_virtual_speaker_driver,
        ])
        .run(tauri::generate_context!())
        .expect("error while running MultiWave application");
}
