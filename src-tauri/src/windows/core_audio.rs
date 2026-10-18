use crate::errors::{MultiWaveError, Result};
use crate::models::audio_device::{AudioDevice, DeviceState, DeviceType};

#[cfg(windows)]
use windows::{
    core::GUID,
    Win32::{
        Media::Audio::Endpoints::IAudioEndpointVolume,
        Media::Audio::*,
        System::Com::*,
        UI::Shell::PropertiesSystem::PROPERTYKEY,
    },
};

// Standard Windows PKEY definitions for audio endpoints
#[cfg(windows)]
const PKEY_DEVICE_FRIENDLY_NAME: PROPERTYKEY = PROPERTYKEY {
    fmtid: GUID::from_u128(0xa45c254e_df1c_4efd_8020_67d146a850e0),
    pid: 14,
};

#[cfg(windows)]
const PKEY_AUDIO_ENDPOINT_FORM_FACTOR: PROPERTYKEY = PROPERTYKEY {
    fmtid: GUID::from_u128(0x1da5d803_d492_4edd_8c23_e0c0ffee7f0e),
    pid: 0,
};

#[cfg(windows)]
const PKEY_DEVICE_INTERFACE_FRIENDLY_NAME: PROPERTYKEY = PROPERTYKEY {
    fmtid: GUID::from_u128(0x026e516e_b814_414b_83cd_856d6fef4822),
    pid: 2,
};

#[cfg(windows)]
const PKEY_DEVICE_ENUMERATOR_NAME: PROPERTYKEY = PROPERTYKEY {
    fmtid: GUID::from_u128(0xa45c254e_df1c_4efd_8020_67d146a850e0),
    pid: 24,
};

pub struct WindowsCoreAudio;

impl WindowsCoreAudio {
    /// Enumerate all active audio render (output) endpoints using Windows Core Audio (WASAPI)
    pub fn enumerate_output_devices() -> Result<Vec<AudioDevice>> {
        #[cfg(windows)]
        {
            unsafe {
                // Initialize COM library for this thread if not already initialized
                let _ = CoInitializeEx(None, COINIT_MULTITHREADED);

                let enumerator: IMMDeviceEnumerator =
                    CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)
                        .map_err(|e| MultiWaveError::WindowsCoreAudioError(format!("Failed to create MMDeviceEnumerator: {e}")))?;

                // Query Default Console Render Endpoint
                let default_render_id = match enumerator.GetDefaultAudioEndpoint(eRender, eConsole) {
                    Ok(dev) => dev.GetId().ok().map(|pw| pw.to_string().unwrap_or_default()),
                    Err(_) => None,
                };

                // Query Default Communications Render Endpoint
                let default_comm_id = match enumerator.GetDefaultAudioEndpoint(eRender, eCommunications) {
                    Ok(dev) => dev.GetId().ok().map(|pw| pw.to_string().unwrap_or_default()),
                    Err(_) => None,
                };

                // Enumerate all active audio rendering endpoints
                let collection: IMMDeviceCollection = enumerator
                    .EnumAudioEndpoints(eRender, DEVICE_STATE_ACTIVE)
                    .map_err(|e| MultiWaveError::WindowsCoreAudioError(format!("Failed to enum audio endpoints: {e}")))?;

                let count = collection
                    .GetCount()
                    .map_err(|e| MultiWaveError::WindowsCoreAudioError(format!("Failed to get device count: {e}")))?;

                let mut devices = Vec::new();

                for i in 0..count {
                    if let Ok(device) = collection.Item(i) {
                        if let Ok(pw_id) = device.GetId() {
                            let id_str = pw_id.to_string().unwrap_or_default();
                            let mut dev_info = Self::extract_device_properties(&device, id_str.clone());

                            // Automatically hide and suppress redundant 16-channel virtual cable endpoint
                            let n_low = dev_info.name.to_lowercase();
                            if n_low.contains("16ch") || n_low.contains("16 ch") || id_str.to_lowercase().contains("5565f021") {
                                log::info!("Hiding redundant 16-channel virtual cable endpoint: {} ({})", dev_info.name, id_str);
                                let _ = crate::windows::WindowsAudioPolicy::set_endpoint_visibility(&id_str, false);
                                continue;
                            }

                            if let Some(ref def_id) = default_render_id {
                                if def_id == &id_str {
                                    dev_info.is_default = true;
                                }
                            }

                            if let Some(ref comm_id) = default_comm_id {
                                if comm_id == &id_str {
                                    dev_info.is_default_comm = true;
                                }
                            }

                            // Query system volume and mute from IAudioEndpointVolume
                            if let Ok(endpoint_vol) = device.Activate::<IAudioEndpointVolume>(CLSCTX_ALL, None) {
                                if let Ok(vol) = endpoint_vol.GetMasterVolumeLevelScalar() {
                                    dev_info.system_volume = Some(vol.clamp(0.0, 1.0));
                                }
                                if let Ok(mute) = endpoint_vol.GetMute() {
                                    dev_info.system_mute = Some(mute.as_bool());
                                }
                            }

                            devices.push(dev_info);
                        }
                    }
                }

                Ok(devices)
            }
        }

