import React, { useState } from 'react';
import {
  Download,
  Play,
  Volume2,
  Clock,
  Radio,
  Sliders,
  CheckCircle,
  Headphones,
  Laptop,
  Tv,
  ExternalLink,
  BookOpen,
  Monitor,
  Activity,
  Music,
  Check
} from 'lucide-react';

interface WebsiteProps {}

export const Website: React.FC<WebsiteProps> = () => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'screenshots' | 'routing'>('video');
  const [selectedScreenshot, setSelectedScreenshot] = useState('/images/guide_step1_welcome.png');

  const installerUrl = '/MultiWave_0.1.0_x64-setup.exe';
  const githubUrl = 'https://github.com/pritamjoardar/Multiwave';

  const copyPowerShellCmd = () => {
    navigator.clipboard.writeText('.\\build_exe.ps1 -Installer');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Glow Effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-gradient-to-t from-purple-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-studio-700/50 bg-[#090d18]/85 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="MultiWave Logo"
              className="w-9 h-9 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.35)] ring-1 ring-cyan-500/30 object-cover"
            />
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                MultiWave
              </span>
              <span className="ml-2 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 font-semibold">
                Open Source
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#demo" className="hover:text-cyan-400 transition-colors">Walkthrough</a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">How It Works</a>
            <a href="#specs" className="hover:text-cyan-400 transition-colors">Open Source</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-studio-850 hover:bg-studio-800 border border-studio-600/70 text-slate-200 hover:text-white transition-all shadow-sm active:scale-95"
              title="View on GitHub"
            >
              <svg className="w-4 h-4 fill-current text-slate-300" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>

            <a
              href={installerUrl}
              download="MultiWave_0.1.0_x64-setup.exe"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all active:scale-95"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Download .exe
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-medium mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>MultiWave 2.0 • 100% Free &amp; Open Source for Individual Use</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12]">
          Play Windows Audio Across{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
            All Your Speakers
          </span>{' '}
          Simultaneously
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300/90 max-w-2xl leading-relaxed">
          An open-source desktop audio engine for individual use. Stream crystal-clear audio to your Bluetooth speaker, wired headphones, USB DAC, and HDMI display at the same time with <strong>zero echo or delay mismatch</strong>.
        </p>

        {/* Primary CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a
            href={installerUrl}
            download="MultiWave_0.1.0_x64-setup.exe"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.45)] hover:shadow-[0_0_45px_rgba(6,182,212,0.7)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="w-5 h-5 stroke-[2.5]" />
            <span>Download for Windows (.exe)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-950/20 text-slate-900 font-mono">
              7.7 MB
            </span>
          </a>

          <a
            href="#demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm text-slate-300 hover:text-white bg-studio-850 hover:bg-studio-800 border border-studio-700/80 hover:border-cyan-500/40 transition-all shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Watch Demo &amp; Guide</span>
          </a>
        </div>

        {/* Compatibility badge */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Windows 10 &amp; 11 (64-bit)
          </span>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Open Source for Individual Use
          </a>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Native WASAPI Low-Latency Engine
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> 100% Offline &amp; Private
          </span>
        </div>

        {/* Live Device Flow Visualizer Banner */}
        <div className="mt-14 w-full max-w-4xl p-1 rounded-3xl bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
          <div className="bg-[#0b101d] rounded-[22px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-studio-700/60">
            {/* Source */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 min-w-[160px]">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono font-semibold">1. Audio Source</span>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-studio-850 border border-studio-700">
                <Music className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-white text-sm">Spotify / YouTube</span>
              </div>
            </div>

            {/* Bridge */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/30">
                MultiWave WASAPI Bridge
              </span>
              <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                <div className="w-8 sm:w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent" />
                <Radio className="w-5 h-5" />
                <div className="w-8 sm:w-16 h-0.5 bg-gradient-to-l from-cyan-500 to-transparent" />
              </div>
            </div>

            {/* Destination Devices */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-studio-850 border border-studio-700 text-xs text-slate-200">
                <Headphones className="w-3.5 h-3.5 text-blue-400" /> Bluetooth Headphones
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-studio-850 border border-studio-700 text-xs text-slate-200">
                <Laptop className="w-3.5 h-3.5 text-purple-400" /> Laptop Speakers
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-studio-850 border border-studio-700 text-xs text-slate-200">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> USB Soundbar
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-studio-850 border border-studio-700 text-xs text-slate-200">
                <Tv className="w-3.5 h-3.5 text-amber-400" /> HDMI Monitor
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Showcase & Video Section */}
      <section id="demo" className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            See MultiWave in Action
          </h2>
          <p className="mt-3 text-slate-400 text-base max-w-xl mx-auto">
            Watch the official 22-second product introduction or browse live screenshots of the user interface.
          </p>

          {/* Tab Switcher */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-studio-900 border border-studio-700/70">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'video'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              Product Video (Narration)
            </button>
            <button
              onClick={() => setActiveTab('screenshots')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'screenshots'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              App Interface
            </button>
            <button
              onClick={() => setActiveTab('routing')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'routing'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              Routing Diagram
            </button>
          </div>
        </div>

        {/* Media Container */}
        <div className="rounded-3xl border border-studio-700/80 bg-studio-900/90 shadow-2xl overflow-hidden p-2 sm:p-4 backdrop-blur-xl">
          {activeTab === 'video' && (
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <video
                src="/brag.mp4"
                controls
                poster="/images/brag_poster.jpg"
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {activeTab === 'screenshots' && (
            <div className="flex flex-col gap-4">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-studio-950 border border-studio-700/60">
                <img
                  src={selectedScreenshot}
                  alt="MultiWave App Screen"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Thumbnail Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { title: 'Interactive Guide', src: '/images/guide_step1_welcome.png' },
                  { title: 'Live Reactive Waves', src: '/images/device_cards_live_wave.png' },
                  { title: 'Multi-Device Grid', src: '/images/multi_device_grid.png' },
                  { title: 'Bluetooth Sync', src: '/images/guide_step5_bluetooth_sync.png' },
                ].map((thumb) => (
                  <button
                    key={thumb.src}
                    onClick={() => setSelectedScreenshot(thumb.src)}
                    className={`relative rounded-xl overflow-hidden border p-1 text-left transition-all ${
                      selectedScreenshot === thumb.src
                        ? 'border-cyan-400 ring-2 ring-cyan-500/30 bg-cyan-950/20'
                        : 'border-studio-700 hover:border-studio-600 bg-studio-850'
                    }`}
                  >
                    <img src={thumb.src} alt={thumb.title} className="rounded-lg w-full h-16 object-cover" />
                    <span className="block text-[11px] font-semibold text-slate-300 mt-1 truncate">
                      {thumb.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'routing' && (
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-studio-950 border border-studio-700/60 p-4 flex items-center justify-center">
              <img
                src="/images/windows_audio_routing.png"
                alt="Windows Audio Routing Diagram"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">
            Built For Windows 10 &amp; 11
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Engineered For Pure Audio Perfection
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Traditional audio splitters suffer from delay drift, stuttering resamplers, and painful configuration. MultiWave was purpose-built to eliminate every single one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="rounded-3xl border border-studio-700/70 bg-studio-900/60 p-7 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Simultaneous Multi-Streaming</h3>
            <p className="mt-2 text-sm text-slate-300/80 leading-relaxed">
              Opens dedicated WASAPI shared-mode streams for all selected devices concurrently, broadcasting high-fidelity PCM audio without dropouts.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-3xl border border-studio-700/70 bg-studio-900/60 p-7 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Bluetooth Delay Sync (0-500ms)</h3>
            <p className="mt-2 text-sm text-slate-300/80 leading-relaxed">
              Wireless Bluetooth speakers naturally lag by 120–180ms. MultiWave lets you delay wired speakers so sound hits your ears with zero echo.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-3xl border border-studio-700/70 bg-studio-900/60 p-7 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Per-Device Software Gain</h3>
            <p className="mt-2 text-sm text-slate-300/80 leading-relaxed">
              Independent volume sliders mapped to perceptual cubic curves ($v^{'{'}2.5{'}'}$) with built-in soft-limiters to prevent digital clipping.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-3xl border border-studio-700/70 bg-studio-900/60 p-7 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Real-Time Reactive Waveforms</h3>
            <p className="mt-2 text-sm text-slate-300/80 leading-relaxed">
              60 FPS audio visualizers react to actual volume and frequencies for every output device, verifying audio transmission at a glance.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-3xl border border-studio-700/70 bg-studio-900/60 p-7 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Built-in Multi-Tone Chimes</h3>
            <p className="mt-2 text-sm text-slate-300/80 leading-relaxed">
              Built-in harmonic C-Major chords, melodic arpeggios, and pink noise generators let you verify any speaker with a single click.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-3xl border border-studio-700/70 bg-studio-900/60 p-7 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5">
              <Monitor className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Automatic Driver Bundling</h3>
            <p className="mt-2 text-sm text-slate-300/80 leading-relaxed">
              Ships natively with virtual audio loopback drivers and 1-click PowerShell automation. No manual driver hunting or rebooting needed.
            </p>
          </div>
        </div>
      </section>

      {/* Rebuild / CLI Option for Developers */}
      <section id="specs" className="py-16 px-6 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl border border-studio-700/80 bg-studio-900/70 p-8 sm:p-10 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold mb-2">
                <span>OPEN SOURCE FOR INDIVIDUAL USE</span>
              </div>
              <h3 className="text-2xl font-bold text-white mt-1">Want to inspect the code or compile yourself?</h3>
              <p className="text-sm text-slate-300 mt-2 max-w-lg leading-relaxed">
                MultiWave is a 100% open-source project for individual use. Check out the source code, contribute, report issues, or build the Rust &amp; React application locally.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-studio-800 hover:bg-studio-750 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all shadow-sm hover:scale-[1.02] active:scale-100"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>github.com/pritamjoardar/Multiwave</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <span className="text-[11px] font-mono text-slate-400 block mb-1.5">Automated PowerShell Pipeline</span>
              <div className="flex items-center justify-between bg-studio-950 border border-studio-700 rounded-xl px-4 py-3 font-mono text-xs text-cyan-300 gap-4">
                <span>.\build_exe.ps1 -Installer</span>
                <button
                  onClick={copyPowerShellCmd}
                  className="px-2.5 py-1 rounded-md bg-studio-800 hover:bg-studio-700 text-slate-300 hover:text-white transition-all text-[11px] font-sans font-semibold"
                >
                  {copiedCmd ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </span>
                  ) : (
                    'Copy'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Banner Callout */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <div className="rounded-3xl bg-gradient-to-b from-studio-900 via-studio-850 to-studio-900 border border-cyan-500/40 p-10 sm:p-14 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Sync Your Audio?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
            Download MultiWave for Windows 10 &amp; 11 today. Free and open-source project for individual use with Desktop shortcuts and virtual audio driver included.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={installerUrl}
              download="MultiWave_0.1.0_x64-setup.exe"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all hover:scale-105 active:scale-100"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Download MultiWave_0.1.0_x64-setup.exe</span>
            </a>

            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm text-slate-300 hover:text-white bg-studio-850 hover:bg-studio-800 border border-studio-700/80 hover:border-cyan-500/40 transition-all shadow-sm"
            >
              <svg className="w-4 h-4 fill-current text-slate-300" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-studio-800 bg-[#060911] px-6 py-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="MultiWave" className="w-7 h-7 rounded-lg object-cover" />
              <span className="font-bold text-white text-sm">MultiWave</span>
            </div>
            <span className="text-xs text-slate-400 sm:border-l sm:border-studio-800 sm:pl-3">
              Open-source project for individual use • Windows Audio Output Router
            </span>
          </div>

          <div className="text-xs text-slate-400 flex flex-wrap items-center justify-center gap-5 sm:gap-6">
            <span>Crafted with ❤️ by <strong className="text-slate-200">Pritam Joardar</strong></span>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 flex items-center gap-1.5 transition-colors font-medium text-slate-300"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
            <a
              href="https://www.pritamjoardar.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              Portfolio <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
