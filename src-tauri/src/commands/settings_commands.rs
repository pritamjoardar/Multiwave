use crate::commands::device_commands::AppState;
use crate::errors::Result;
use crate::models::settings::AppSettings;
use crate::persistence::ConfigStore;
use tauri::State;

#[tauri::command]
pub fn get_settings(state: State<'_, AppState>) -> Result<AppSettings> {
    let settings = state.settings.lock();
    Ok(settings.clone())
}

#[tauri::command]
pub fn update_settings(new_settings: AppSettings, state: State<'_, AppState>) -> Result<AppSettings> {
    {
        let mut settings = state.settings.lock();
        *settings = new_settings.clone();
        ConfigStore::save_settings(&settings)?;
    }

    {
        let mut engine = state.engine.lock();
        engine.set_master_volume(new_settings.master_volume);
        engine.set_master_mute(new_settings.master_mute);
        engine.set_tone_type(new_settings.tone_type);
    }

    Ok(new_settings)
}
