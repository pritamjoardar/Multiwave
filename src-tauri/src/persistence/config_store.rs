use crate::errors::{MultiWaveError, Result};
use crate::models::settings::AppSettings;
use std::fs;
use std::path::PathBuf;

pub struct ConfigStore;

impl ConfigStore {
    fn get_config_path() -> Result<PathBuf> {
        let base_dir = directories::BaseDirs::new()
            .map(|b| b.config_dir().join("MultiWave"))
            .unwrap_or_else(|| PathBuf::from("."));

        if !base_dir.exists() {
            let _ = fs::create_dir_all(&base_dir);
        }

        Ok(base_dir.join("settings.json"))
    }

    pub fn load_settings() -> AppSettings {
        match Self::get_config_path() {
            Ok(path) => {
                if path.exists() {
                    match fs::read_to_string(&path) {
                        Ok(contents) => match serde_json::from_str::<AppSettings>(&contents) {
                            Ok(settings) => {
                                log::info!("Loaded persistent settings from {:?}", path);
                                return settings;
                            }
                            Err(e) => {
                                log::warn!("Corrupted config file at {:?}, using defaults: {e}", path);
                            }
                        },
                        Err(e) => {
                            log::warn!("Could not read config file: {e}");
                        }
                    }
                }
            }
            Err(e) => {
                log::warn!("Config path resolution error: {e}");
            }
        }
        AppSettings::default()
    }

    pub fn save_settings(settings: &AppSettings) -> Result<()> {
        let path = Self::get_config_path()?;
        let json = serde_json::to_string_pretty(settings)
            .map_err(|e| MultiWaveError::PersistenceError(format!("Failed to serialize settings: {e}")))?;

        fs::write(&path, json)
            .map_err(|e| MultiWaveError::PersistenceError(format!("Failed to write settings to {:?}: {e}", path)))?;

        log::info!("Saved persistent settings to {:?}", path);
        Ok(())
    }
}
