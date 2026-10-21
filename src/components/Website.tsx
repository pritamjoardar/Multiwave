import React, { useState, useEffect } from 'react';
import {
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
  Check,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { LiveSimulator } from './LiveSimulator';

interface WebsiteProps {}

const AppleIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={`fill-current ${className}`} viewBox="0 0 170 170">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.85-11.97-14.42-6.19-9.5-10.9-19.9-14.15-31.21-3.25-11.31-4.88-22.13-4.88-32.48 0-14.68 3.8-26.65 11.41-35.91 7.61-9.26 17.06-13.97 28.34-14.15 4.7 0 10.15 1.34 16.36 4.02 6.21 2.68 10.05 4.09 11.52 4.23 1.93-.33 5.95-1.85 12.06-4.56 6.11-2.71 11.33-3.9 15.66-3.57 11.83.65 21.36 4.96 28.58 12.92-10.37 6.32-15.42 15.11-15.16 26.39.26 8.87 3.65 16.31 10.17 22.33 6.52 6.02 14.18 9.53 22.98 10.53-2.17 6.42-4.66 12.63-7.46 18.63zM119.22 31.96c0-6.18 2.21-11.99 6.63-17.43 4.42-5.44 9.93-9.24 16.53-11.41.22 1.41.33 2.72.33 3.91 0 6.08-2.3 11.85-6.9 17.33-4.6 5.48-10.13 9.07-16.59 10.77z" />
  </svg>
);

const WindowsIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={`fill-current ${className}`} viewBox="0 0 24 24">
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.951" />
  </svg>
);

