# MultiWave — Windows Multi-Device Audio Mixer

**MultiWave** is a high-performance Windows desktop application built with **Rust**, **Tauri 2**, and **React + TypeScript**. It enables simultaneous audio playback across multiple audio output devices recognized by Windows (including Bluetooth speakers, Bluetooth headphones, AUX/3.5mm outputs, USB headsets, and HDMI/DisplayPort audio monitors) with **independent software volume controls**, **soft-knee limiting**, and **Bluetooth latency compensation**.

---

## Key Features

- **Real-Time Windows Device Enumeration**: Discovers all active Core Audio render endpoints using Windows COM APIs (`IMMDeviceEnumerator`, `IMMDevice`, `IMMEndpoint`).
- **Accurate Device Classification**: Automatically categorizes endpoints into **Bluetooth**, **USB**, **AUX / Line Out**, **Headset**, **HDMI / DisplayPort**, or **Virtual Audio** by inspecting `PKEY_AudioEndpoint_FormFactor` and device interface paths.
- **Dynamic Device Change Notifications**: Integrated native COM `IMMNotificationClient` listens for `OnDeviceStateChanged`, `OnDeviceAdded`, `OnDeviceRemoved`, and `OnDefaultDeviceChanged`, instantly synchronizing the UI when Bluetooth devices connect or USB cables are unplugged.
- **Simultaneous Multi-Device Playback**: Opens dedicated WASAPI shared-mode streams for each selected output device, converting and routing shared PCM audio in real-time.
- **Heterogeneous Sample Rate & Channel Resampling**: Custom real-time resamplers and channel layout converters handle differing device configurations (44.1 kHz, 48 kHz, 96 kHz, 192 kHz; Mono, Stereo, 5.1/7.1) without blocking audio threads.
- **Independent Per-Device Software Gain**: Independent volume sliders (0% to 100%) mapped via perceptual cubic curves ($G = v^{2.5}$), with independent mute toggles and single-sample soft limiters to prevent harsh digital clipping. MultiWave software gain is clearly distinguished from Windows hardware endpoint volume.
- **Bluetooth Synchronization Strategy**: Built-in ring-buffer delay compensation (0–500 ms) allows delaying low-latency wired outputs to acoustically align with wireless Bluetooth A2DP buffering.
- **Multi-Tone Audio Generators**: Built-in harmonic C-Major chord, melodic arpeggio chime, 440 Hz / 880 Hz sine tones, and Paul Kellet filtered pink noise for multi-speaker verification.
- **Settings Persistence**: User preferences, selected devices, individual volume levels, and delay offsets persist locally in `%APPDATA%\MultiWave\config.json`.
- **Per-Application Audio Routing Architecture**: Documented architectural extension point using Windows 10/11 Process Loopback Capture (`ActivateAudioInterfaceAsync` with `AUDIOCLIENT_ACTIVATION_PARAMS` `PROCESS_LOOPBACK_MODE`).

---

## 📚 User Guide & Documentation

For a beginner-friendly walkthrough with screenshots and common audio scenarios, see our **[Step-by-Step First-Time User Guide](USER_GUIDE.md)**.

---

## Architecture Overview

```
MultiWave (Tauri 2 Desktop Application)
│
├── Frontend (React 18 + TypeScript + Vite + Tailwind CSS)
│   ├── components/
│   │   ├── Header.tsx                 # Status indicators, Play/Pause toggle, rescan, and settings
│   │   ├── DeviceCard.tsx             # Per-device sliders, mute, latency sync, test tone
│   │   ├── DeviceWaveVisualizer.tsx   # Dynamic real-time audio wave meter reacting to audio signal
│   │   └── SettingsModal.tsx          # Themes (Dark/Light), virtual audio routing, and about info
│   ├── hooks/useAudioMixer.ts         # Central state management & event listener hook
│   └── services/tauriService.ts       # Typed IPC bridge to Tauri backend commands
│
└── Backend (Rust Core Audio Engine)
    ├── windows/
    │   ├── core_audio.rs              # IMMDeviceEnumerator, endpoint property extraction
    │   └── device_notifications.rs    # IMMNotificationClient COM event sink
    ├── audio/
    │   ├── device_manager.rs          # Cross-maps Windows Core Audio with cpal WASAPI host
    │   ├── playback_engine.rs         # Master playback engine coordinating output streams
    │   ├── output_stream.rs           # Dedicated cpal::Stream per device
    │   ├── resampler.rs               # Real-time linear sample rate converter & channel mapper
    │   ├── volume.rs                  # Perceptual volume curves and soft-knee limiters
    │   └── audio_mixer.rs             # Multi-tone generators & ring-buffer delay lines
    ├── commands/                      # Typed Tauri IPC commands
    └── persistence/config_store.rs    # Local configuration store (%APPDATA%\MultiWave\settings.json)
```

