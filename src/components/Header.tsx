import React from 'react';
import { RefreshCw, Settings, Play, Pause, HelpCircle } from 'lucide-react';
import { PlaybackStatus } from '../types/audio';

interface HeaderProps {
  totalDevices: number;
  selectedCount: number;
  playbackStatus: PlaybackStatus;
  activeStreams: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
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
  onOpenGuide,
  onTogglePlayback,
}) => {
  return (
    <header className="border-b border-studio-800/80 bg-studio-900/85 backdrop-blur-xl px-4 sm:px-6 py-3 sticky top-0 z-40 transition-colors shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="MultiWave"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover ring-1 ring-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
            />
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white font-display">
                MultiWave
              </span>
              <span className="hidden xs:inline-flex text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-bold">
                2.0 Pro
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 font-mono text-xs border-l border-studio-800 pl-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-studio-850/80 border border-studio-800 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${selectedCount > 0 ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>
                Outputs: <strong className="text-white">{selectedCount}</strong>/{totalDevices}
              </span>
            </div>

            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
              playbackStatus === 'playing'
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : playbackStatus === 'paused'
                ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                : 'bg-studio-850/80 border-studio-800 text-slate-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                playbackStatus === 'playing'
                  ? 'bg-emerald-400 animate-ping'
                  : playbackStatus === 'paused'
                  ? 'bg-amber-400'
                  : 'bg-slate-500'
              }`} />
              <span className="capitalize font-semibold text-[11px]">
                {playbackStatus === 'playing' ? `Broadcasting (${activeStreams} active)` : playbackStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile counter indicator */}
          <div className="md:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-studio-850 border border-studio-800 text-xs font-mono text-slate-300">
            <span className="text-cyan-400 font-bold">{selectedCount}</span>/{totalDevices}
          </div>

          {/* Master Play / Pause Button */}
          <button
            onClick={onTogglePlayback}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
              playbackStatus === 'playing'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-studio-950 shadow-[0_0_16px_rgba(16,185,129,0.35)]'
                : playbackStatus === 'paused'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-studio-950 shadow-[0_0_14px_rgba(245,158,11,0.3)]'
                : 'bg-studio-800 hover:bg-studio-750 border border-cyan-500/40 text-cyan-300 hover:text-white'
            }`}
            title={
              playbackStatus === 'playing'
                ? 'Pause Audio Engine'
                : playbackStatus === 'paused'
                ? 'Resume Audio Engine'
                : 'Start Audio Engine'
            }
          >
            {playbackStatus === 'playing' ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Broadcasting</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                <span>{playbackStatus === 'paused' ? 'Resume' : 'Start'}</span>
              </>
            )}
          </button>

          {/* Rescan Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-800 hover:border-studio-700 text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            title="Scan for New Audio Endpoints"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* User Guide Button */}
          <button
            onClick={onOpenGuide}
            className="p-2 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
            title="Interactive First-Time User Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Audio Routing & Virtual Driver Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
