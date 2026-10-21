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
  AlertCircle,
  Clock,
  Sliders,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
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
      return <Bluetooth className="w-4 h-4 text-sky-400" />;
    case 'usb':
      return <Usb className="w-4 h-4 text-emerald-400" />;
    case 'headset':
      return <Headphones className="w-4 h-4 text-sky-400" />;
    case 'hdmidisplayport':
      return <Tv className="w-4 h-4 text-amber-400" />;
    case 'auxline':
      return <Speaker className="w-4 h-4 text-teal-400" />;
    case 'virtual':
      return <Radio className="w-4 h-4 text-cyan-400" />;
    default:
      return <Speaker className="w-4 h-4 text-slate-400" />;
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
      data-ui="device-card"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button, input, select, textarea, [data-prevent-card-toggle]')) return;
        onToggleSelect(device.id);
      }}
      className={`group relative rounded-2xl p-4 sm:p-5 transition-colors duration-150 border cursor-pointer select-none ${
        device.is_selected
          ? 'bg-studio-900 border-cyan-500/60 ring-1 ring-cyan-500/30'
          : 'bg-studio-900/60 border-studio-800 hover:border-studio-700 hover:bg-studio-900/80 opacity-90 hover:opacity-100'
      }`}
    >
      {/* Top Row: Device Icon, Name & Status Switch Pill */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
              device.is_selected
                ? 'bg-studio-850 border-cyan-500/40'
                : 'bg-studio-850 border-studio-800'
            }`}
          >
            {getDeviceIcon(device.device_type)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[260px] group-hover:text-cyan-200 transition-colors" title={device.name}>
                {device.name}
              </h3>
              {device.is_default && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold">
                  Default
                </span>
              )}
              {device.is_default_comm && !device.is_default && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-sky-950/80 text-sky-300 border border-sky-500/40 font-semibold">
                  Comm
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400 font-medium">
              <span className="capitalize">{device.device_type}</span>
              <span>•</span>
              <span>{device.channels === 2 ? 'Stereo' : device.channels === 1 ? 'Mono' : `${device.channels}ch`}</span>
              {device.sample_rate && (
                <>
                  <span>•</span>
                  <span className="text-[11px] text-slate-400 tabular-nums">{(device.sample_rate / 1000).toFixed(1)}kHz</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tactile Status Switch Pill */}
        <button
          type="button"
          onClick={() => onToggleSelect(device.id)}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-colors duration-150 border cursor-pointer active:scale-95 ${
            device.is_selected
              ? isAudioWorking
                ? 'bg-emerald-500 text-studio-950 border-emerald-400'
                : 'bg-cyan-500 text-studio-950 border-cyan-400'
              : 'border-studio-800 bg-studio-850 hover:border-studio-700 text-slate-400 hover:text-slate-200'
          }`}
          title={device.is_selected ? 'Click to disconnect this output' : 'Click to route audio to this output'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${
            device.is_selected
              ? isAudioWorking ? 'bg-studio-950' : 'bg-studio-950'
              : 'bg-slate-500'
          }`} />
          <span>{device.is_selected ? (isAudioWorking ? 'LIVE' : 'ACTIVE') : 'IDLE'}</span>
        </button>
      </div>

      {/* Studio Segmented LED Spectrum Display */}
      <div className="mt-3.5 bg-studio-950/80 rounded-xl p-2.5 border border-studio-800">
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

      {/* DSP Acoustic Effect Profiles (Segmented Control) */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium text-slate-400">
          <span className="flex items-center gap-1 text-slate-300">
            <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
            Acoustic Profile
          </span>
          <span className="text-[10px] text-cyan-400 font-semibold capitalize">
            {device.audio_effect === 'spatial_3d'
              ? '3D Spatial'
              : device.audio_effect === 'bass_boost'
              ? 'Bass Punch'
              : device.audio_effect === 'concert_hall'
              ? 'Concert Hall'
              : device.audio_effect === 'vocal_clarity'
              ? 'Vocal Clarity'
              : 'Studio'}
          </span>
        </div>

        <div className="bg-studio-950/70 p-1 rounded-xl border border-studio-800 grid grid-cols-5 gap-1">
          {(
            [
              { id: 'studio', label: 'Studio', icon: <Sliders className="w-3 h-3" /> },
              { id: 'spatial_3d', label: '3D', icon: <Radio className="w-3 h-3" /> },
              { id: 'bass_boost', label: 'Bass', icon: <Zap className="w-3 h-3" /> },
              { id: 'concert_hall', label: 'Concert', icon: <Music className="w-3 h-3" /> },
              { id: 'vocal_clarity', label: 'Vocal', icon: <Mic className="w-3 h-3" /> },
            ] as const
          ).map((eff) => {
            const isCur = (device.audio_effect || 'studio') === eff.id;
            return (
              <button
                key={eff.id}
                type="button"
                disabled={!device.is_selected}
                onClick={() => onEffectChange?.(device.id, eff.id)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                  isCur && device.is_selected
                    ? eff.id === 'spatial_3d'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                      : eff.id === 'bass_boost'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : eff.id === 'concert_hall'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : eff.id === 'vocal_clarity'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-studio-850/60 border border-transparent'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {eff.icon}
                <span className="truncate w-full text-center text-[9px]">{eff.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Volume Controls */}
      <div className="mt-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            Output Gain
          </span>
          <span className={`tabular-nums text-xs font-bold ${isMuted ? 'text-rose-400' : 'text-cyan-300'}`}>
            {isMuted ? 'MUTED' : `${volPercent}%`}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onToggleMute(device.id)}
            disabled={!device.is_selected}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                : 'bg-studio-850 border-studio-800 text-slate-300 hover:text-white hover:bg-studio-800'
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isTesting
                ? 'bg-cyan-500 text-studio-950 border-cyan-400'
                : 'bg-studio-850 hover:bg-studio-800 border-studio-800 text-slate-300 hover:text-white'
            }`}
            title="Play an isolated 3-second test chime on this output only"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isTesting ? 'Testing' : 'Test'}</span>
          </button>
        </div>
      </div>

      {/* Advanced Drawer: Bluetooth Sync Delay & Hardware Info */}
      <div data-ui="sync-drawer" className="mt-3.5 pt-2.5">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Sync Offset: <strong className="text-white tabular-nums">{device.sync_delay_ms} ms</strong>
            {device.device_type === 'bluetooth' && (
              <span className="text-[10px] text-cyan-400 tabular-nums">(Bluetooth A2DP)</span>
            )}
          </span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div data-prevent-card-toggle className="mt-2.5 p-3 rounded-xl bg-studio-950/80 border border-studio-800 space-y-3 cursor-default">
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400">Delay Compensation</span>
                <span className="text-cyan-400 font-bold tabular-nums">{device.sync_delay_ms} ms</span>
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

            {/* System Hardware Volume Indicator */}
            {device.system_volume !== undefined && device.system_volume !== null && (
              <div data-ui="hw-volume" className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Windows HW Endpoint Volume:</span>
                <span className="text-slate-300 font-semibold tabular-nums">
                  {Math.round((device.system_volume ?? 1) * 100)}% {device.system_mute ? '(HW Muted)' : ''}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error state if any */}
      {device.error_message && (
        <div className="mt-2.5 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{device.error_message}</span>
        </div>
      )}
    </div>
  );
};
