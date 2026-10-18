use crate::errors::Result;
use tauri::{AppHandle, Emitter};

#[cfg(windows)]
use windows::{
    core::{implement, PCWSTR},
    Win32::{
        Media::Audio::*,
        System::Com::*,
        UI::Shell::PropertiesSystem::PROPERTYKEY,
    },
};

#[cfg(windows)]
#[implement(IMMNotificationClient)]
struct AudioNotificationClient {
    app_handle: AppHandle,
}

#[cfg(windows)]
impl IMMNotificationClient_Impl for AudioNotificationClient_Impl {
    fn OnDeviceStateChanged(&self, _pwstrdeviceid: &PCWSTR, _dwnewstate: DEVICE_STATE) -> windows::core::Result<()> {
        log::info!("Windows Core Audio: OnDeviceStateChanged");
        let _ = self.app_handle.emit("device-state-changed", ());
        Ok(())
    }

    fn OnDeviceAdded(&self, _pwstrdeviceid: &PCWSTR) -> windows::core::Result<()> {
        log::info!("Windows Core Audio: OnDeviceAdded");
        let _ = self.app_handle.emit("device-state-changed", ());
        Ok(())
    }

    fn OnDeviceRemoved(&self, _pwstrdeviceid: &PCWSTR) -> windows::core::Result<()> {
        log::info!("Windows Core Audio: OnDeviceRemoved");
        let _ = self.app_handle.emit("device-state-changed", ());
        Ok(())
    }

    fn OnDefaultDeviceChanged(&self, _flow: EDataFlow, _role: ERole, _pwstrdefaultdeviceid: &PCWSTR) -> windows::core::Result<()> {
        log::info!("Windows Core Audio: OnDefaultDeviceChanged");
        let _ = self.app_handle.emit("default-device-changed", ());
        Ok(())
    }

    fn OnPropertyValueChanged(&self, _pwstrdeviceid: &PCWSTR, _key: &PROPERTYKEY) -> windows::core::Result<()> {
        // Ignored: Property values change continuously during audio playback and must not trigger device re-enumeration
        Ok(())
    }
}

pub struct DeviceNotifier;

impl DeviceNotifier {
    pub fn start_listening(app_handle: AppHandle) -> Result<()> {
        #[cfg(windows)]
        {
            let handle_clone = app_handle.clone();
            std::thread::spawn(move || {
                unsafe {
                    let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
                    let enumerator: std::result::Result<IMMDeviceEnumerator, _> =
                        CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL);

                    if let Ok(enumerator) = enumerator {
                        let client: IMMNotificationClient = AudioNotificationClient {
                            app_handle: handle_clone.clone(),
                        }
                        .into();

                        if let Err(e) = enumerator.RegisterEndpointNotificationCallback(&client) {
                            log::warn!("RegisterEndpointNotificationCallback error: {e}");
                        } else {
                            log::info!("Registered IMMNotificationClient successfully");
                        }

                        // Keep the thread alive so the COM registration remains active
                        loop {
                            std::thread::sleep(std::time::Duration::from_secs(60));
                        }
                    }
                }
            });
        }

        Ok(())
    }
}
