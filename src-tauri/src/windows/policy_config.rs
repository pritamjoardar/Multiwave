use crate::errors::{MultiWaveError, Result};
use std::ffi::c_void;

#[cfg(windows)]
use windows::{
    core::{GUID, HRESULT},
    Win32::System::Com::{CoCreateInstance, CoInitializeEx, CLSCTX_ALL, COINIT_MULTITHREADED},
};
#[cfg(windows)]
use windows_core::Interface;


#[cfg(windows)]
const CLSID_POLICY_CONFIG_CLIENT: GUID = GUID::from_u128(0x870af99c_171d_4f9e_af0d_e63df40c2bc9);
#[cfg(windows)]
const IID_IPOLICY_CONFIG: GUID = GUID::from_u128(0xf8679f50_850a_41cf_9c72_430f290290c8);

#[cfg(windows)]
#[repr(C)]
struct IPolicyConfigVtbl {
    pub parent: windows::core::IUnknown_Vtbl,
    pub get_mix_format: unsafe extern "system" fn(*mut c_void, *const u16, *mut c_void) -> HRESULT,
    pub get_device_format: unsafe extern "system" fn(*mut c_void, *const u16, i32, *mut c_void) -> HRESULT,
    pub reset_device_format: unsafe extern "system" fn(*mut c_void, *const u16) -> HRESULT,
    pub set_device_format: unsafe extern "system" fn(*mut c_void, *const u16, *mut c_void, *mut c_void) -> HRESULT,
    pub get_processing_period: unsafe extern "system" fn(*mut c_void, *const u16, i32, *mut c_void, *mut c_void) -> HRESULT,
    pub set_processing_period: unsafe extern "system" fn(*mut c_void, *const u16, *mut c_void) -> HRESULT,
    pub get_share_mode: unsafe extern "system" fn(*mut c_void, *const u16, *mut c_void) -> HRESULT,
    pub set_share_mode: unsafe extern "system" fn(*mut c_void, *const u16, *mut c_void) -> HRESULT,
    pub get_property_value: unsafe extern "system" fn(*mut c_void, *const u16, i32, *const c_void, *mut c_void) -> HRESULT,
    pub set_property_value: unsafe extern "system" fn(*mut c_void, *const u16, i32, *const c_void, *const c_void) -> HRESULT,
    pub set_default_endpoint: unsafe extern "system" fn(*mut c_void, *const u16, u32) -> HRESULT,
    pub set_endpoint_visibility: unsafe extern "system" fn(*mut c_void, *const u16, i32) -> HRESULT,
}

#[cfg(windows)]
#[repr(C)]
struct IPolicyConfig {
    pub vtable: *const IPolicyConfigVtbl,
}

pub struct WindowsAudioPolicy;

impl WindowsAudioPolicy {
    /// Sets the Windows default audio output endpoint for all roles (Console, Multimedia, Communications)
    pub fn set_default_endpoint(device_id: &str) -> Result<()> {
        #[cfg(windows)]
        {
            unsafe {
                let _ = CoInitializeEx(None, COINIT_MULTITHREADED);

                let unk: windows::core::IUnknown = CoCreateInstance(&CLSID_POLICY_CONFIG_CLIENT, None, CLSCTX_ALL)
                    .map_err(|e| MultiWaveError::WindowsCoreAudioError(format!("Failed to create PolicyConfigClient: {e}")))?;

                let mut policy_ptr: *mut c_void = std::ptr::null_mut();
                let cast_hr = unk.query(&IID_IPOLICY_CONFIG, &mut policy_ptr);

                if cast_hr.is_err() || policy_ptr.is_null() {
                    return Err(MultiWaveError::WindowsCoreAudioError(
                        "Failed to query IPolicyConfig interface".into(),
                    ));
                }

                let policy = policy_ptr as *mut IPolicyConfig;
                let vtable = &*(*policy).vtable;

                let wide_id: Vec<u16> = device_id.encode_utf16().chain(std::iter::once(0)).collect();

                // 0 = eConsole, 1 = eMultimedia, 2 = eCommunications
                let r0 = (vtable.set_default_endpoint)(policy_ptr, wide_id.as_ptr(), 0);
                let r1 = (vtable.set_default_endpoint)(policy_ptr, wide_id.as_ptr(), 1);
                let r2 = (vtable.set_default_endpoint)(policy_ptr, wide_id.as_ptr(), 2);

                // Release COM interface pointer
                let _ = (vtable.parent.Release)(policy_ptr);

                if r0.is_err() && r1.is_err() {
                    return Err(MultiWaveError::WindowsCoreAudioError(format!(
                        "Failed to set default audio endpoint: r0={r0:?}, r1={r1:?}, r2={r2:?}"
                    )));
                }

                log::info!("Successfully set Windows default audio output device to: {}", device_id);
                Ok(())
            }
        }

        #[cfg(not(windows))]
        {
            let _ = device_id;
            Ok(())
        }
    }

