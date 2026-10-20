import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { AudioDevice, PlaybackMetrics, AppSettings, ToneType } from '../types/audio';

export class TauriAudioService {
  /** Check if running inside Tauri */
  static isTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  static async getAudioDevices(): Promise<AudioDevice[]> {
    if (!this.isTauri()) {
      return [];
    }
    return await invoke<AudioDevice[]>('get_audio_devices');
  }

  static async refreshAudioDevices(): Promise<AudioDevice[]> {
    if (!this.isTauri()) {
      return [];
    }
    return await invoke<AudioDevice[]>('refresh_audio_devices');
  }

  static async selectOutputDevice(deviceId: string): Promise<void> {
    if (!this.isTauri()) return;
    await invoke('select_output_device', { deviceId });
  }

  static async deselectOutputDevice(deviceId: string): Promise<void> {
    if (!this.isTauri()) return;
    await invoke('deselect_output_device', { deviceId });
  }

  static async selectAllDevices(): Promise<void> {
    if (!this.isTauri()) return;
    await invoke('select_all_devices');
  }

  static async deselectAllDevices(): Promise<void> {
    if (!this.isTauri()) return;
    await invoke('deselect_all_devices');
  }

  static async setDeviceVolume(deviceId: string, volume: number): Promise<void> {
    if (!this.isTauri()) return;
    await invoke('set_device_volume', { deviceId, volume });
  }

  static async setDeviceMute(deviceId: string, mute: boolean): Promise<void> {
    if (!this.isTauri()) return;
    await invoke('set_device_mute', { deviceId, mute });
  }

  static async setDeviceDelay(deviceId: string, delayMs: number): Promise<void> {
    if (!this.isTauri()) return;
    await invoke('set_device_delay', { deviceId, delayMs });
  }

  static async setDeviceAudioEffect(deviceId: string, effect: string): Promise<void> {
    if (!this.isTauri()) return;
    await invoke('set_device_audio_effect', { deviceId, effect });
  }

  static async setMasterVolume(volume: number): Promise<PlaybackMetrics | null> {
    if (!this.isTauri()) return null;
    return await invoke<PlaybackMetrics>('set_master_volume', { volume });
  }

  static async setMasterMute(mute: boolean): Promise<PlaybackMetrics | null> {
    if (!this.isTauri()) return null;
    return await invoke<PlaybackMetrics>('set_master_mute', { mute });
  }

  static async setToneType(toneType: ToneType): Promise<PlaybackMetrics | null> {
    if (!this.isTauri()) return null;
    return await invoke<PlaybackMetrics>('set_tone_type', { toneType });
  }

  static async startPlayback(): Promise<PlaybackMetrics> {
    if (!this.isTauri()) throw new Error('Native audio requires running in desktop mode (npm run tauri dev)');
    return await invoke<PlaybackMetrics>('start_playback');
  }

  static async pausePlayback(): Promise<PlaybackMetrics> {
    if (!this.isTauri()) throw new Error('Native audio requires running in desktop mode');
    return await invoke<PlaybackMetrics>('pause_playback');
  }

  static async resumePlayback(): Promise<PlaybackMetrics> {
    if (!this.isTauri()) throw new Error('Native audio requires running in desktop mode');
    return await invoke<PlaybackMetrics>('resume_playback');
  }

  static async stopPlayback(): Promise<PlaybackMetrics> {
    if (!this.isTauri()) throw new Error('Native audio requires running in desktop mode');
    return await invoke<PlaybackMetrics>('stop_playback');
  }

  static async testOutputDevice(deviceId: string): Promise<void> {
    if (!this.isTauri()) throw new Error('Native audio requires running in desktop mode');
    await invoke('test_output_device', { deviceId });
  }

  static async getPlaybackState(): Promise<PlaybackMetrics> {
    if (!this.isTauri()) {
      return {
        status: 'stopped',
        active_stream_count: 0,
        master_volume: 0.8,
        master_mute: false,
        tone_type: 'system_loopback',
        sample_rate: 48000,
        underrun_count: 0,
        input_level: 0,
        capture_device: 'Virtual Speakers (Auto)',
      };
    }
    return await invoke<PlaybackMetrics>('get_playback_state');
  }

  static async setCaptureDevice(deviceName?: string): Promise<PlaybackMetrics | null> {
    if (!this.isTauri()) return null;
    return await invoke<PlaybackMetrics>('set_capture_device', { deviceName });
  }

  static async openWindowsSoundSettings(): Promise<void> {
    if (!this.isTauri()) return;
    await invoke('open_windows_sound_settings');
  }

  static async setDefaultOutputDevice(deviceId: string): Promise<void> {
    if (!this.isTauri()) return;
    await invoke('set_default_output_device', { deviceId });
  }

  static async activateMultiwaveRouting(): Promise<PlaybackMetrics> {
    if (!this.isTauri()) throw new Error('Native audio requires running in desktop mode');
    return await invoke<PlaybackMetrics>('activate_multiwave_routing');
  }

  static async configureVirtualSpeakerName(): Promise<void> {
    if (!this.isTauri()) return;
    await invoke('configure_virtual_speaker_name');
  }

  static async installVirtualSpeakerDriver(): Promise<void> {
    if (!this.isTauri()) return;
    await invoke('install_virtual_speaker_driver');
  }

  static async getSettings(): Promise<AppSettings> {
    if (!this.isTauri()) {
      return {
        selected_device_ids: [],
        device_volumes: {},
        device_mutes: {},
        device_delays: {},
        master_volume: 1.0,
        master_mute: false,
        tone_type: 'system_loopback',
        theme: 'dark',
        auto_reconnect: true,
      };
    }
    return await invoke<AppSettings>('get_settings');
  }

  static async updateSettings(newSettings: AppSettings): Promise<AppSettings> {
    if (!this.isTauri()) return newSettings;
    return await invoke<AppSettings>('update_settings', { newSettings });
  }

  /** Subscribe to real-time Windows Core Audio device change events */
  static async onDeviceStateChanged(callback: () => void): Promise<UnlistenFn> {
    if (!this.isTauri()) return () => {};
    return await listen('device-state-changed', () => callback());
  }

  static async onDefaultDeviceChanged(callback: () => void): Promise<UnlistenFn> {
    if (!this.isTauri()) return () => {};
    return await listen('default-device-changed', () => callback());
  }

  static async onDeviceHeartbeat(callback: () => void): Promise<UnlistenFn> {
    if (!this.isTauri()) return () => {};
    return await listen('device-heartbeat', () => callback());
  }
}
