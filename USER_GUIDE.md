# 🌊 MultiWave — First-Time User Guide

<p align="center">
  <img src="docs/images/multiwave_logo.png" alt="MultiWave Logo" width="130" />
</p>

<p align="center">
  <strong>Simultaneous Windows Audio Routing & Real-Time Synchronization</strong><br>
  <em>Play any PC sound through multiple wired, USB, and Bluetooth devices at the same time.</em>
</p>

<p align="center">
  <video src="public/multiwave.mp4" controls width="720" poster="docs/images/brag_poster.jpg">
    <a href="public/multiwave.mp4">
      <img src="docs/images/brag_poster.jpg" alt="MultiWave Feature Walkthrough Video" width="720" />
    </a>
  </video>
  <br>
  <em>🎬 <strong>Watch the 22-Second MultiWave Overview Video (with Audio & Human Voice Narration)</strong></em>
</p>

<p align="center">
  <a href="http://multiwave.pritamjoardar.com/"><strong>🌐 Official Website</strong></a> &nbsp;|&nbsp;
  <a href="https://github.com/pritamjoardar/Multiwave"><strong>⭐ GitHub Repository</strong></a> &nbsp;|&nbsp;
  <a href="src-tauri/target/release/bundle/nsis/MultiWave_0.1.0_x64-setup.exe"><strong>⬇️ Download & Install MultiWave (.exe)</strong></a>
</p>

---

## 📖 What is MultiWave?

By default, Windows only allows audio to play through **one single audio output device** at a time. If you plug in headphones, your speakers go silent. If you connect a Bluetooth speaker, your headphones turn off.

**MultiWave solves this!** It is a high-performance Windows Audio Session API (WASAPI) application that lets you broadcast and stream your computer's audio (YouTube, Spotify, games, movies, system sounds) across **multiple audio outputs simultaneously** — with:
- **Zero audio lag or echo** (via built-in Bluetooth delay compensation).
- **Independent volume controls** for each individual speaker or headphone.
- **Live reactive audio wave visualizers** that dance to the rhythm of your audio.
- **Instant hardware testing chimes** to identify every speaker.

---

## 🚀 Step-by-Step: Your First Time Setup

### Step 1: First-Time Launch & Interactive Welcome Guide

When you open MultiWave for the very first time, the application automatically launches an **interactive step-by-step onboarding guide** directly on your screen:

<p align="center">
  <img src="docs/images/guide_step1_welcome.png" alt="MultiWave Step 1 - Welcome Guide" width="620" />
</p>

1. **Top Navbar**:
   - **Status Indicators**: Shows how many devices are selected and whether playback is `Playing` or `Paused / Stopped`.
   - **Play / Pause Button**: Starts or pauses multi-device audio broadcasting.
   - **Rescan Button (🔄)**: Scans Windows for newly plugged in or connected audio devices.
   - **Guide Button (❓)**: Re-opens this interactive guide anytime you need a refresher.
   - **Settings Button (⚙️)**: Opens themes, audio driver routing, and application preferences.
2. **Audio Output Devices Grid**:
   - Displays all your physical audio endpoints (Laptop Speakers, Bluetooth Headphones, USB Headsets, AUX/Line Out, HDMI monitors).

---

### Step 2: One-Click System Audio Routing Setup

To let MultiWave capture and broadcast audio from all your Windows apps (Chrome, Spotify, VLC, games), you need to set MultiWave as your Windows audio bridge:

<p align="center">
  <img src="docs/images/guide_step2_routing.png" alt="MultiWave Step 2 - Audio Routing" width="620" />
</p>

1. You can click **"Open Audio Routing in Settings"** directly from Step 2 of the guide (or click the **⚙️ Settings** icon on the navbar).
2. In the **Windows Default Audio Routing** section:
   - **Automatic Virtual Speaker Setup**: MultiWave automatically includes and provisions its built-in **MultiWave Virtual Speaker** bridge on startup. If ever needed, click **"Enable MultiWave Virtual Speaker"** in Settings.
   - **Click "Activate MultiWave Routing"**: This sets **MultiWave Virtual Speaker** as your Windows default audio device.
3. Once activated, the status badge glows green with **`ROUTED TO MULTIWAVE`**:

<p align="center">
  <img src="docs/images/windows_audio_routing.png" alt="MultiWave Windows Audio Routing Active" width="700" />
</p>

> **Note:** Whenever MultiWave is routed, everything you play on your computer goes directly into MultiWave to be shared across your selected outputs! If you ever want to return Windows to normal single-speaker mode, open Settings and click **"Restore Direct Audio"**.

---

### Step 3: Connect and Select Your Audio Output Devices

<p align="center">
  <img src="docs/images/guide_step3_select_devices.png" alt="MultiWave Step 3 - Selecting Outputs" width="620" />
</p>

1. Connect all the audio devices you want to use to your PC (e.g., plug in wired speakers and pair your Bluetooth headphones or soundbars).
2. If you paired a new Bluetooth device while MultiWave was open, click the **Rescan (🔄)** button on the top navbar.
3. **Select Your Devices**:
   - Simply click on the card of any device you want sound to play through.
   - Selected cards will highlight with a **cyan border** and display a crisp **Checkmark icon (✓)** in the top right.
   - You can select two, three, four, or as many devices as your computer supports:

<p align="center">
  <img src="docs/images/multi_device_grid.png" alt="MultiWave Multi-Device Grid Overview" width="700" />
</p>

---

