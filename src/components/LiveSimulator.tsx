import React, { useState, useEffect } from 'react';
import {
  Bluetooth,
  Speaker,
  Tv,
  Sliders,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Play,
  Check,
  Zap,
  Mic,
  Radio,
  Music,
} from 'lucide-react';
import { DeviceWaveVisualizer } from './DeviceWaveVisualizer';
import { AudioEffectType } from '../types/audio';

interface LiveSimulatorProps {
  className?: string;
}

export const LiveSimulator: React.FC<LiveSimulatorProps> = ({ className = '' }) => {
  // Interactive Live Device Cards Simulator state
  const [simDevices, setSimDevices] = useState<{
    id: string;
    name: string;
    type: 'bluetooth' | 'auxline' | 'hdmidisplayport';
    format: string;
    isSelected: boolean;
    volume: number;
    isMuted: boolean;
    isTesting: boolean;
    audioEffect: AudioEffectType;
  }[]>([
    {
      id: 'headphones',
      name: 'Headphones (realme Buds Wireless 3)',
      type: 'bluetooth',
      format: '48.0 kHz • Stereo',
      isSelected: true,
      volume: 1.0,
      isMuted: false,
      isTesting: false,
      audioEffect: 'spatial_3d',
    },
    {
      id: 'speaker',
      name: 'Speaker (Realtek(R) Audio)',
      type: 'auxline',
      format: '48.0 kHz • Stereo',
      isSelected: false,
      volume: 1.0,
      isMuted: false,
      isTesting: false,
      audioEffect: 'bass_boost',
    },
    {
      id: 'monitor',
      name: 'GS27QC (NVIDIA High Definition Audio)',
      type: 'hdmidisplayport',
      format: '48.0 kHz • Stereo',
      isSelected: false,
      volume: 1.0,
      isMuted: false,
      isTesting: false,
      audioEffect: 'studio',
    },
  ]);

  const [simInputLevel, setSimInputLevel] = useState(0.24);

  // Subtle real-time audio signal pulse for the interactive web simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setSimInputLevel(0.18 + Math.sin(Date.now() / 320) * 0.08 + (Math.random() - 0.5) * 0.03);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const toggleSimDevice = (id: string) => {
    setSimDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isSelected: !d.isSelected } : d))
    );
  };

  const toggleSimMute = (id: string) => {
    setSimDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isMuted: !d.isMuted } : d))
    );
  };

  const setSimVolume = (id: string, vol: number) => {
    setSimDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, volume: vol } : d))
    );
  };

  const setSimEffect = (id: string, effect: AudioEffectType) => {
    setSimDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, audioEffect: effect } : d))
    );
  };

  const testSimDevice = (id: string) => {
    setSimDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isTesting: true } : d))
    );
    setTimeout(() => {
      setSimDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isTesting: false } : d))
      );
    }, 2500);
  };

  return (
    <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-studio-700/80 bg-studio-900/90 shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Simulator Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-studio-800 pb-3 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            Interactive Audio Output &amp; DSP Effects Simulator
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any device card or checkbox to select or unselect outputs. Toggle between Studio, 3D Spatial Surround, Bass Punch, Concert Hall, and Vocal Clarity acoustic profiles in real-time. Unselected devices immediately silence and stay IDLE.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-lg shrink-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Interactive 60 FPS Studio Meter</span>
        </div>
      </div>

      {/* Grid of Interactive Simulator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-left">
        {simDevices.map((dev) => {
          const volPercent = Math.round(dev.volume * 100);
          return (
            <div
              key={dev.id}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('button, input, select, textarea, [data-prevent-card-toggle]')) return;
                toggleSimDevice(dev.id);
              }}
              className={`relative rounded-xl p-4 transition-all duration-200 border cursor-pointer select-none ${
                dev.isSelected
                  ? 'bg-studio-900/90 border-cyan-500/50 shadow-[0_0_25px_rgba(0,242,254,0.08)]'
                  : 'bg-studio-900/40 border-studio-700/50 hover:border-cyan-500/40 hover:bg-studio-900/60 opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${
                      dev.isSelected
                        ? 'bg-studio-800 border-cyan-500/40'
                        : 'bg-studio-850 border-studio-700/60'
                    }`}
                  >
                    {dev.type === 'bluetooth' ? (
                      <Bluetooth className="w-4 h-4 text-cyan-400" />
                    ) : dev.type === 'hdmidisplayport' ? (
                      <Tv className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Speaker className="w-4 h-4 text-teal-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate" title={dev.name}>
                      {dev.name}
                    </h4>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {dev.format}
                    </div>
                  </div>
                </div>

                {/* Selection Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleSimDevice(dev.id)}
                  className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-lg border transition-all cursor-pointer ${
                    dev.isSelected
                      ? 'bg-cyan-500 border-cyan-400 text-studio-950 shadow-[0_0_10px_rgba(0,242,254,0.45)]'
                      : 'border-studio-700 bg-studio-850 hover:border-cyan-500/50 text-slate-500'
                  }`}
                  title={dev.isSelected ? 'Unselect card' : 'Select card'}
                >
                  {dev.isSelected ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.75]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                </button>
              </div>

              {/* Live Reactive Studio Spectrum Visualizer */}
              <div className="mt-3">
                <DeviceWaveVisualizer
                  isActive={dev.isSelected && !dev.isMuted && dev.volume > 0}
                  isSelected={dev.isSelected}
                  isTesting={dev.isTesting}
                  isMuted={dev.isMuted}
                  volume={dev.volume}
                  inputLevel={simInputLevel}
                  audioEffect={dev.audioEffect}
                  deviceName={dev.name}
                />
              </div>

              {/* DSP Acoustic Effect Profile Selector */}
              <div className="mt-2.5 pt-2 border-t border-studio-800/70">
                <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                  <span className="text-slate-300 font-medium flex items-center gap-1 font-sans">
                    <SlidersHorizontal className="w-2.5 h-2.5 text-cyan-400" />
                    Acoustic Profile
                  </span>
                  <span className="text-[9px] text-cyan-400/90 font-mono capitalize">
                    {dev.audioEffect === 'spatial_3d'
                      ? '3D Spatial'
                      : dev.audioEffect === 'bass_boost'
                      ? 'Bass Punch'
                      : dev.audioEffect === 'concert_hall'
                      ? 'Concert Hall'
                      : dev.audioEffect === 'vocal_clarity'
                      ? 'Vocal Clarity'
                      : 'Studio Master'}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1">
                  {(
                    [
                      { id: 'studio', label: 'Studio', icon: <Sliders className="w-2.5 h-2.5" /> },
                      { id: 'spatial_3d', label: '3D', icon: <Radio className="w-2.5 h-2.5" /> },
                      { id: 'bass_boost', label: 'Bass', icon: <Zap className="w-2.5 h-2.5" /> },
                      { id: 'concert_hall', label: 'Concert', icon: <Music className="w-2.5 h-2.5" /> },
                      { id: 'vocal_clarity', label: 'Vocal', icon: <Mic className="w-2.5 h-2.5" /> },
                    ] as const
                  ).map((eff) => {
                    const isCur = dev.audioEffect === eff.id;
                    return (
                      <button
                        key={eff.id}
                        type="button"
                        disabled={!dev.isSelected}
                        onClick={() => setSimEffect(dev.id, eff.id)}
                        className={`py-1 px-0.5 rounded text-[9px] font-medium border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          isCur && dev.isSelected
                            ? eff.id === 'spatial_3d'
                              ? 'bg-purple-950/80 border-purple-500/70 text-purple-200 shadow-[0_0_8px_rgba(192,132,252,0.25)] font-semibold'
                              : eff.id === 'bass_boost'
                              ? 'bg-amber-950/80 border-amber-500/70 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.25)] font-semibold'
                              : eff.id === 'concert_hall'
                              ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.25)] font-semibold'
                              : eff.id === 'vocal_clarity'
                              ? 'bg-rose-950/80 border-rose-500/70 text-rose-200 shadow-[0_0_8px_rgba(251,113,133,0.25)] font-semibold'
                              : 'bg-cyan-950/80 border-cyan-500/70 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.25)] font-semibold'
                            : 'bg-studio-850/60 border-studio-800 text-slate-400 hover:text-slate-200 hover:bg-studio-800'
                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                      >
                        {eff.icon}
                        <span className="truncate w-full text-center text-[8px]">{eff.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Volume & Test Controls */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-cyan-400" />
                    Gain
                  </span>
                  <span className={`font-mono font-semibold ${dev.isMuted ? 'text-rose-400' : 'text-cyan-300'}`}>
                    {dev.isMuted ? 'MUTED' : `${volPercent}%`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSimMute(dev.id)}
                    disabled={!dev.isSelected}
                    className={`p-1.5 rounded-lg border transition-all ${
                      dev.isMuted
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                        : 'bg-studio-800 border-studio-700 text-slate-300'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                    title={dev.isMuted ? 'Unmute' : 'Mute'}
                  >
                    {dev.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={dev.volume}
                    disabled={!dev.isSelected}
                    onChange={(e) => setSimVolume(dev.id, parseFloat(e.target.value))}
                    className="w-full volume-slider disabled:opacity-40"
                  />

                  <button
                    type="button"
                    onClick={() => testSimDevice(dev.id)}
                    disabled={dev.isTesting}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium border flex items-center gap-1 transition-all ${
                      dev.isTesting
                        ? 'bg-cyan-500 text-studio-950 border-cyan-400 font-semibold'
                        : 'bg-studio-800 hover:bg-studio-700 border-studio-700 text-slate-300'
                    }`}
                    title="Test chime"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{dev.isTesting ? 'Testing' : 'Test'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
