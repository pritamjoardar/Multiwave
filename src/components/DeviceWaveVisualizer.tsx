import React, { useEffect, useState, useRef } from 'react';
import { AudioWaveform, VolumeX } from 'lucide-react';

interface DeviceWaveVisualizerProps {
  isActive: boolean;
  isTesting: boolean;
  isMuted: boolean;
  volume: number;
  inputLevel?: number;
  isSelected?: boolean;
}

const BAR_COUNT = 24;

export const DeviceWaveVisualizer: React.FC<DeviceWaveVisualizerProps> = ({
  isActive,
  isTesting,
  isMuted,
  volume,
  inputLevel = 0,
  isSelected = true,
}) => {
  const [hasAudioSignal, setHasAudioSignal] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEffectivelyActive = isTesting || (isSelected && isActive && !isMuted && volume > 0);

  // Smooth audio detection: instant cutoff when unselected/inactive, with hold timer ONLY during active micro-pauses
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
      // While actively playing, bridge micro-pauses without cancelling timer on every level polling tick
      if (!holdTimerRef.current) {
        holdTimerRef.current = setTimeout(() => {
          setHasAudioSignal(false);
          holdTimerRef.current = null;
        }, 300);
      }
    }
  }, [isEffectivelyActive, isTesting, inputLevel]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, []);

  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(10));

  useEffect(() => {
    if (!isEffectivelyActive || !hasAudioSignal) {
      setBars(Array(BAR_COUNT).fill(10));
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const amplitude = isTesting
        ? 0.85
        : Math.min(1.0, Math.max(0.2, (inputLevel || 0) * 5.5)) * Math.max(0.2, volume);

      setBars((prev) =>
        prev.map((_, i) => {
          const wave1 = Math.sin(now / 150 + i * 0.42) * 36;
          const wave2 = Math.cos(now / 260 + i * 0.28) * 18;
          const jitter = (Math.random() - 0.5) * 12;
          const raw = (wave1 + wave2 + jitter + 45) * amplitude;

          return Math.max(12, Math.min(96, Math.round(raw)));
        })
      );
    }, 60);

    return () => clearInterval(interval);
  }, [isEffectivelyActive, hasAudioSignal, isTesting, volume, inputLevel]);

  const activeVisual = isEffectivelyActive && hasAudioSignal;

  return (
    <div className="px-3 py-2.5 rounded-xl border border-studio-800/80 bg-studio-950/60 transition-colors duration-200">
      {/* Header telemetry row with fixed dimensions so card never flickers or shifts */}
      <div className="flex items-center justify-between mb-2 text-[10px] font-mono select-none">
        <span className="flex items-center gap-1.5 text-slate-400 min-w-0">
          {isMuted && isSelected ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          ) : (
            <AudioWaveform
              className={`w-3.5 h-3.5 shrink-0 ${
                activeVisual ? 'text-cyan-400 animate-pulse' : 'text-slate-500'
              }`}
            />
          )}
          <span className="font-medium text-slate-300 truncate">
            {isTesting ? 'Isolated Test Chime' : 'Output Waveform'}
          </span>
        </span>

        <span
          className={`shrink-0 text-right font-semibold font-mono text-[10px] uppercase tracking-wider w-16 transition-colors duration-150 ${
            isTesting
              ? 'text-cyan-300'
              : activeVisual
              ? 'text-cyan-300'
              : isMuted && isSelected
              ? 'text-rose-400'
              : 'text-slate-500'
          }`}
        >
          {isTesting
            ? 'TEST'
            : activeVisual
            ? 'ACTIVE'
            : isMuted && isSelected
            ? 'MUTED'
            : 'IDLE'}
        </span>
      </div>

      {/* Dynamic Sound Wave Bars */}
      <div className="flex items-end justify-between gap-1 h-7 px-1">
        {bars.map((height, idx) => (
          <div
            key={idx}
            className="flex-1 rounded-full transition-all duration-75"
            style={{
              height: `${activeVisual ? height : 10}%`,
              background: activeVisual
                ? height > 75
                  ? '#00f2fe'
                  : height > 45
                  ? '#06b6d4'
                  : '#10b981'
                : '#334155',
              opacity: activeVisual ? (height > 55 ? 1 : 0.85) : 0.25,
            }}
          />
        ))}
      </div>
    </div>
  );
};
