use serde::{Serialize, Serializer};
use thiserror::Error;

#[derive(Error, Debug, Clone)]
pub enum MultiWaveError {
    #[error("Audio device not found: {0}")]
    DeviceNotFound(String),

    #[error("Audio device unavailable or disconnected: {0}")]
    DeviceUnavailable(String),

    #[error("Unsupported audio format or sample rate: {0}")]
    UnsupportedFormat(String),

    #[error("Audio stream initialization failed: {0}")]
    StreamError(String),

    #[error("Windows Core Audio initialization error: {0}")]
    WindowsCoreAudioError(String),

    #[error("Persistence or configuration error: {0}")]
    PersistenceError(String),

    #[error("Device notification error: {0}")]
    NotificationError(String),

    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Internal audio engine error: {0}")]
    Internal(String),
}

impl Serialize for MultiWaveError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type Result<T> = std::result::Result<T, MultiWaveError>;
