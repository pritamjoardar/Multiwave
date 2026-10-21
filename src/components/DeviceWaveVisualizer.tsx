import React, { useEffect, useState, useRef } from 'react';
import {
  VolumeX,
  Sliders,
  Radio,
  Zap,
  Music,
  Mic,
  Layers,
} from 'lucide-react';
import { AudioEffectType } from '../types/audio';

interface DeviceWaveVisualizerProps {
  isActive: boolean;
  isTesting: boolean;
  isMuted: boolean;
  volume: number;
  inputLevel?: number;
  isSelected?: boolean;
  audioEffect?: AudioEffectType;
  deviceName?: string;
}

const BAND_COUNT = 16;
const LED_SEGMENTS = 6;

export const DeviceWaveVisualizer: React.FC<DeviceWaveVisualizerProps> = ({
  isActive,
  isTesting,
  isMuted,
  volume,
  inputLevel = 0,
  isSelected = false,
  audioEffect = 'studio',
}) => {
  const [hasAudioSignal, setHasAudioSignal] = useState(false);
  const [meterMode, setMeterMode] = useState<'spectrum' | 'stereo_vu'>('spectrum');
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // An output is strictly active ONLY when selected, gain > 0, unmuted, and actively playing (or in isolated test mode)
  const isEffectivelyActive = Boolean(
    isTesting || (isSelected && isActive && !isMuted && volume > 0)
  );

  // Audio presence detection with micro-pause bridge
  useEffect(() => {
    if (!isEffectivelyActive) {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      setHasAudioSignal(false);
      return;
    }

    const isAudible = isTesting || ((inputLevel ?? 0) > 0.002);
    if (isAudible) {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      setHasAudioSignal(true);
    } else {
      if (!holdTimerRef.current) {
        holdTimerRef.current = setTimeout(() => {
          setHasAudioSignal(false);
          holdTimerRef.current = null;
        }, 320);
      }
    }
  }, [isEffectivelyActive, isTesting, inputLevel]);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, []);

  // Multi-band spectrum values (0 to 100) and floating peak caps (0 to 100)
  const [bandLevels, setBandLevels] = useState<number[]>(Array(BAND_COUNT).fill(0));
  const [peakCaps, setPeakCaps] = useState<number[]>(Array(BAND_COUNT).fill(0));

  // Stereo L & R channel levels for VU meter mode (0 to 100)
  const [stereoL, setStereoL] = useState(0);
  const [stereoR, setStereoR] = useState(0);
  const [peakL, setPeakL] = useState(0);
  const [peakR, setPeakR] = useState(0);

  const activeVisual = Boolean(isEffectivelyActive && hasAudioSignal);

  // High-performance 60 FPS studio audio meter animation loop
  useEffect(() => {
    if (!activeVisual) {
      setBandLevels(Array(BAND_COUNT).fill(0));
      setPeakCaps(Array(BAND_COUNT).fill(0));
      setStereoL(0);
      setStereoR(0);
      setPeakL(0);
      setPeakR(0);
      return;
    }

    let animId: number;
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = Math.min(100, now - lastTime);
      lastTime = now;

      // Base energy from real audio input level modulated by volume
      const baseEnergy = isTesting
        ? 0.82
        : Math.min(1.0, Math.max(0.2, (inputLevel || 0) * 5.2)) * Math.max(0.2, volume);

      // Frequency profile weightings based on selected Audio DSP Effect
      const effectWeights = getEffectWeights(audioEffect);

      // Calculate instantaneous frequency bands
      const newBands = Array.from({ length: BAND_COUNT }, (_, i) => {
        const freqWeight = effectWeights[i] || 1.0;
        const speed = 0.006 + i * 0.0012;
        const phase = i * 0.52;
        const osc1 = Math.sin(now * speed + phase) * 0.35 + 0.55;
        const osc2 = Math.cos(now * (speed * 0.6) + phase * 1.4) * 0.25;
        const jitter = (Math.random() - 0.5) * 0.18;

        const val = Math.max(0, Math.min(1.0, (osc1 + osc2 + jitter) * baseEnergy * freqWeight));
        return Math.round(val * 100);
      });

      setBandLevels(newBands);

      // Gravity decay for floating peak-hold caps (studio hardware rack behavior)
      setPeakCaps((prev) =>
        prev.map((cap, i) => {
          const current = newBands[i];
          if (current >= cap) {
            return current;
          }
          // Slow smooth decay downwards
          const decayRate = 0.08 * (dt / 16);
          return Math.max(0, Math.round(cap - (cap - current) * decayRate - 0.5));
        })
      );

      // Stereo Left & Right VU meters
      const leftEnergy = Math.min(100, Math.round(baseEnergy * (Math.sin(now * 0.008) * 0.2 + 0.8) * 100));
      const rightEnergy = Math.min(
        100,
        Math.round(
          baseEnergy *
            (audioEffect === 'spatial_3d'
              ? Math.cos(now * 0.008 + 0.8) * 0.35 + 0.65
              : Math.sin(now * 0.008 + 0.2) * 0.2 + 0.8) *
            100
        )
      );

      setStereoL(leftEnergy);
      setStereoR(rightEnergy);

      setPeakL((prev) => (leftEnergy >= prev ? leftEnergy : Math.max(0, prev - 1.5)));
      setPeakR((prev) => (rightEnergy >= prev ? rightEnergy : Math.max(0, prev - 1.5)));

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activeVisual, isTesting, volume, inputLevel, audioEffect]);

  // Visual theme colors corresponding to active Audio DSP profile
  const theme = getEffectTheme(audioEffect);

  return (
    <div
      data-ui="audio-visualizer"
      className={`px-3 py-2.5 rounded-xl border transition-colors select-none ${
        activeVisual
          ? 'border-studio-700 bg-studio-950'
          : 'border-studio-800 bg-studio-950/40 opacity-75'
      }`}
    >
      {/* Telemetry Header */}
      <div className="flex items-center justify-between mb-2 text-[10px]">
        <div className="flex items-center gap-1.5 min-w-0">
          {isMuted && isSelected ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          ) : (
            <span
              className={`shrink-0 transition-colors ${
                activeVisual ? theme.accentText : 'text-slate-500'
              }`}
            >
              {theme.icon}
            </span>
          )}

          <span className="font-semibold text-slate-300 truncate">
            {isTesting ? 'Isolated Chime Calibration' : theme.title}
          </span>

          {/* Toggle between Spectrum EQ and Stereo VU */}
          <button
            type="button"
            onClick={() => setMeterMode((m) => (m === 'spectrum' ? 'stereo_vu' : 'spectrum'))}
            className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-studio-850 hover:bg-studio-800 border border-studio-700 text-[9px] text-slate-400 hover:text-cyan-300 transition-colors ml-1"
            title="Switch Visualizer View (Spectrum / Stereo VU)"
          >
            <Layers className="w-2.5 h-2.5" />
            <span>{meterMode === 'spectrum' ? 'Spectrum' : 'Stereo VU'}</span>
          </button>
        </div>

        {/* State Badge: Strictly IDLE when unselected */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeVisual && (
            <span className={`w-1.5 h-1.5 rounded-full ${theme.glowDot}`} />
          )}
          <span
            className={`font-semibold text-[9px] tabular-nums transition-colors duration-150 ${
              isTesting
                ? 'text-cyan-300'
                : activeVisual
                ? theme.accentText
                : isMuted && isSelected
                ? 'text-rose-400'
                : 'text-slate-500'
            }`}
          >
            {isTesting
              ? 'TEST CHIME'
              : activeVisual
              ? `${theme.badge}`
              : isMuted && isSelected
              ? 'MUTED'
              : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Main Visualizer Body */}
      {meterMode === 'spectrum' ? (
        /* ================= Mode 1: Studio Segmented LED Frequency Rack ================= */
        <div className="space-y-1">
          <div className="flex items-end justify-between gap-1 h-9 px-0.5">
            {bandLevels.map((level, bandIdx) => {
              const activeSegments = activeVisual
                ? Math.min(LED_SEGMENTS, Math.ceil((level / 100) * LED_SEGMENTS))
                : 0;
              const peakSegment = activeVisual
                ? Math.min(LED_SEGMENTS - 1, Math.floor((peakCaps[bandIdx] / 100) * LED_SEGMENTS))
                : -1;

              return (
                <div key={bandIdx} className="flex-1 flex flex-col justify-end gap-0.5 h-full relative">
                  {/* Floating Peak-Hold Needle Cap */}
                  {activeVisual && peakSegment >= 0 && (
                    <div
                      className="absolute w-full h-[2px] rounded-full transition-transform duration-75"
                      style={{
                        bottom: `${Math.min(94, Math.max(6, (peakCaps[bandIdx] / 100) * 88))}%`,
                        background:
                          peakSegment >= LED_SEGMENTS - 1
                            ? '#f43f5e'
                            : peakSegment >= 4
                            ? '#f59e0b'
                            : theme.peakColor,
                      }}
                    />
                  )}

                  {/* 6 Stacked Studio LED Segments */}
                  {Array.from({ length: LED_SEGMENTS }).map((_, segIdx) => {
                    const segFromBottom = LED_SEGMENTS - 1 - segIdx;
                    const isLit = activeVisual && segFromBottom < activeSegments;

                    return (
                      <div
                        key={segIdx}
                        className="w-full h-1 rounded-[1.5px] transition-opacity duration-75"
                        style={{
                          background: isLit
                            ? segFromBottom === LED_SEGMENTS - 1
                              ? '#f43f5e' // +3dB Overload warning
                              : segFromBottom >= 4
                              ? '#f59e0b' // 0dB Near peak
                              : segFromBottom >= 2
                              ? theme.ledColor
                              : '#10b981' // Green nominal base
                            : '#1e293b', // Dim studio standby
                          opacity: isLit ? 1.0 : 0.22,
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Micro Frequency Scale Labels */}
          <div className="flex justify-between text-[7px] text-slate-500 tabular-nums font-medium px-0.5 pt-0.5 select-none">
            <span>40Hz</span>
            <span>250Hz</span>
            <span>1kHz</span>
            <span>4kHz</span>
            <span>14kHz</span>
            <span>20kHz</span>
          </div>
        </div>
      ) : (
        /* ================= Mode 2: Stereo Dual VU Decibel Rack ================= */
        <div className="space-y-1.5 py-0.5 px-0.5 text-[9px] tabular-nums">
          {/* Channel L */}
          <div className="flex items-center gap-2">
            <span className="w-3 text-slate-400 font-bold text-[8px]">L</span>
            <div className="flex-1 h-3 rounded bg-studio-900 border border-studio-800 p-0.5 relative overflow-hidden flex items-center">
              <div
                className="h-full rounded-sm transition-opacity duration-75 bg-emerald-500"
                style={{ width: `${activeVisual ? stereoL : 0}%`, opacity: activeVisual ? 0.95 : 0.15 }}
              />
              {activeVisual && (
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-rose-400"
                  style={{ left: `${Math.min(98, peakL)}%` }}
                />
              )}
            </div>
            <span className="w-10 text-right text-[8px] text-slate-400">
              {activeVisual ? `${Math.round((stereoL / 100) * 12 - 12)} dB` : '-∞ dB'}
            </span>
          </div>

          {/* Channel R */}
          <div className="flex items-center gap-2">
            <span className="w-3 text-slate-400 font-bold text-[8px]">R</span>
            <div className="flex-1 h-3 rounded bg-studio-900 border border-studio-800 p-0.5 relative overflow-hidden flex items-center">
              <div
                className="h-full rounded-sm transition-opacity duration-75 bg-emerald-500"
                style={{ width: `${activeVisual ? stereoR : 0}%`, opacity: activeVisual ? 0.95 : 0.15 }}
              />
              {activeVisual && (
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-rose-400"
                  style={{ left: `${Math.min(98, peakR)}%` }}
                />
              )}
            </div>
            <span className="w-10 text-right text-[8px] text-slate-400">
              {activeVisual ? `${Math.round((stereoR / 100) * 12 - 12)} dB` : '-∞ dB'}
            </span>
          </div>

          {/* Decibel Reference Axis */}
          <div className="flex justify-between text-[7px] text-slate-500 px-5 select-none">
            <span>-36</span>
            <span>-24</span>
            <span>-18</span>
            <span>-12</span>
            <span>-6</span>
            <span>0</span>
            <span className="text-rose-400">+3 dB</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Frequency weighting curve based on active Audio DSP Effect
function getEffectWeights(effect: AudioEffectType): number[] {
  switch (effect) {
    case 'bass_boost':
      // Heavily boost lower bands (sub-bass / kick drum)
      return [1.45, 1.4, 1.35, 1.25, 1.1, 0.95, 0.9, 0.85, 0.8, 0.8, 0.82, 0.85, 0.85, 0.85, 0.85, 0.85];
    case 'spatial_3d':
      // Widen side / high presence and sub-spatial frequency separation
      return [1.1, 1.15, 1.1, 1.05, 1.0, 1.05, 1.15, 1.25, 1.3, 1.28, 1.25, 1.22, 1.2, 1.18, 1.15, 1.1];
    case 'concert_hall':
      // Reverb diffuse dispersion curve across mid-high frequencies
      return [1.0, 1.05, 1.1, 1.15, 1.2, 1.25, 1.28, 1.25, 1.2, 1.18, 1.15, 1.1, 1.05, 1.0, 0.95, 0.9];
    case 'vocal_clarity':
      // Attenuate deep rumble and elevate 1kHz - 4kHz presence
      return [0.65, 0.7, 0.75, 0.85, 1.0, 1.2, 1.38, 1.45, 1.4, 1.32, 1.2, 1.05, 0.95, 0.9, 0.85, 0.8];
    case 'studio':
    default:
      // Neutral reference studio mastering response
      return [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
  }
}

// Visual color themes matching each Audio DSP profile
function getEffectTheme(effect: AudioEffectType) {
  switch (effect) {
    case 'spatial_3d':
      return {
        title: '3D Spatial Surround',
        badge: 'ACTIVE • 3D SPATIAL',
        icon: <Radio className="w-3.5 h-3.5 text-sky-400" />,
        accentText: 'text-sky-400',
        ledColor: '#38bdf8', // Sky blue
        peakColor: '#7dd3fc',
        glowDot: 'bg-sky-400',
      };
    case 'bass_boost':
      return {
        title: 'Bass Punch & Warmth',
        badge: 'ACTIVE • BASS PUNCH',
        icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
        accentText: 'text-amber-400',
        ledColor: '#f59e0b', // Amber/Gold
        peakColor: '#fbbf24',
        glowDot: 'bg-amber-400',
      };
    case 'concert_hall':
      return {
        title: 'Concert Hall Reverb',
        badge: 'ACTIVE • CONCERT',
        icon: <Music className="w-3.5 h-3.5 text-emerald-400" />,
        accentText: 'text-emerald-400',
        ledColor: '#34d399', // Emerald
        peakColor: '#6ee7b7',
        glowDot: 'bg-emerald-400',
      };
    case 'vocal_clarity':
      return {
        title: 'Vocal & Dialogue Clarity',
        badge: 'ACTIVE • VOCAL',
        icon: <Mic className="w-3.5 h-3.5 text-rose-400" />,
        accentText: 'text-rose-400',
        ledColor: '#fb7185', // Coral/Rose
        peakColor: '#fda4af',
        glowDot: 'bg-rose-400',
      };
    case 'studio':
    default:
      return {
        title: 'Studio Spectrum Analyzer',
        badge: 'ACTIVE • STUDIO',
        icon: <Sliders className="w-3.5 h-3.5 text-cyan-400" />,
        accentText: 'text-cyan-400',
        ledColor: '#06b6d4', // Cyan
        peakColor: '#38bdf8',
        glowDot: 'bg-cyan-400',
      };
  }
}
