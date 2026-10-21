import React from 'react';
import { X, Layers, Cpu, ShieldCheck, ArrowRight, Info } from 'lucide-react';

interface PerAppRoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerAppRoutingModal: React.FC<PerAppRoutingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div data-ui="modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-studio-900 border border-studio-700 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-studio-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Per-Application Audio Routing Architecture
              </h2>
              <p className="text-xs text-slate-400">
                Advanced Architectural Design & Windows Core Audio Integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-studio-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">How Windows Handles Application Audio</h3>
              <p className="text-slate-400">
                Windows Core Audio routes application audio streams directly to the chosen default endpoint.
                Routing arbitrary third-party application audio (e.g. Chrome → Bluetooth, Spotify → Headphones)
                requires specialized Windows capture mechanisms rather than mere output duplication.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Supported Windows Mechanism: Process Loopback Capture
            </h4>
            <p>
              Starting in Windows 10 (Build 20348+) and Windows 11, Microsoft introduced official support for capturing individual process audio streams using:
            </p>

            <pre className="p-3 rounded-lg bg-studio-950 text-[11px] text-cyan-300 border border-studio-800 overflow-x-auto">
              <code>
                AUDIOCLIENT_ACTIVATION_PARAMS params = &#123;<br />
                &nbsp;&nbsp;.ActivationType = AUDIOCLIENT_ACTIVATION_TYPE_PROCESS_LOOPBACK,<br />
                &nbsp;&nbsp;.ProcessLoopbackParams.TargetProcessId = target_pid,<br />
                &nbsp;&nbsp;.ProcessLoopbackParams.ProcessLoopbackMode = PROCESS_LOOPBACK_MODE_INCLUDE_TARGET_PROCESS_TREE<br />
                &#125;;<br />
                ActivateAudioInterfaceAsync(VIRTUAL_AUDIO_DEVICE_PROCESS_LOOPBACK, ...);
              </code>
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-cyan-400" />
              MultiWave Pipeline Integration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-studio-850 border border-studio-800">
                <span className="font-bold text-white block mb-1">1. Capture Source</span>
                <p className="text-[11px] text-slate-400">
                  Captures PCM frames directly from the targeted process ID via WASAPI loopback without kernel drivers.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-studio-850 border border-studio-800">
                <span className="font-bold text-white block mb-1">2. Resampling & Mixer</span>
                <p className="text-[11px] text-slate-400">
                  Feeds the captured audio into MultiWave's real-time <code className="text-cyan-400">Resampler</code> and channel upmixer.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-studio-850 border border-studio-800">
                <span className="font-bold text-white block mb-1">3. Multi-Device Output</span>
                <p className="text-[11px] text-slate-400">
                  Plays to selected endpoints with independent volume gain and Bluetooth sync delay.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-studio-950/80 border border-studio-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Design Integrity Note
            </div>
            <p>
              MultiWave's architecture implements clean extension points for <code className="text-white">AudioSource</code>.
              The current version prioritizes rock-solid simultaneous multi-device playback, format conversion, and independent software volume control.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-studio-950 font-semibold text-xs transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
