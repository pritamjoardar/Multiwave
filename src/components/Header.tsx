import React from 'react';
import { RefreshCw, Settings, Play, Pause } from 'lucide-react';
import { PlaybackStatus } from '../types/audio';

interface HeaderProps {
  totalDevices: number;
  selectedCount: number;
  playbackStatus: PlaybackStatus;
  activeStreams: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onTogglePlayback: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalDevices,
  selectedCount,
  playbackStatus,
  activeStreams,
  isRefreshing,
  onRefresh,
  onOpenSettings,
  onTogglePlayback,
}) => {
  return (
    <header className="border-b border-studio-700/60 bg-studio-900/80 backdrop-blur-md px-6 py-3.5 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Global Status Pills */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-studio-850 border border-studio-700/60 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>
              Devices: <strong className="text-white">{selectedCount}</strong> / {totalDevices}
            </span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            playbackStatus === 'playing'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              : playbackStatus === 'paused'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-studio-850 border-studio-700/60 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              playbackStatus === 'playing'
                ? 'bg-emerald-400 animate-ping'
                : playbackStatus === 'paused'
                ? 'bg-amber-400'
                : 'bg-slate-500'
            }`} />
            <span className="capitalize font-semibold">
              {playbackStatus === 'playing' ? `Playing (${activeStreams} active)` : playbackStatus}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {/* Play / Pause Mixer Button */}
          <button
            onClick={onTogglePlayback}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 shadow-sm ${
              playbackStatus === 'playing'
                ? 'bg-cyan-500 hover:bg-cyan-400 text-studio-950 shadow-[0_0_14px_rgba(0,242,254,0.35)]'
                : playbackStatus === 'paused'
                ? 'bg-amber-500 hover:bg-amber-400 text-studio-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-studio-800 hover:bg-studio-700/80 border border-cyan-500/40 text-cyan-300 hover:text-white'
            }`}
            title={
              playbackStatus === 'playing'
                ? 'Pause Audio Mixer'
                : playbackStatus === 'paused'
                ? 'Resume Audio Mixer'
                : 'Play Audio Mixer'
            }
          >
            {playbackStatus === 'playing' ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                <span>{playbackStatus === 'paused' ? 'Resume' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-studio-800 hover:bg-studio-700/80 border border-studio-700/70 text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Scan for Audio Devices"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-studio-800 hover:bg-studio-700/80 border border-studio-700/70 text-slate-300 hover:text-white transition-all"
            title="Application Settings"
          >
            <Settings className="w-4 h-4 text-slate-300 hover:text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};
