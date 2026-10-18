# 🌊 MultiWave — First-Time User Guide

Welcome to **MultiWave**! This complete step-by-step guide will walk you through everything you need to know when opening and using MultiWave for the very first time.

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

### Step 1: Open MultiWave
When you launch MultiWave, you will see a clean, modern studio interface:
1. **Top Navbar**:
   - **Status Indicators**: Shows how many devices are selected and whether playback is `Playing` or `Paused / Stopped`.
   - **Play / Pause Button**: Starts or pauses multi-device audio broadcasting.
   - **Rescan Button (🔄)**: Scans Windows for newly plugged in or connected audio devices.
   - **Settings Button (⚙️)**: Opens themes, audio driver routing, and application preferences.
2. **Audio Output Devices Grid**:
   - Displays all your real physical audio endpoints (Laptop Speakers, Bluetooth Headphones, USB Headsets, AUX/Line Out, HDMI monitors).

---

### Step 2: One-Click System Audio Routing Setup

To let MultiWave capture and broadcast audio from all your Windows apps (Chrome, Spotify, VLC, games), you need to set MultiWave as your Windows audio bridge.

1. Click the **Settings (⚙️)** button in the top-right navbar.
2. In the **Windows Default Audio Routing** section:
   - **If the driver is not yet installed**: Click **"Install Virtual Speaker Driver"**. Windows will briefly register the MultiWave virtual audio bridge.
   - **Click "Activate MultiWave Routing"**: This sets **MultiWave Virtual Speaker** as your Windows default audio device.
3. Once activated, the status badge will glow green with **`ROUTED TO MULTIWAVE`**.
4. Close the Settings modal by clicking **Save & Close** or the **X**.

> **Note:** Whenever MultiWave is routed, everything you play on your computer goes directly into MultiWave to be shared across your selected outputs! If you ever want to turn off multi-device sharing and return Windows to normal single-speaker mode, open Settings and click **"Restore Direct Audio"**.

---

### Step 3: Connect and Select Your Audio Output Devices

1. Connect all the audio devices you want to use to your PC (e.g., plug in wired speakers and pair your Bluetooth headphones or soundbars).
2. If you just paired a new Bluetooth device while MultiWave was open, click the **Rescan (🔄)** button on the top navbar.
3. **Select Your Devices**:
   - Simply click on the card of any device you want sound to play through.
   - Selected cards will highlight with a **cyan border** and display a crisp **Checkmark icon (✓)** in the top right.
   - You can select two, three, four, or as many devices as your computer supports!

---

### Step 4: Start Multi-Device Playback

1. Click the **Play** button on the top navbar.
2. The button will switch to a glowing cyan **Pause** button, and the navbar status will change to **`Playing (X active)`**.
3. Open any audio on your computer (play a music track on Spotify, a video on YouTube, or a movie).
4. **The sound will play out of all your selected devices at the exact same time!**
5. Notice that each active device card will display a **live audio wave visualizer** that reacts in real-time to the beats and dynamics of your audio.

---

### Step 5: Adjust Volume & Mute for Each Speaker Individually

Different headphones and speakers have different loudness levels. MultiWave gives you full, independent control:

- **Per-Device Volume Slider (0% – 100%)**:
  Drag the slider on any card to adjust its sound level. For example, you can set your Bluetooth soundbar to 80% and your headphones to 40%.
- **Instant Mute Toggle**:
  Click the **Speaker icon** on any card to mute or unmute that specific device instantly without interrupting audio on your other speakers.

---

### Step 6: Eliminate Bluetooth Audio Echo (Delay Sync)

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

---

*MultiWave is crafted with ❤️ by Pritam Joardar.*