### Step 4: Start Multi-Device Playback

<p align="center">
  <img src="docs/images/guide_step4_play_waves.png" alt="MultiWave Step 4 - Live Playback & Waves" width="620" />
</p>

1. Click the **Play** button on the top navbar.
2. The button will switch to a glowing cyan **Pause** button, and the navbar status will change to **`Playing (X active)`**.
3. Open any audio on your computer (play a music track on Spotify, a video on YouTube, or a movie).
4. **The sound will play out of all your selected devices at the exact same time!**
5. Notice that each active device card will display a **live audio wave visualizer** that reacts in real-time to the beats and dynamics of your audio:

<p align="center">
  <img src="docs/images/device_cards_live_wave.png" alt="MultiWave Device Cards Live Waveform" width="700" />
</p>

---

### Step 5: Adjust Volume & Mute for Each Speaker Individually

Different headphones and speakers have different loudness levels. MultiWave gives you full, independent control:

- **Per-Device Volume Slider (0% – 100%)**:
  Drag the slider on any card to adjust its sound level. For example, set your external Bluetooth soundbar to 80% and your headphones to 35%.
- **Instant Mute Toggle**:
  Click the **Speaker icon** on any card to mute or unmute that specific device instantly without interrupting audio on your other speakers.

---

### Step 6: Eliminate Bluetooth Audio Echo (Delay Sync)

<p align="center">
  <img src="docs/images/guide_step5_bluetooth_sync.png" alt="MultiWave Step 5 - Bluetooth Delay Sync" width="620" />
</p>

#### Why do Bluetooth speakers lag?
Bluetooth audio transmission wirelessly buffers audio (typically introducing **100 ms to 180 ms** of wireless delay). If you play sound through a wired speaker and a Bluetooth speaker simultaneously, the wired speaker will play slightly ahead, creating an annoying echo effect.

#### How to fix it in MultiWave:
1. Find the card for your **wired / faster speaker** (e.g. Laptop Speakers or AUX Speakers).
2. Locate the **Sync Offset / Delay (ms)** slider at the bottom of the card.
3. Slide it to add **120 ms to 160 ms** of delay.
4. Listen to the audio — the wired speaker and Bluetooth speaker will now hit your ears in **perfect acoustic synchronization**!

---

### Step 7: Test Your Output Devices

Not sure which device corresponds to which card?
- Click the **Test Sound** button on any device card.
- MultiWave will play a brief, pleasant melodic chord chime exclusively through that specific device so you can instantly verify it.

---

### Step 8: Personalize Theme & Settings

Click the **Settings (⚙️)** button in the top navbar:
- **Application Theme**:
  - **Studio Dark**: Premium obsidian dark studio aesthetic with glowing cyan accents.
  - **Studio Light**: Clean, modern white daylight studio theme.
- **About MultiWave**:
  - View application architecture and credits to **Pritam Joardar** (with a clickable link to [pritamjoardar.com](https://www.pritamjoardar.com/)).
- **Automatic Persistence**:
  - Every time you change device selections, volume levels, delay sync values, or themes, MultiWave automatically saves your preferences to `%APPDATA%\MultiWave\settings.json`.
  - Next time you open MultiWave, all your settings are restored automatically!

---

## ❓ Frequently Asked Questions & Troubleshooting

### Q1: I don't hear any sound from my devices.
1. Make sure you clicked the **Play** button on the top navbar (status should say `Playing`).
2. Make sure you selected at least one device (the card has a cyan border and checkmark).
3. Open **Settings (⚙️)** and verify that Windows Default Audio Routing says **`ROUTED TO MULTIWAVE`**.
4. Check that your device volume sliders in MultiWave are turned up (not at 0%) and not muted.

### Q2: I plugged in my headphones or connected Bluetooth, but it's not showing.
- Click the **Rescan (🔄)** button on the top navbar. MultiWave will re-query the Windows Core Audio endpoint manager and list the new device immediately.

### Q3: How do I switch back to normal Windows audio?
- Open **Settings (⚙️)** in MultiWave and click **"Restore Direct Audio"**. Windows will immediately switch back to sending sound directly to your physical speakers.

### Q4: Where is the .exe file and how do I build it?
- **Official Website**: Visit [http://multiwave.pritamjoardar.com/](http://multiwave.pritamjoardar.com/) for online downloads, feature overviews, and updates.
- **Ready-to-Use Installer**: You can run the built installer right away from:  
  👉 [`src-tauri/target/release/bundle/nsis/MultiWave_0.1.0_x64-setup.exe`](file:///c:/Users/prita/OneDrive/Desktop/MultiWave/src-tauri/target/release/bundle/nsis/MultiWave_0.1.0_x64-setup.exe)
- **Option 1 (Quick Double-Click Rebuild)**: Simply double-click [`build_exe.bat`](file:///c:/Users/prita/OneDrive/Desktop/MultiWave/build_exe.bat) in the project folder.
- **Option 2 (PowerShell)**:
  ```powershell
  # Full Windows Setup Installer (.exe):
  .\build_exe.ps1 -Installer

  # Portable standalone .exe:
  .\build_exe.ps1
  ```
- **Option 3 (npm scripts)**:
  ```powershell
  npm run build:installer  # outputs to src-tauri\target\release\bundle\nsis\MultiWave_0.1.0_x64-setup.exe
  npm run build:exe        # outputs to src-tauri\target\release\multiwave.exe
  ```

---

*MultiWave is crafted with ❤️ by Pritam Joardar.*