export const Website: React.FC<WebsiteProps> = () => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [galleryTab, setGalleryTab] = useState<'screenshots' | 'routing'>('screenshots');
  const [selectedScreenshot, setSelectedScreenshot] = useState('/images/guide_step1_welcome.png');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [buildPlatform, setBuildPlatform] = useState<'mac' | 'windows'>('mac');

  // Direct package binary download paths
  const windowsInstallerUrl = '/MultiWave_0.1.0_x64-setup.exe';
  const windowsPortableUrl = '/MultiWave.exe';
  const macInstallerUrl = '/MultiWave_0.1.0_macOS.dmg';
  const macZipUrl = '/MultiWave_0.1.0_macOS.zip';
  const githubUrl = 'https://github.com/pritamjoardar/Multiwave';

  // Automatically close mobile menu if viewport resized to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const copyBuildCmd = () => {
    const cmd = buildPlatform === 'mac' ? './build_mac.sh' : '.\\build_exe.ps1 -Installer';
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="min-h-dvh bg-studio-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-studio-950 overflow-x-hidden">
      {/* Navigation Bar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-studio-900/95 px-4 sm:px-6 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 sm:gap-3 group">
            <img
              src="/logo.png"
              alt="MultiWave Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl ring-1 ring-cyan-500/30 object-cover group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white font-display">
                MultiWave
              </span>
              <span className="hidden xs:inline-flex ml-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-studio-850 text-cyan-300 border border-studio-700 whitespace-nowrap">
                Open Source
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#demo" className="hover:text-cyan-400 transition-colors">Walkthrough</a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">How It Works</a>
            <a href="#specs" className="hover:text-cyan-400 transition-colors">Open Source</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-studio-850 hover:bg-studio-800 border border-studio-700 text-slate-200 hover:text-white transition-colors"
              title="View on GitHub"
            >
              <svg className="w-4 h-4 fill-current text-slate-300" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <a
                href={macInstallerUrl}
                download="MultiWave_0.1.0_macOS.dmg"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-studio-800 hover:bg-studio-750 border border-studio-700 text-white hover:text-cyan-300 transition-colors"
                title="Download for macOS (.dmg)"
              >
                <AppleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span>Mac<span className="hidden lg:inline"> (.dmg)</span></span>
              </a>

              <a
                href={windowsInstallerUrl}
                download="MultiWave_0.1.0_x64-setup.exe"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                title="Download for Windows (.exe)"
              >
                <WindowsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Win<span className="hidden lg:inline"> (.exe)</span></span>
              </a>
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-700 text-slate-200 hover:text-white transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 mt-3 flex flex-col gap-2 max-h-[calc(100vh-80px)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-studio-850 transition-colors"
              >
                <span>Features</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-studio-850 transition-colors"
              >
                <span>Walkthrough &amp; Video</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
              <a
                href="#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-studio-850 transition-colors"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
              <a
                href="#specs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-studio-850 transition-colors"
              >
                <span>Open Source &amp; CLI</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
            </nav>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={macInstallerUrl}
                download="MultiWave_0.1.0_macOS.dmg"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs bg-studio-800 hover:bg-studio-750 border border-studio-700 text-white"
              >
                <AppleIcon className="w-4 h-4 text-cyan-400" />
                <span>Download for macOS (.dmg)</span>
              </a>

              <a
                href={windowsInstallerUrl}
                download="MultiWave_0.1.0_x64-setup.exe"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950"
              >
                <WindowsIcon className="w-4 h-4" />
                <span>Download for Windows (.exe)</span>
              </a>

              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-xs bg-studio-850 hover:bg-studio-800 border border-studio-700 text-slate-200 hover:text-white"
              >
                <svg className="w-4 h-4 fill-current text-slate-300" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-studio-900 border border-studio-700 text-cyan-300 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
          <span>MultiWave 2.0 • Free &amp; Open Source</span>
        </div>

        <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12] font-display">
          Play Mac &amp; Windows Audio Across All Your Speakers Simultaneously
        </h1>

        <p className="mt-5 text-sm sm:text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
          An open-source desktop audio engine for individual use. Stream crystal-clear audio to your AirPods, Bluetooth speakers, wired headphones, USB DACs, and HDMI displays at the same time with <strong>zero echo or delay mismatch</strong>.
        </p>

        {/* Primary Dual Platform CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          {/* macOS Download */}
          <a
            href={macInstallerUrl}
            download="MultiWave_0.1.0_macOS.dmg"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl font-bold text-sm sm:text-base bg-studio-800 hover:bg-studio-750 border border-studio-700 hover:border-cyan-500/60 text-white transition-colors text-center"
          >
            <AppleIcon className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] text-cyan-300 font-semibold leading-none">macOS 10.15+ (Apple Silicon &amp; Intel)</span>
              <span className="leading-snug text-white font-bold">Download for macOS (.dmg)</span>
            </div>
          </a>

          {/* Windows Download */}
          <a
            href={windowsInstallerUrl}
            download="MultiWave_0.1.0_x64-setup.exe"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl font-bold text-sm sm:text-base bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors text-center"
          >
            <WindowsIcon className="w-5 h-5 shrink-0" />
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] text-slate-900 font-semibold leading-none">Windows 10 &amp; 11 (64-bit)</span>
              <span className="leading-snug font-bold">Download for Windows (.exe)</span>
            </div>
          </a>
        </div>

        {/* Secondary options & quick links */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs text-slate-400">
          <span>Portable binaries:</span>
          <a
            href={macZipUrl}
            download="MultiWave_0.1.0_macOS.zip"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-500/40 hover:decoration-cyan-300 font-medium transition-colors"
          >
            macOS (.zip)
          </a>
          <span>•</span>
          <a
            href={windowsPortableUrl}
            download="MultiWave.exe"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-500/40 hover:decoration-cyan-300 font-medium transition-colors"
          >
            Windows Standalone (.exe)
          </a>
          <span>•</span>
          <a href="#demo" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Simulator</span>
          </a>
        </div>

        {/* Compatibility facts */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <AppleIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> macOS 10.15+ (Apple Silicon &amp; Intel)
          </span>
          <span className="flex items-center gap-1.5">
            <WindowsIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Windows 10 &amp; 11 (64-bit)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" /> Native CoreAudio &amp; WASAPI
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" /> 100% Offline &amp; Private
          </span>
        </div>

        {/* Architecture Flow Banner */}
        <div id="architecture" className="scroll-mt-24 mt-12 sm:mt-14 w-full max-w-4xl rounded-2xl bg-studio-900 border border-studio-800 p-5 sm:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
            {/* Source */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5 sm:gap-2 min-w-[150px] sm:min-w-[160px]">
              <span className="text-xs text-slate-400 font-semibold">Audio Source</span>
              <div className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-studio-850 border border-studio-700">
                <Music className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <span className="font-bold text-white text-xs sm:text-sm">Spotify / YouTube / Games</span>
              </div>
            </div>

            {/* Bridge */}
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] text-cyan-400 bg-studio-850 px-3 py-1 rounded-full border border-studio-700">
                MultiWave CoreAudio &amp; WASAPI Engine
              </span>
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-6 sm:w-16 h-0.5 bg-cyan-500/50" />
                <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
                <div className="w-6 sm:w-16 h-0.5 bg-cyan-500/50" />
              </div>
            </div>

            {/* Destination Devices */}
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto max-w-sm">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-studio-850 border border-studio-700 text-xs text-slate-200">
                <Headphones className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">Bluetooth</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-studio-850 border border-studio-700 text-xs text-slate-200">
                <Laptop className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">Laptop Speakers</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-studio-850 border border-studio-700 text-xs text-slate-200">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">USB Soundbar</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-studio-850 border border-studio-700 text-xs text-slate-200">
                <Tv className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">HDMI Monitor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Showcase & Video Section */}
      <section id="demo" className="scroll-mt-24 py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            See MultiWave in Action
          </h2>
          <p className="mt-2.5 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Watch the official product introduction, then test live audio routing and acoustic DSP effects in the interactive simulator below.
          </p>
        </div>

        {/* Video Player Container */}
        <div className="rounded-2xl border border-studio-800 bg-studio-900 p-2 sm:p-4">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
            <video
              src="/multiwave.mp4"
              controls
              poster="/images/brag_poster.jpg"
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Live Simulator Component */}
        <div className="mt-8">
          <LiveSimulator />
        </div>

        {/* Interactive Screenshots & Routing Explorer */}
        <div className="mt-16 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 font-display">
                <Monitor className="w-5 h-5 text-cyan-400" />
                App Screenshots &amp; Routing Explorer
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Inspect onboarding walkthroughs, multi-device grid, and kernel audio routing diagrams.
              </p>
            </div>

            <div className="flex p-1 rounded-xl bg-studio-900 border border-studio-700 gap-1 shrink-0">
              <button
                onClick={() => setGalleryTab('screenshots')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  galleryTab === 'screenshots'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Screenshots</span>
              </button>
              <button
                onClick={() => setGalleryTab('routing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  galleryTab === 'routing'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Routing Architecture</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-studio-800 bg-studio-900 p-3 sm:p-5">
            {galleryTab === 'screenshots' ? (
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-studio-950 border border-studio-800">
                  <img
                    src={selectedScreenshot}
                    alt="MultiWave App Screen"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Thumbnail Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1 sm:pt-2">
                  {[
                    { title: 'Interactive Guide', src: '/images/guide_step1_welcome.png' },
                    { title: 'Live Spectrum Analyzer', src: '/images/device_cards_live_wave.png' },
                    { title: 'Multi-Device Grid', src: '/images/multi_device_grid.png' },
                    { title: 'Bluetooth Sync', src: '/images/guide_step5_bluetooth_sync.png' },
                  ].map((thumb) => (
                    <button
                      key={thumb.src}
                      onClick={() => setSelectedScreenshot(thumb.src)}
                      className={`relative rounded-xl overflow-hidden border p-1 text-left transition-colors ${
                        selectedScreenshot === thumb.src
                          ? 'border-cyan-400 bg-studio-850'
                          : 'border-studio-700 hover:border-studio-600 bg-studio-900'
                      }`}
                    >
                      <img src={thumb.src} alt={thumb.title} className="rounded-lg w-full h-14 sm:h-16 object-cover" />
                      <span className="block text-[11px] font-semibold text-slate-300 mt-1 truncate">
                        {thumb.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-studio-950 border border-studio-800 p-2 sm:p-4 flex items-center justify-center">
                <img
                  src="/images/windows_audio_routing.png"
                  alt="MultiWave Audio Routing Architecture"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="scroll-mt-24 py-14 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-cyan-400 text-xs font-semibold tracking-wide">
            Built For macOS &amp; Windows 10/11
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-2 font-display">
            Engineered For Pure Audio Precision
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Traditional audio splitters suffer from delay drift, stuttering resamplers, and painful configuration. MultiWave was purpose-built to eliminate every single one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Feature 1 */}
          <div className="rounded-2xl border border-studio-800 bg-studio-900 p-5 sm:p-7 hover:border-studio-700 transition-colors">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-studio-850 border border-studio-700 flex items-center justify-center text-cyan-400 mb-4 sm:mb-5">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Simultaneous Multi-Streaming</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Opens dedicated CoreAudio &amp; WASAPI shared-mode streams for all selected devices concurrently, broadcasting high-fidelity PCM audio without dropouts. 1-click card selection instantly routes or disconnects audio outputs.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl border border-studio-800 bg-studio-900 p-5 sm:p-7 hover:border-studio-700 transition-colors">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-studio-850 border border-studio-700 flex items-center justify-center text-sky-400 mb-4 sm:mb-5">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Bluetooth Delay Sync (0-500ms)</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Wireless Bluetooth speakers naturally lag by 120–180ms. MultiWave lets you delay wired speakers so sound hits your ears with zero echo.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl border border-studio-800 bg-studio-900 p-5 sm:p-7 hover:border-studio-700 transition-colors">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-studio-850 border border-studio-700 flex items-center justify-center text-sky-400 mb-4 sm:mb-5">
              <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Per-Device Software Gain</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Independent volume sliders mapped to perceptual cubic curves with built-in soft-limiters to prevent digital clipping.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-2xl border border-studio-800 bg-studio-900 p-5 sm:p-7 hover:border-studio-700 transition-colors">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-studio-850 border border-studio-700 flex items-center justify-center text-emerald-400 mb-4 sm:mb-5">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Studio Spectrum &amp; 5 DSP Effects</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              16-Band high-resolution LED spectrum meters with floating peak-hold bars and Dual Stereo VU meters. Real-time acoustic profiles: 3D Spatial Surround soundstage widening, Studio Mastering, Bass Boost, Concert Hall convolution diffusion, and Vocal Dialogue clarity.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-2xl border border-studio-800 bg-studio-900 p-5 sm:p-7 hover:border-studio-700 transition-colors">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-studio-850 border border-studio-700 flex items-center justify-center text-amber-400 mb-4 sm:mb-5">
              <Music className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Built-in Multi-Tone Chimes</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Built-in harmonic C-Major chords, melodic arpeggios, and pink noise generators let you verify any speaker with a single click.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-2xl border border-studio-800 bg-studio-900 p-5 sm:p-7 hover:border-studio-700 transition-colors">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-studio-850 border border-studio-700 flex items-center justify-center text-teal-400 mb-4 sm:mb-5">
              <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Automated Driver Bundling</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ships natively with virtual audio loopback drivers (BlackHole for macOS &amp; VB-Audio for Windows) and 1-click automated setup. No manual driver hunting needed.
            </p>
          </div>
        </div>
      </section>

      {/* Developer Build / CLI Section */}
      <section id="specs" className="scroll-mt-24 py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl border border-studio-800 bg-studio-900 p-5 sm:p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="w-full md:w-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-studio-850 border border-studio-700 text-cyan-300 text-xs font-semibold mb-2">
                <span>OPEN SOURCE FOR INDIVIDUAL USE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 font-display">Want to inspect the code or compile yourself?</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg leading-relaxed">
                MultiWave is a 100% open-source project for individual use. Check out the source code, contribute, report issues, or build the Rust &amp; React application locally.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-studio-850 hover:bg-studio-800 border border-studio-700 text-cyan-300 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span className="truncate">github.com/pritamjoardar/Multiwave</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70 shrink-0" />
                </a>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="flex items-center gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => setBuildPlatform('mac')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    buildPlatform === 'mac'
                      ? 'bg-studio-800 text-cyan-300 border border-studio-700'
                      : 'bg-studio-850 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <AppleIcon className="w-3.5 h-3.5" />
                  <span>macOS Shell</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBuildPlatform('windows')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    buildPlatform === 'windows'
                      ? 'bg-studio-800 text-blue-300 border border-studio-700'
                      : 'bg-studio-850 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <WindowsIcon className="w-3.5 h-3.5" />
                  <span>PowerShell</span>
                </button>
              </div>

              <div data-ui="terminal" className="flex items-center justify-between bg-studio-950 border border-studio-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs text-cyan-300 gap-2 sm:gap-4 overflow-hidden">
                <code className="truncate">{buildPlatform === 'mac' ? './build_mac.sh' : '.\\build_exe.ps1 -Installer'}</code>
                <button
                  type="button"
                  onClick={copyBuildCmd}
                  className="shrink-0 px-2.5 py-1 rounded-md bg-studio-800 hover:bg-studio-700 text-slate-300 hover:text-white transition-colors text-[11px] font-semibold"
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

      {/* Download Action Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="rounded-2xl bg-studio-900 border border-studio-800 p-8 sm:p-12">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display">
            Ready to Sync Your Audio?
          </h2>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-300 max-w-xl mx-auto">
            Download MultiWave for macOS &amp; Windows today. Free and open-source project for individual use with Desktop shortcuts, CoreAudio loopback, and virtual audio driver included.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
            {/* macOS (.dmg) */}
            <a
              href={macInstallerUrl}
              download="MultiWave_0.1.0_macOS.dmg"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm sm:text-base bg-studio-800 hover:bg-studio-750 border border-studio-700 text-white transition-colors text-center"
            >
              <AppleIcon className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>Download for macOS (.dmg)</span>
            </a>

            {/* Windows (.exe) */}
            <a
              href={windowsInstallerUrl}
              download="MultiWave_0.1.0_x64-setup.exe"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm sm:text-base bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors text-center"
            >
              <WindowsIcon className="w-5 h-5 shrink-0" />
              <span>Download for Windows (.exe)</span>
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs text-slate-400">
            <span>Also available as portable:</span>
            <a
              href={macZipUrl}
              download="MultiWave_0.1.0_macOS.zip"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-500/40"
            >
              macOS (.zip)
            </a>
            <span>•</span>
            <a
              href={windowsPortableUrl}
              download="MultiWave.exe"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-500/40"
            >
              Windows Standalone (.exe)
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer data-ui="footer" className="bg-studio-950 px-4 sm:px-6 py-8 sm:py-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="MultiWave" className="w-7 h-7 rounded-lg object-cover" />
              <span className="font-bold text-white text-sm font-display">MultiWave</span>
            </div>
            <span className="text-xs text-slate-400 sm:pl-3">
              Open-source project for individual use • macOS &amp; Windows Audio Output Router
            </span>
          </div>

          <div className="text-xs text-slate-400 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span>Crafted by <strong className="text-slate-200">Pritam Joardar</strong></span>
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
