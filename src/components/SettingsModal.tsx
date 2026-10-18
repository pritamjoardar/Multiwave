import React, { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  Palette,
  Cpu,
  Check,
  ShieldCheck,
  Radio,
  ExternalLink,
  Tag,
  Download,
  Heart,
  Info,
  Volume2,
} from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { AppSettings, AudioDevice } from '../types/audio';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  devices: AudioDevice[];
  virtualDevice?: AudioDevice;
  isVirtualDefault: boolean;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  onActivateRouting: () => Promise<boolean | void>;
  onRestoreDirect: (deviceId: string) => Promise<boolean | void>;
  onConfigureName: () => Promise<boolean | void>;
  onOpenSoundSettings: () => Promise<void>;
  onInstallDriver: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  devices,
  virtualDevice,
  isVirtualDefault,
  onClose,
  onSave,
  onActivateRouting,
  onRestoreDirect,
  onConfigureName,
  onOpenSoundSettings,
  onInstallDriver,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isRoutingAction, setIsRoutingAction] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const handleThemeChange = (theme: string) => {
    setLocalSettings({ ...localSettings, theme });
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('multiwave_theme', theme);
  };

  const handleOpenWebsite = async () => {
    try {
      await openUrl('https://www.pritamjoardar.com/');
    } catch {
      window.open('https://www.pritamjoardar.com/', '_blank');
    }
  };

  const handleSave = () => {
    onSave(localSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 500);
  };

  const firstPhysical = devices.find((d) => d.device_type !== 'virtual');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-studio-900 border border-studio-700/80 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-studio-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/40 shadow-[0_0_15px_rgba(0,242,254,0.25)] shrink-0">
              <img
                src="/logo.png"
                alt="MultiWave"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">MultiWave Preferences</h2>
              <p className="text-xs text-slate-400">Themes, Audio Routing & Application Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-studio-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-6 text-xs text-slate-300">
          {/* Theme Palette Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                Application Theme & Style
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Live Preview Active</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Studio Dark */}
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all text-left ${
                  (localSettings.theme || 'dark') === 'dark'
                    ? 'bg-studio-800 border-cyan-500 text-white shadow-[0_0_15px_rgba(0,242,254,0.15)] ring-1 ring-cyan-500/50'
                    : 'bg-studio-950/70 border-studio-800 text-slate-400 hover:border-studio-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0a0d14] border border-[#263450] flex items-center justify-center text-cyan-400 shadow-inner">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Studio Dark</span>
                    <span className="text-[10px] text-slate-400">Obsidian dark studio</span>
                  </div>
                </div>
                {(localSettings.theme || 'dark') === 'dark' && (
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
              </button>

              {/* Studio Light (White Theme) */}
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all text-left ${
                  localSettings.theme === 'light'
                    ? 'bg-studio-800 border-cyan-500 text-white shadow-[0_0_15px_rgba(0,242,254,0.15)] ring-1 ring-cyan-500/50'
                    : 'bg-studio-950/70 border-studio-800 text-slate-400 hover:border-studio-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] flex items-center justify-center text-amber-500 shadow-sm">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Studio Light</span>
                    <span className="text-[10px] text-slate-400">Clean white daylight studio</span>
                  </div>
                </div>
                {localSettings.theme === 'light' && (
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Windows Audio Routing Management */}
          <div className="p-4 rounded-xl bg-studio-950/80 border border-studio-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Windows Default Audio Routing
              </label>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  isVirtualDefault
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-950 text-amber-300 border-amber-500/40'
                }`}
              >
                {isVirtualDefault ? 'ROUTED TO MULTIWAVE' : 'DIRECT HARDWARE OUTPUT'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              When routed to MultiWave, Windows sends all sound from VLC, browsers, Spotify, and games to the MultiWave Virtual Speaker, broadcasting in real-time to your selected output devices simultaneously.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {!virtualDevice ? (
                <button
                  type="button"
                  disabled={isInstalling}
                  onClick={async () => {
                    setIsInstalling(true);
                    await onInstallDriver();
                    setIsInstalling(false);
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{isInstalling ? 'Installing Driver...' : 'Install Virtual Speaker Driver'}</span>
                </button>
              ) : !isVirtualDefault ? (
                <button
                  type="button"
                  disabled={isRoutingAction}
                  onClick={async () => {
                    setIsRoutingAction(true);
                    await onActivateRouting();
                    setIsRoutingAction(false);
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-sm"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isRoutingAction ? 'Routing...' : 'Activate MultiWave Routing'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    if (firstPhysical) {
                      await onRestoreDirect(firstPhysical.id);
                    }
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-studio-800 hover:bg-studio-700 border border-studio-700 text-slate-200 transition-all"
                >
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span>Restore Direct Audio</span>
                </button>
              )}

              <button
                type="button"
                disabled={isRenaming}
                onClick={async () => {
                  setIsRenaming(true);
                  await onConfigureName();
                  setIsRenaming(false);
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-studio-800 hover:bg-studio-700 border border-studio-700 text-slate-200 transition-all"
              >
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isRenaming ? 'Setting Name...' : 'Rename to "MultiWave Speaker"'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenSoundSettings}
                className="col-span-1 sm:col-span-2 flex items-center justify-center gap-2 p-2 rounded-lg bg-studio-850 hover:bg-studio-800 border border-studio-700/60 text-slate-300 hover:text-white transition-all text-[11px]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Windows Sound Control Panel</span>
              </button>
            </div>
          </div>

          {/* Auto Reconnect */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-studio-950/80 border border-studio-800">
            <div>
              <span className="font-semibold text-white block">Auto-Reconnect Streams</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically restore audio playback when Bluetooth or USB devices reconnect
              </p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.auto_reconnect}
              onChange={(e) => setLocalSettings({ ...localSettings, auto_reconnect: e.target.checked })}
              className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* About MultiWave & Author Credit Section */}
          <div className="p-4 rounded-xl bg-studio-950/80 border border-studio-800 space-y-3.5">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-cyan-400/40 shadow-[0_0_15px_rgba(0,242,254,0.25)] shrink-0">
                <img
                  src="/logo.png"
                  alt="MultiWave Logo"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-cyan-400" />
                    About MultiWave
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    v0.1.0 • Desktop Edition
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  MultiWave is a high-performance Windows multi-device audio routing and synchronization engine. It captures system sound from media players, browsers, and desktop apps, broadcasting simultaneously to multiple Bluetooth headphones, USB DACs, and speakers with continuous sub-sample linear interpolation.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-studio-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span>Made with</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                <span>by</span>
                <button
                  type="button"
                  onClick={handleOpenWebsite}
                  className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
                  title="Visit Pritam Joardar's Portfolio"
                >
                  Pritam Joardar
                </button>
              </div>

              <button
                type="button"
                onClick={handleOpenWebsite}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-studio-850 hover:bg-studio-800 border border-studio-700/60 text-[11px] text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
              >
                <span>pritamjoardar.com</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Technical Diagnostics */}
          <div className="p-3.5 rounded-xl bg-studio-950/80 border border-studio-800 space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Audio Host API:
              </span>
              <span className="text-white">Windows WASAPI (Exclusive/Shared)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Internal Sample Format:</span>
              <span className="text-white">IEEE Float 32-bit (Continuous Sub-Sample Interpolation)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Configuration Store:</span>
              <span className="text-cyan-400">%APPDATA%\MultiWave\settings.json</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-studio-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-studio-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-studio-950 font-bold text-xs transition-colors shadow-md"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
