import React, { useState } from 'react';
import {
  Bluetooth,
  Usb,
  Headphones,
  Tv,
  Speaker,
  Radio,
  Volume2,
  VolumeX,
  Play,
  Check,
  AlertCircle,
  Clock,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Mic,
  Music,
} from 'lucide-react';
import { AudioDevice, DeviceType, AudioEffectType } from '../types/audio';
import { DeviceWaveVisualizer } from './DeviceWaveVisualizer';

interface DeviceCardProps {
  device: AudioDevice;
  isTesting: boolean;
  isPlaying?: boolean;
  isMasterMuted?: boolean;
  masterVolume?: number;
  inputLevel?: number;
  onToggleSelect: (id: string) => void;
  onVolumeChange: (id: string, volume: number) => void;
  onToggleMute: (id: string) => void;
  onDelayChange: (id: string, delayMs: number) => void;
  onEffectChange?: (id: string, effect: AudioEffectType) => void;
  onTestOutput: (id: string) => void;
}

function getDeviceIcon(type: DeviceType) {
  switch (type) {
    case 'bluetooth':
      return <Bluetooth className="w-5 h-5 text-cyan-400" />;
    case 'usb':
      return <Usb className="w-5 h-5 text-emerald-400" />;
    case 'headset':
      return <Headphones className="w-5 h-5 text-purple-400" />;
    case 'hdmidisplayport':
      return <Tv className="w-5 h-5 text-amber-400" />;
    case 'auxline':
      return <Speaker className="w-5 h-5 text-teal-400" />;
    case 'virtual':
      return <Radio className="w-5 h-5 text-pink-400" />;
    default:
      return <Speaker className="w-5 h-5 text-slate-400" />;
  }
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  isTesting,
  isPlaying = false,
  isMasterMuted = false,
  masterVolume = 1.0,
  inputLevel = 0,
  onToggleSelect,
  onVolumeChange,
  onToggleMute,
  onDelayChange,
  onEffectChange,
  onTestOutput,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const volPercent = Math.round(device.software_volume * 100);
  const isMuted = device.software_mute;

  // Individual audio works strictly when playback is running, device is selected, gain > 0 and not muted
  const isAudioWorking = Boolean(
    ((isPlaying || device.is_active_streaming) &&
      device.is_selected &&
      !device.software_mute &&
      !isMasterMuted &&
      device.software_volume > 0 &&
      masterVolume > 0 &&
      device.device_type !== 'virtual') ||
    isTesting
  );

  return (
    <div
      className={`relative rounded-xl p-5 transition-all duration-200 border ${
        device.is_selected
          ? 'bg-studio-900/90 border-cyan-500/50 shadow-[0_0_25px_rgba(0,242,254,0.08)]'
          : 'bg-studio-900/40 border-studio-700/50 hover:border-studio-600/70 opacity-85 hover:opacity-100'
      }`}
    >
      {/* Top Row: Icon, Name, Checkbox */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
              device.is_selected
                ? 'bg-studio-800 border-cyan-500/40 shadow-inner'
                : 'bg-studio-850 border-studio-700/60'
            }`}
          >
            {getDeviceIcon(device.device_type)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-white truncate max-w-[240px] sm:max-w-[320px]" title={device.name}>
                {device.name}
              </h3>
              {device.is_default && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  Default Output
                </span>
              )}
              {device.is_default_comm && !device.is_default && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40">
                  Default Comm
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
              <span className="capitalize">{device.device_type}</span>
              {device.sample_rate && (
                <>
                  <span>•</span>
                  <span>{(device.sample_rate / 1000).toFixed(1)} kHz</span>
                </>
              )}
              {device.channels && (
                <>
                  <span>•</span>
                  <span>{device.channels === 2 ? 'Stereo' : device.channels === 1 ? 'Mono' : `${device.channels}ch`}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Selection Button */}
        <button
          onClick={() => onToggleSelect(device.id)}
          className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border transition-all duration-200 cursor-pointer ${
            device.is_selected
              ? 'bg-cyan-500 border-cyan-400 text-studio-950 shadow-[0_0_12px_rgba(0,242,254,0.45)] hover:bg-cyan-400 active:scale-95'
              : 'border-studio-700 bg-studio-850 hover:border-cyan-500/50 hover:bg-studio-800 text-slate-500 hover:text-cyan-400 active:scale-95'
          }`}
          title={device.is_selected ? 'Output Enabled (Click to disconnect)' : 'Click to route audio to this output'}
        >
          {device.is_selected ? (
            <Check className="w-4 h-4 stroke-[2.75]" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors" />
          )}
        </button>
      </div>

      {/* Studio Segmented LED Spectrum & Peak Meter on this device card */}
      <div className="mt-4">
        <DeviceWaveVisualizer
          isActive={isAudioWorking}
          isSelected={device.is_selected}
          isTesting={isTesting}
          isMuted={isMuted || isMasterMuted}
          volume={device.software_volume}
          inputLevel={inputLevel}
          audioEffect={device.audio_effect || 'studio'}
          deviceName={device.name}
        />
      </div>

      {/* DSP Acoustic Effect Profile Selector */}
      <div className="mt-3 pt-2.5 border-t border-studio-800/70">
        <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
          <span className="text-slate-300 font-medium flex items-center gap-1.5 font-sans">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Acoustic Profile
          </span>
          <span className="text-[10px] text-cyan-400/90 font-mono capitalize">
            {device.audio_effect === 'spatial_3d'
              ? '3D Spatial'
              : device.audio_effect === 'bass_boost'
              ? 'Bass Punch'
              : device.audio_effect === 'concert_hall'
              ? 'Concert Hall'
              : device.audio_effect === 'vocal_clarity'
              ? 'Vocal Clarity'
              : 'Studio Master'}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {(
            [
              { id: 'studio', label: 'Studio', icon: <Sliders className="w-3 h-3" />, desc: 'Linear reference response & mastering soft-limiter' },
              { id: 'spatial_3d', label: '3D Spatial', icon: <Radio className="w-3 h-3" />, desc: 'Binaural crossfeed & wide immersive soundstage' },
              { id: 'bass_boost', label: 'Bass', icon: <Zap className="w-3 h-3" />, desc: 'Low-frequency punch & harmonic warmth' },
              { id: 'concert_hall', label: 'Concert', icon: <Music className="w-3 h-3" />, desc: 'Amphitheater acoustic reverb & reflections' },
              { id: 'vocal_clarity', label: 'Vocal', icon: <Mic className="w-3 h-3" />, desc: 'Dialogue presence boost for clear voice' },
            ] as const
          ).map((eff) => {
            const isCur = (device.audio_effect || 'studio') === eff.id;
            return (
              <button
                key={eff.id}
                type="button"
                disabled={!device.is_selected}
                onClick={() => onEffectChange?.(device.id, eff.id)}
                className={`py-1 px-1 rounded-lg text-[10px] font-medium border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                  isCur && device.is_selected
                    ? eff.id === 'spatial_3d'
                      ? 'bg-purple-950/80 border-purple-500/70 text-purple-200 shadow-[0_0_10px_rgba(192,132,252,0.25)] font-semibold'
                      : eff.id === 'bass_boost'
                      ? 'bg-amber-950/80 border-amber-500/70 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.25)] font-semibold'
                      : eff.id === 'concert_hall'
                      ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.25)] font-semibold'
                      : eff.id === 'vocal_clarity'
                      ? 'bg-rose-950/80 border-rose-500/70 text-rose-200 shadow-[0_0_10px_rgba(251,113,133,0.25)] font-semibold'
                      : 'bg-cyan-950/80 border-cyan-500/70 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.25)] font-semibold'
                    : 'bg-studio-850/60 border-studio-800 text-slate-400 hover:text-slate-200 hover:bg-studio-800'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
                title={`${eff.label}: ${eff.desc}`}
              >
                {eff.icon}
                <span className="truncate w-full text-center tracking-tight text-[9px]">{eff.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Volume Controls */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Software Gain
          </span>
          <div className="flex items-center gap-2 font-mono">
            <span className={`font-semibold ${isMuted ? 'text-rose-400' : 'text-cyan-300'}`}>
              {isMuted ? 'MUTED' : `${volPercent}%`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleMute(device.id)}
            disabled={!device.is_selected}
            className={`p-2 rounded-lg border transition-all ${
              isMuted
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                : 'bg-studio-800 border-studio-700 text-slate-300 hover:text-white hover:bg-studio-700/80'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={isMuted ? 'Unmute Device' : 'Mute Device'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={device.software_volume}
              disabled={!device.is_selected}
              onChange={(e) => onVolumeChange(device.id, parseFloat(e.target.value))}
              className="w-full volume-slider disabled:opacity-40"
            />
          </div>

          <button
            onClick={() => onTestOutput(device.id)}
            disabled={isTesting}
            className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              isTesting
                ? 'bg-cyan-500 text-studio-950 border-cyan-400 animate-pulse font-semibold shadow-[0_0_12px_rgba(0,242,254,0.4)]'
                : 'bg-studio-800 hover:bg-studio-700/80 border-studio-700 text-slate-300 hover:text-white'
            }`}
            title="Play an isolated 3-second test chime on this output only"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isTesting ? 'animate-bounce' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Test'}</span>
          </button>
        </div>
      </div>

      {/* Advanced Drawer: Bluetooth Sync Delay & Hardware Info */}
      <div className="mt-4 pt-3 border-t border-studio-800/80">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Sync Offset: <strong className="text-white font-mono">{device.sync_delay_ms} ms</strong>
            {device.device_type === 'bluetooth' && (
              <span className="text-[10px] text-cyan-400/90 font-mono">(Bluetooth A2DP)</span>
            )}
          </span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-3 rounded-lg bg-studio-950/70 border border-studio-800/80 space-y-3">
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                <span className="text-slate-400">Delay Compensation</span>
                <span className="text-cyan-400 font-semibold">{device.sync_delay_ms} ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="5"
                value={device.sync_delay_ms}
                onChange={(e) => onDelayChange(device.id, parseInt(e.target.value, 10))}
                className="w-full volume-slider"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                Add delay to wired AUX/USB speakers to align with high-latency Bluetooth speaker buffers (typically 120-220ms).
              </p>
            </div>

            {/* System Hardware Volume Indicator (Separate from Software Gain) */}
            {device.system_volume !== undefined && device.system_volume !== null && (
              <div className="pt-2 border-t border-studio-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Windows HW Endpoint Volume:</span>
                <span className="text-slate-300">
                  {Math.round((device.system_volume ?? 1) * 100)}% {device.system_mute ? '(HW Muted)' : ''}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error state if any */}
      {device.error_message && (
        <div className="mt-3 p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{device.error_message}</span>
        </div>
      )}
    </div>
  );
};