---

## Prerequisites

Before running or building MultiWave on Windows:

1. **Rust Toolchain**:
   - Install Rust via [rustup.rs](https://win.rustup.rs/):
     ```powershell
     curl.exe -Lo rustup-init.exe https://win.rustup.rs
     .\rustup-init.exe -y --default-host x86_64-pc-windows-msvc
     ```
   - Ensure `%USERPROFILE%\.cargo\bin` is in your `PATH`.
2. **Node.js**:
   - Node.js 18+ (tested with Node.js v22.12.0 and npm 10.9.0).
3. **C++ Build Tools**:
   - Visual Studio 2022 or 2026 Build Tools with the **Desktop development with C++** workload (provides the MSVC compiler and Windows SDK).
4. **WebView2**:
   - Pre-installed on Windows 10 and 11.

---

## Step-by-Step Instructions: How to Run

### 1. Run Development Desktop Application
To launch the full desktop application with the native Windows Core Audio engine:

```powershell
# In PowerShell (from project root):
$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"

# Run Tauri development mode:
npm run tauri dev
```
> **What this does:**
> - Starts the Vite dev server for hot-reloading React.
> - Compiles the Rust backend with Windows Core Audio APIs and WASAPI.
> - Launches the native desktop window with multi-device playback.

### 2. Run Web UI Preview (Without Native Audio)
If you only want to inspect UI layouts in your web browser:
```powershell
npm run dev
```

### 3. Run Automated Rust Unit Tests
MultiWave includes unit tests for volume clamping, perceptual gain calculations, mute logic, soft limiting, channel mapping (mono/stereo/5.1), resampling, and delay line synchronization:

```powershell
$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"
cd src-tauri
cargo test
```

### 4. Build Production Release Executable & Installer
To create the optimized Windows desktop package:
```powershell
$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"
npm run tauri build
```
The installer (`.msi` and `.exe`) will be generated in `src-tauri\target\release\bundle\`.

---

## Understanding Bluetooth Latency & Synchronization

Bluetooth audio transmission operates over the **A2DP** profile (using SBC, AAC, or LDAC codecs). This inherently incurs **120 ms to 220 ms** of wireless transmission and DSP buffering inside the Bluetooth speaker/headphone hardware. In comparison, wired 3.5mm AUX or USB DACs have a hardware buffer latency of only **5 ms to 20 ms**.

If audio is played through both a wired AUX speaker and a Bluetooth speaker without compensation, the wired speaker will sound slightly ahead of the Bluetooth speaker.

### MultiWave's Solution:
1. MultiWave implements an independent **Sync Delay Line** (0 to 500 ms) on every output.
2. In the device card, expand the **Sync Offset** slider on your wired speaker.
3. Add **120 ms to 180 ms** of delay to the wired output. The sound from both speakers will now reach your ears simultaneously!

---

## Advanced Feature: Per-Application Audio Routing

Routing audio from individual third-party applications (e.g. Chrome → Bluetooth, Spotify → Headphones) requires intercepting audio before it reaches the Windows default output device.

MultiWave provides a documented extension point based on Microsoft's **Process Loopback Capture API** introduced in Windows 10 Build 20348+ and Windows 11:
- `ActivateAudioInterfaceAsync` initialized with `AUDIOCLIENT_ACTIVATION_PARAMS` (`PROCESS_LOOPBACK_MODE_INCLUDE_TARGET_PROCESS_TREE`).
- Captures raw PCM audio frames directly from a targeted Process ID.
- Feeds the captured frames into MultiWave's `Resampler` and `OutputStream` distribution pipeline.
- Click the **App Routing** button in the top navigation bar of MultiWave to explore the full architectural diagram.

---

## Troubleshooting

- **No audio devices found:** Ensure your devices are enabled in Windows Sound Settings (`mmsys.cpl`). Click the **Refresh** button in MultiWave's header to re-enumerate endpoints.
- **Device disconnected during playback:** MultiWave cleanly handles device disconnection events without crashing. When the device is plugged back in or reconnects over Bluetooth, click **Refresh** or **Play Selected**.
- **Build fails on missing Rust:** If `cargo` is not recognized, run:
  ```powershell
  $env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"
  ```
- **Windows Core Audio COM Error:** Ensure Windows Audio service (`Audiosrv`) is running in `services.mms`.

---

## License

MIT License. Designed and engineered for Windows 10 & 11.