    /// Sets endpoint visibility in Windows (1 = visible/active, 0 = hidden/disabled)
    pub fn set_endpoint_visibility(device_id: &str, visible: bool) -> Result<()> {
        #[cfg(windows)]
        {
            unsafe {
                let _ = CoInitializeEx(None, COINIT_MULTITHREADED);

                let unk: windows::core::IUnknown = CoCreateInstance(&CLSID_POLICY_CONFIG_CLIENT, None, CLSCTX_ALL)
                    .map_err(|e| MultiWaveError::WindowsCoreAudioError(format!("Failed to create PolicyConfigClient: {e}")))?;

                let mut policy_ptr: *mut c_void = std::ptr::null_mut();
                let cast_hr = unk.query(&IID_IPOLICY_CONFIG, &mut policy_ptr);

                if cast_hr.is_err() || policy_ptr.is_null() {
                    return Err(MultiWaveError::WindowsCoreAudioError(
                        "Failed to query IPolicyConfig interface".into(),
                    ));
                }

                let policy = policy_ptr as *mut IPolicyConfig;
                let vtable = &*(*policy).vtable;

                let wide_id: Vec<u16> = device_id.encode_utf16().chain(std::iter::once(0)).collect();

                let r = (vtable.set_endpoint_visibility)(policy_ptr, wide_id.as_ptr(), if visible { 1 } else { 0 });

                let _ = (vtable.parent.Release)(policy_ptr);

                if r.is_err() {
                    return Err(MultiWaveError::WindowsCoreAudioError(format!(
                        "Failed to set endpoint visibility: {r:?}"
                    )));
                }

                log::info!("Successfully set endpoint visibility for {device_id} to {visible}");
                Ok(())
            }
        }

        #[cfg(not(windows))]
        {
            let _ = (device_id, visible);
            Ok(())
        }
    }

    /// Automatically sets the virtual speaker endpoint name to "MultiWave Virtual Speaker" in the Windows Registry
    pub fn rename_endpoint_to_multiwave(endpoint_guid: &str) -> Result<()> {
        #[cfg(windows)]
        {
            let sub_key = format!(
                "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\MMDevices\\Audio\\Render\\{}\\Properties\0",
                endpoint_guid
            );
            let sub_key_u16: Vec<u16> = sub_key.encode_utf16().collect();

            unsafe {
                let mut hkey: isize = 0;
                let status = RegOpenKeyExW(
                    HKEY_LOCAL_MACHINE,
                    sub_key_u16.as_ptr(),
                    0,
                    KEY_SET_VALUE,
                    &mut hkey,
                );

                if status != 0 {
                    return Err(MultiWaveError::WindowsCoreAudioError(format!(
                        "RegOpenKeyExW failed with code {status}"
                    )));
                }

                let val_data: Vec<u16> = "MultiWave Virtual Speaker\0".encode_utf16().collect();
                let val_bytes = std::slice::from_raw_parts(val_data.as_ptr() as *const u8, val_data.len() * 2);

                let val_desc: Vec<u16> = "MultiWave Virtual Audio\0".encode_utf16().collect();
                let desc_bytes = std::slice::from_raw_parts(val_desc.as_ptr() as *const u8, val_desc.len() * 2);

                let key_p14: Vec<u16> = "{a45c254e-df1c-4efd-8020-67d146a850e0},14\0".encode_utf16().collect();
                let key_p2: Vec<u16> = "{a45c254e-df1c-4efd-8020-67d146a850e0},2\0".encode_utf16().collect();
                let key_int: Vec<u16> = "{b3f8fa53-0004-438e-9003-51a46e139bfc},6\0".encode_utf16().collect();

                let _ = RegSetValueExW(hkey, key_p14.as_ptr(), 0, REG_SZ, val_bytes.as_ptr(), val_bytes.len() as u32);
                let _ = RegSetValueExW(hkey, key_p2.as_ptr(), 0, REG_SZ, val_bytes.as_ptr(), val_bytes.len() as u32);
                let _ = RegSetValueExW(hkey, key_int.as_ptr(), 0, REG_SZ, desc_bytes.as_ptr(), desc_bytes.len() as u32);

                RegCloseKey(hkey);
                log::info!("Successfully updated registry to name {} as MultiWave Virtual Speaker", endpoint_guid);
            }
            Ok(())
        }

        #[cfg(not(windows))]
        {
            let _ = endpoint_guid;
            Ok(())
        }
    }
}

#[cfg(windows)]
#[link(name = "advapi32")]
extern "system" {
    fn RegOpenKeyExW(
        hKey: isize,
        lpSubKey: *const u16,
        ulOptions: u32,
        samDesired: u32,
        phkResult: *mut isize,
    ) -> i32;
    fn RegSetValueExW(
        hKey: isize,
        lpValueName: *const u16,
        Reserved: u32,
        dwType: u32,
        lpData: *const u8,
        cbData: u32,
    ) -> i32;
    fn RegCloseKey(hKey: isize) -> i32;
}

#[cfg(windows)]
const HKEY_LOCAL_MACHINE: isize = -2147483646; // 0x80000002
#[cfg(windows)]
const KEY_SET_VALUE: u32 = 0x0002;
#[cfg(windows)]
const REG_SZ: u32 = 1;


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_set_default_endpoint() {
        if let Ok(devs) = crate::windows::WindowsCoreAudio::enumerate_output_devices() {
            if let Some(dev) = devs.iter().find(|d| d.is_default).or_else(|| devs.first()) {
                let res = WindowsAudioPolicy::set_default_endpoint(&dev.id);
                println!("Rust test_set_default_endpoint result for {}: {:?}", dev.name, res);
                assert!(res.is_ok());
            }
        }
    }
}