        #[cfg(not(windows))]
        {
            Ok(Vec::new())
        }
    }

    #[cfg(windows)]
    unsafe fn extract_device_properties(device: &IMMDevice, id: String) -> AudioDevice {
        let mut name = "Unknown Output Device".to_string();
        let mut dev_type = DeviceType::Unknown;

        if let Ok(props) = device.OpenPropertyStore(STGM_READ) {
            // Friendly Name
            if let Ok(prop_var) = props.GetValue(&PKEY_DEVICE_FRIENDLY_NAME) {
                let s = prop_var.to_string();
                if !s.trim().is_empty() {
                    name = s;
                }
            } else if let Ok(prop_var) = props.GetValue(&PKEY_DEVICE_INTERFACE_FRIENDLY_NAME) {
                let s = prop_var.to_string();
                if !s.trim().is_empty() {
                    name = s;
                }
            }

            // Inspect FormFactor (EndpointFormFactor: 0=RemoteNetwork, 1=Speakers, 2=LineLevel, 3=Headphones, 4=Microphone, 5=Headset, etc.)
            let form_factor = if let Ok(prop_var) = props.GetValue(&PKEY_AUDIO_ENDPOINT_FORM_FACTOR) {
                u32::try_from(&prop_var).unwrap_or(0)
            } else {
                0
            };

            // Inspect Enumerator Name (e.g. BTHENUM, USB, HDAUDIO)
            let mut enumerator_name = String::new();
            if let Ok(prop_var) = props.GetValue(&PKEY_DEVICE_ENUMERATOR_NAME) {
                enumerator_name = prop_var.to_string();
            }

            dev_type = Self::classify_device(&name, &id, &enumerator_name, form_factor);
        }

        if dev_type == DeviceType::Virtual && !name.to_lowercase().contains("multiwave") {
            name = "MultiWave Virtual Speaker".to_string();
        }

        let mut audio_device = AudioDevice::new(id, name);
        audio_device.device_type = dev_type;
        audio_device.state = DeviceState::Active;
        audio_device.sample_rate = Some(48000);
        audio_device.channels = Some(2);
        audio_device
    }

    fn classify_device(name: &str, id: &str, enumerator_name: &str, form_factor: u32) -> DeviceType {
        let name_lower = name.to_lowercase();
        let id_lower = id.to_lowercase();
        let enum_lower = enumerator_name.to_lowercase();

        // Check Virtual Audio / Cable / AudioRelay first
        if name_lower.contains("virtual")
            || name_lower.contains("audiorelay")
            || name_lower.contains("multiwave")
            || name_lower.contains("cable")
            || name_lower.contains("voicemeeter")
            || id_lower.contains("audiorelay")
            || id_lower.contains("multiwave")
        {
            return DeviceType::Virtual;
        }

        // Check Bluetooth signatures
        if enum_lower.contains("bth")
            || id_lower.contains("bthenum")
            || id_lower.contains("bluetooth")
            || name_lower.contains("bluetooth")
            || name_lower.contains("hands-free")
            || name_lower.contains("airpods")
            || name_lower.contains("wh-1000")
            || name_lower.contains("buds")
            || name_lower.contains("wireless stereo")
        {
            return DeviceType::Bluetooth;
        }

        // Check USB
        if enum_lower.contains("usb") || id_lower.contains("usb") || name_lower.contains("usb") {
            return DeviceType::Usb;
        }

        // Check HDMI / DisplayPort
        if form_factor == 8 // DigitalAudioDisplayDevice
            || name_lower.contains("hdmi")
            || name_lower.contains("displayport")
            || name_lower.contains("nvidia")
            || name_lower.contains("amd high definition")
            || name_lower.contains("intel(r) display")
        {
            return DeviceType::HdmiDisplayPort;
        }

        // Check Headset / Headphones
        if form_factor == 5 || name_lower.contains("headset") {
            return DeviceType::Headset;
        }

        if form_factor == 3 || name_lower.contains("headphone") {
            return DeviceType::Headset;
        }

        // Check Aux / Line / Speakers
        if form_factor == 1 || name_lower.contains("speakers") || name_lower.contains("realtek") {
            return DeviceType::AuxLine;
        }

        if form_factor == 2 || name_lower.contains("line out") || name_lower.contains("aux") {
            return DeviceType::AuxLine;
        }

        // Virtual Audio / CABLE
        if name_lower.contains("virtual") || name_lower.contains("cable") || name_lower.contains("voicemeeter") {
            return DeviceType::Virtual;
        }

        DeviceType::Unknown
    }
}
