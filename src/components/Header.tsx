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
    <header data-ui="app-header" className="border-b border-studio-800 bg-studio-900 px-4 sm:px-6 py-3 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="MultiWave"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover ring-1 ring-cyan-500/30"
            />
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white font-display">
                MultiWave
              </span>
              <span className="hidden xs:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-md bg-studio-850 text-cyan-300 border border-studio-700">
                Studio Engine
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs border-l border-studio-800 pl-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-studio-850 border border-studio-800 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${selectedCount > 0 ? 'bg-cyan-400' : 'bg-slate-500'}`} />
              <span className="tabular-nums">
                Outputs: <strong className="text-white">{selectedCount}</strong>/{totalDevices}
              </span>
            </div>

            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
              playbackStatus === 'playing'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : playbackStatus === 'paused'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-studio-850 border-studio-800 text-slate-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                playbackStatus === 'playing'
                  ? 'bg-emerald-400'
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
          <div className="md:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-studio-850 border border-studio-800 text-xs text-slate-300 tabular-nums">
            <span className="text-cyan-400 font-bold">{selectedCount}</span>/{totalDevices}
          </div>

          {/* Master Play / Pause Button */}
          <button
            onClick={onTogglePlayback}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-colors duration-150 cursor-pointer ${
              playbackStatus === 'playing'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-studio-950'
                : playbackStatus === 'paused'
                ? 'bg-amber-500 hover:bg-amber-400 text-studio-950'
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
            className="p-2 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-800 hover:border-studio-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            title="Scan for New Audio Endpoints"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* User Guide Button */}
          <button
            onClick={onOpenGuide}
            className="p-2 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Interactive First-Time User Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Audio Routing & Virtual Driver Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
