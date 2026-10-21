import React, { useEffect, useState } from 'react';
import { PlaybackStatus } from '../types/audio';

interface AudioVisualizerProps {
  status: PlaybackStatus;
  activeCount: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ status, activeCount }) => {
  const isPlaying = status === 'playing';
  const barCount = 28;
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(10));

  useEffect(() => {
    if (!isPlaying) {
      setBars(Array(barCount).fill(8));
      return;
    }

    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map((_, i) => {
          // Generate a smooth oscillating curve with some pseudo-random peaks
          const wave = Math.sin(Date.now() / 250 + i * 0.35) * 35 + 45;
          const noise = (Math.random() - 0.5) * 20;
          return Math.max(12, Math.min(95, wave + noise));
        })
      );
    }, 60);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div data-ui="visualizer" className="flex items-center justify-center gap-1 h-9 px-4 rounded-xl bg-studio-950/60 border border-studio-800">
      {bars.map((height, idx) => (
        <div
          key={idx}
          className="w-1 rounded-full transition-[height,background-color] duration-75"
          style={{
            height: `${isPlaying ? height : 15}%`,
            background: isPlaying
              ? height > 75
                ? '#f43f5e'
                : height > 50
                ? '#00f2fe'
                : '#10b981'
              : '#394d75',
            opacity: isPlaying ? 0.9 : 0.3,
          }}
        />
      ))}
      <span className="ml-3 text-[11px] font-semibold tabular-nums text-slate-400">
        {isPlaying ? `WASAPI MIX (${activeCount})` : 'IDLE'}
      </span>
    </div>
  );
};
