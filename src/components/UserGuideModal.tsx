import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Radio,
  Volume2,
  SlidersHorizontal,
  Clock,
  Play,
  ShieldCheck,
  Headphones,
  ExternalLink,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleFinish = () => {
    localStorage.setItem('multiwave_has_seen_guide', 'true');
    onClose();
  };

  const steps = [
    {
      badge: 'Step 1 of 5 • Introduction',
      title: 'Welcome to MultiWave',
      icon: Radio,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-950/60 border-cyan-500/30',
      summary: 'Play your PC audio through multiple outputs at the exact same time.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            By default, Windows only sends sound to <strong className="text-white">one device</strong> at a time. If you connect headphones, your speakers go silent.
          </p>
          <div className="p-4 rounded-xl bg-studio-950/80 border border-studio-700/70 space-y-2">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <Headphones className="w-4 h-4 text-cyan-400" />
              What MultiWave Does
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              MultiWave captures your computer&apos;s audio (YouTube, Spotify, games, movies) and broadcasts it in real-time to <strong className="text-white">all your chosen speakers, Bluetooth headsets, and soundbars simultaneously</strong>.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Works with Bluetooth, USB headsets, AUX 3.5mm jacks, and HDMI/DisplayPort.</span>
          </div>
        </div>
      ),
    },
    {
      badge: 'Step 2 of 5 • System Audio Routing',
      title: 'One-Click Audio Bridge Setup',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-950/60 border-emerald-500/30',
      summary: 'Set MultiWave as your default Windows playback device to capture all app sounds.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            To capture audio from all your apps, Windows routes sound into the <strong className="text-white">MultiWave Virtual Speaker</strong> bridge.
          </p>
          <div className="p-4 rounded-xl bg-studio-950/80 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Windows Default Audio Routing
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                ONE-CLICK SETUP
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open Settings (⚙️ in the top navbar) and click <strong className="text-white">&quot;Activate MultiWave Routing&quot;</strong>. Everything you play on your PC will automatically stream through MultiWave!
            </p>
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
              >
                <span>Open Audio Routing in Settings</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">
            You can restore Windows to normal single-speaker audio anytime by clicking <em className="text-slate-300">&quot;Restore Direct Audio&quot;</em> in Settings.
          </p>
        </div>
      ),
    },
    {
      badge: 'Step 3 of 5 • Selecting Outputs',
      title: 'Pick Your Output Devices',
      icon: Volume2,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-950/60 border-cyan-500/30',
      summary: 'Click on any device card in the grid to activate or deactivate it.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            All your connected physical sound devices appear as interactive cards in the <strong className="text-white">Audio Output Devices</strong> grid.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-cyan-400/60 bg-studio-850/80 space-y-1 shadow-[0_0_15px_rgba(0,242,254,0.1)]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Active Device</span>
                <div className="w-4 h-4 rounded-md bg-cyan-400 text-studio-950 flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <p className="text-[11px] text-cyan-300">Cyan border indicates the device is selected for multi-device streaming.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-studio-700/60 bg-studio-950/60 space-y-1 text-slate-400">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Inactive Device</span>
                <div className="w-4 h-4 rounded-md border border-slate-600" />
              </div>
              <p className="text-[11px] text-slate-500">Unselected devices remain silent while others play.</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Just connected a new Bluetooth headset? Click the <strong className="text-slate-200">Rescan (🔄)</strong> button on the navbar to detect it instantly.
          </p>
        </div>
      ),
    },
    {
      badge: 'Step 4 of 5 • Live Playback & Waves',
      title: 'Hit Play & Watch Audio Waves',
      icon: Play,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-950/60 border-teal-500/30',
      summary: 'Start playback from the navbar and watch real-time reactive wave visualizers.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Click the <strong className="text-cyan-400 font-semibold">Play</strong> button in the top navbar. The button will switch to a glowing <strong className="text-white">Pause</strong> button, and the status will display <strong className="text-emerald-400">Playing</strong>.
          </p>
          <div className="p-4 rounded-xl bg-studio-950/80 border border-studio-700/70 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              Live Reactive Wave Visualizer
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Play any music, movie, or game on your PC. Each selected device card features a real-time <strong className="text-white">waveform visualizer</strong> that actively pulses and dances to the live audio signal.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Want to test if a specific speaker works? Click the <strong className="text-slate-200">Test Sound</strong> button on any card to play an isolated musical chime.
          </p>
        </div>
      ),
    },
    {
      badge: 'Step 5 of 5 • Bluetooth Delay Sync',
      title: 'Individual Volume & Bluetooth Sync',
      icon: SlidersHorizontal,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-950/60 border-amber-500/30',
      summary: 'Balance sound levels and eliminate Bluetooth echo with millisecond delay sync.',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              Independent Volume Sliders
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every speaker has its own volume slider (0% to 100%) and mute toggle, so you can easily balance quiet headphones and loud external speakers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Zero Bluetooth Echo (Delay Compensation)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bluetooth audio naturally has a small ~120ms transmission lag compared to wired outputs. To make them match perfectly:
            </p>
            <p className="text-xs text-amber-200 font-medium">
              👉 On your <strong className="text-white">wired / faster speaker</strong>, slide the <strong className="text-white">Sync Offset (ms)</strong> slider to <strong className="text-white">+120 ms to +160 ms</strong>. Both will play in perfect harmony!
            </p>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const IconComponent = current.icon;
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-studio-900 border border-studio-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-800 bg-studio-950/50">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${current.iconBg} ${current.iconColor} shrink-0`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                {current.badge}
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                {current.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-cyan-300 bg-studio-850 px-2.5 py-1 rounded-lg border border-studio-700/60 font-semibold">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-5 gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,242,254,0.6)]'
                    : index < currentStep
                    ? 'bg-cyan-700/60'
                    : 'bg-studio-800'
                }`}
                title={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {current.content}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-studio-800 bg-studio-950/60">
          <div className="text-xs text-slate-400 font-medium">
            {!isLast ? (
              <span>Follow the steps to get started</span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                All steps completed! Click Get Started
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-studio-800 hover:bg-studio-750 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            {!isLast ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-studio-950 text-xs font-semibold transition-all shadow-[0_0_12px_rgba(0,242,254,0.25)] active:scale-95"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-studio-950 text-xs font-bold transition-all shadow-[0_0_18px_rgba(16,185,129,0.35)] active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Get Started</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
