export type DeviceType =
  | 'bluetooth'
  | 'usb'
  | 'auxline'
  | 'hdmidisplayport'
  | 'headset'
  | 'virtual'
  | 'unknown';

export type DeviceState = 'active' | 'disabled' | 'unplugged' | 'notpresent';

export type PlaybackStatus = 'stopped' | 'playing' | 'paused';

export type ToneType =
  | 'system_loopback'
  | 'melody_arpeggio'
  | 'major_chord'
  | 'sine_440'
  | 'sine_880'
  | 'pink_noise'
  | 'white_noise';

export type AudioEffectType =
  | 'studio'
  | 'spatial_3d'
  | 'bass_boost'
  | 'concert_hall'
  | 'vocal_clarity';

export interface AudioDevice {
  id: string;
  name: string;
  device_type: DeviceType;
  is_default: boolean;
  is_default_comm: boolean;
  state: DeviceState;
  is_selected: boolean;
  software_volume: number; // 0.0 to 1.0
  software_mute: boolean;
  audio_effect?: AudioEffectType;
  system_volume?: number | null; // 0.0 to 1.0 (from Windows Core Audio)
  system_mute?: boolean | null;
  sample_rate?: number | null;
  channels?: number | null;
  sync_delay_ms: number; // 0 to 500 ms delay
  is_active_streaming: boolean;
  error_message?: string | null;
}

export interface PlaybackMetrics {
  status: PlaybackStatus;
  active_stream_count: number;
  master_volume: number;
  master_mute: boolean;
  tone_type: ToneType;
  sample_rate: number;
  underrun_count: number;
  input_level: number;
  capture_device: string;
}

export interface AppSettings {
  selected_device_ids: string[];
  device_volumes: Record<string, number>;
  device_mutes: Record<string, boolean>;
  device_delays: Record<string, number>;
  master_volume: number;
  master_mute: boolean;
  tone_type: ToneType;
  buffer_size_frames?: number | null;
  theme: string;
  auto_reconnect: boolean;
}
