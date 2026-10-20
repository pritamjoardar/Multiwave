import React, { useState, useEffect } from 'react';
import {
  Play,
  Volume2,
  VolumeX,
  Clock,
  Radio,
  Sliders,
  CheckCircle,
  Headphones,
  Laptop,
  Tv,
  Bluetooth,
  Speaker,
  Sparkles,
  ExternalLink,
  BookOpen,
  Monitor,
  Activity,
  Music,
  Check,
  Menu,
  X,
  ChevronRight,
  Zap,
  Mic
} from 'lucide-react';
import { DeviceWaveVisualizer } from './DeviceWaveVisualizer';
import { AudioEffectType } from '../types/audio';

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
  const [activeTab, setActiveTab] = useState<'video' | 'simulator' | 'screenshots' | 'routing'>('video');
  const [selectedScreenshot, setSelectedScreenshot] = useState('/images/guide_step1_welcome.png');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [buildPlatform, setBuildPlatform] = useState<'mac' | 'windows'>('mac');

  // Interactive Live Device Cards Simulator state
  const [simDevices, setSimDevices] = useState<{
    id: string;
    name: string;
    type: 'bluetooth' | 'auxline' | 'hdmidisplayport';
    format: string;
    isSelected: boolean;
    volume: number;
    isMuted: boolean;
    isTesting: boolean;
    audioEffect: AudioEffectType;
  }[]>([
    {
      id: 'headphones',
      name: 'Headphones (realme Buds Wireless 3)',
      type: 'bluetooth',
      format: '48.0 kHz • Stereo',
      isSelected: true,
      volume: 1.0,
      isMuted: false,
      isTesting: false,
      audioEffect: 'spatial_3d',
    },
    {
      id: 'speaker',
      name: 'Speaker (Realtek(R) Audio)',
      type: 'auxline',
      format: '48.0 kHz • Stereo',
      isSelected: false,
      volume: 1.0,
      isMuted: false,
      isTesting: false,
      audioEffect: 'bass_boost',
    },
    {
      id: 'monitor',
      name: 'GS27QC (NVIDIA High Definition Audio)',
      type: 'hdmidisplayport',
      format: '48.0 kHz • Stereo',
      isSelected: false,
      volume: 1.0,
      isMuted: false,
      isTesting: false,
      audioEffect: 'studio',
    },
  ]);
  const [simInputLevel, setSimInputLevel] = useState(0.24);

  // Subtle real-time audio signal pulse for the interactive web simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setSimInputLevel(0.18 + Math.sin(Date.now() / 320) * 0.08 + (Math.random() - 0.5) * 0.03);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const toggleSimDevice = (id: string) => {
    setSimDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isSelected: !d.isSelected } : d))
    );
  };

  const toggleSimMute = (id: string) => {
    setSimDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isMuted: !d.isMuted } : d))
    );
  };

  const setSimVolume = (id: string, vol: number) => {
    setSimDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, volume: vol } : d))
    );
  };

  const setSimEffect = (id: string, effect: AudioEffectType) => {
    setSimDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, audioEffect: effect } : d))
    );
  };

  const testSimDevice = (id: string) => {
    setSimDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isTesting: true } : d))
    );
    setTimeout(() => {
      setSimDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isTesting: false } : d))
      );
    }, 2500);
  };

  const windowsInstallerUrl = '/MultiWave_0.1.0_x64-setup.exe';
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Ambient Glow Effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] sm:h-[400px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-[90px] sm:blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[400px] bg-gradient-to-t from-purple-600/10 to-transparent blur-[100px] sm:blur-[140px] pointer-events-none -z-10" />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-studio-700/50 bg-[#090d18]/90 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 sm:gap-3 group">
            <img
              src="/logo.png"
              alt="MultiWave Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.35)] ring-1 ring-cyan-500/30 object-cover group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center">
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                MultiWave
              </span>
              <span className="hidden xs:inline-flex ml-2 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 font-semibold whitespace-nowrap">
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
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-studio-850 hover:bg-studio-800 border border-studio-600/70 text-slate-200 hover:text-white transition-all shadow-sm active:scale-95"
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-studio-800 hover:bg-studio-750 border border-studio-600/80 text-white hover:text-cyan-300 transition-all shadow-sm active:scale-95"
                title="Download for macOS (.dmg)"
              >
                <AppleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span>Mac<span className="hidden lg:inline"> (.dmg)</span></span>
              </a>

              <a
                href={windowsInstallerUrl}
                download="MultiWave_0.1.0_x64-setup.exe"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all active:scale-95"
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
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-700/80 text-slate-200 hover:text-white transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-studio-700/60 mt-3 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-studio-850/80 transition-colors"
              >
                <span>Features</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-studio-850/80 transition-colors"
              >
                <span>Walkthrough &amp; Video</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
              <a
                href="#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-studio-850/80 transition-colors"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
              <a
                href="#specs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-studio-850/80 transition-colors"
              >
                <span>Open Source &amp; CLI</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
            </nav>

            <div className="pt-2 border-t border-studio-800 flex flex-col gap-2">
              <a
                href={macInstallerUrl}
                download="MultiWave_0.1.0_macOS.dmg"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs bg-studio-800 hover:bg-studio-750 border border-cyan-500/50 text-white shadow-md"
              >
                <AppleIcon className="w-4 h-4 text-cyan-400" />
                <span>Download for macOS (.dmg)</span>
              </a>

              <a
                href={windowsInstallerUrl}
                download="MultiWave_0.1.0_x64-setup.exe"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md"
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
                <span>GitHub Repository (Star &amp; Fork)</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[11px] sm:text-xs font-medium mb-5 sm:mb-6 backdrop-blur-md max-w-full text-center">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <span className="truncate">MultiWave 2.0.1 • 100% Free &amp; Open Source</span>
        </div>

        <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12]">
          Play Mac &amp; Windows Audio Across{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
            All Your Speakers
          </span>{' '}
          Simultaneously
        </h1>

        <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-slate-300/90 max-w-2xl leading-relaxed">
          An open-source desktop audio engine for individual use. Stream crystal-clear audio to your AirPods, Bluetooth speakers, wired headphones, USB DACs, and HDMI displays at the same time with <strong>zero echo or delay mismatch</strong>.
        </p>

        {/* Primary Dual Platform CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          {/* macOS Download */}
          <a
            href={macInstallerUrl}
            download="MultiWave_0.1.0_macOS.dmg"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-studio-800 hover:bg-studio-750 border border-cyan-500/60 hover:border-cyan-400 text-white shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
          >
            <AppleIcon className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider leading-none">Apple Silicon &amp; Intel</span>
              <span className="leading-snug">Download for macOS (.dmg)</span>
            </div>
          </a>

          {/* Windows Download */}
          <a
            href={windowsInstallerUrl}
            download="MultiWave_0.1.0_x64-setup.exe"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.45)] hover:shadow-[0_0_40px_rgba(6,182,212,0.65)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
          >
            <WindowsIcon className="w-5 h-5 shrink-0" />
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] font-mono text-slate-900/80 uppercase tracking-wider leading-none">Windows 10 &amp; 11</span>
              <span className="leading-snug">Download for Windows (.exe)</span>
            </div>
          </a>
        </div>

        {/* Secondary options & quick links */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span>Need portable format?</span>
          <a
            href={macZipUrl}
            download="MultiWave_0.1.0_macOS.zip"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-500/40 hover:decoration-cyan-300 font-medium transition-colors"
          >
            Download macOS (.zip)
          </a>
          <span>•</span>
          <a href="#demo" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Watch Demo &amp; Guide</span>
          </a>
        </div>


        {/* Compatibility badge */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-slate-400 font-medium">
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


        {/* Live Device Flow Visualizer Banner (Architecture) */}
        <div id="architecture" className="scroll-mt-24 mt-12 sm:mt-14 w-full max-w-4xl p-1 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
          <div className="bg-[#0b101d] rounded-[18px] sm:rounded-[22px] p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 border border-studio-700/60">
            {/* Source */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5 sm:gap-2 min-w-[150px] sm:min-w-[160px]">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-mono font-semibold">1. Audio Source</span>
              <div className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-studio-850 border border-studio-700">
                <Music className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <span className="font-bold text-white text-xs sm:text-sm">Spotify / YouTube</span>
              </div>
            </div>

            {/* Bridge */}
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/30">
                MultiWave CoreAudio &amp; WASAPI Bridge
              </span>
              <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                <div className="w-6 sm:w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent" />
                <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
                <div className="w-6 sm:w-16 h-0.5 bg-gradient-to-l from-cyan-500 to-transparent" />
              </div>
            </div>

            {/* Destination Devices */}
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto max-w-sm">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-studio-850 border border-studio-700 text-[11px] sm:text-xs text-slate-200">
                <Headphones className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Bluetooth</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-studio-850 border border-studio-700 text-[11px] sm:text-xs text-slate-200">
                <Laptop className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">Laptop Speakers</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-studio-850 border border-studio-700 text-[11px] sm:text-xs text-slate-200">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">USB Soundbar</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-studio-850 border border-studio-700 text-[11px] sm:text-xs text-slate-200">
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
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            See MultiWave in Action
          </h2>
          <p className="mt-2.5 sm:mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Watch the official 22-second product introduction or browse live screenshots of the user interface.
          </p>

          {/* Tab Switcher - Fully Responsive Grid on Mobile */}
          <div className="mt-6 sm:mt-8 w-full max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 p-1 rounded-xl sm:rounded-2xl bg-studio-900 border border-studio-700/70 gap-1">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'video'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" />
              <span>Video</span>
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
              <span>Live Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('screenshots')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'screenshots'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Screenshots</span>
            </button>
            <button
              onClick={() => setActiveTab('routing')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'routing'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Routing</span>
            </button>
          </div>
        </div>

        {/* Media Container */}
        <div className="rounded-2xl sm:rounded-3xl border border-studio-700/80 bg-studio-900/90 shadow-2xl overflow-hidden p-2 sm:p-4 backdrop-blur-xl">
          {activeTab === 'video' && (
            <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <video
                src="/multiwave.mp4"
                controls
                poster="/images/brag_poster.jpg"
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {activeTab === 'simulator' && (
            <div className="p-3 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-studio-800 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Interactive Audio Output &amp; DSP Effects Simulator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click checkboxes to select or unselect devices. Toggle between Studio, 3D Spatial Surround, Bass Punch, Concert Hall, and Vocal Clarity acoustic profiles in real-time. Unselected devices immediately silence and stay IDLE.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Interactive 60 FPS Studio Meter</span>
                </div>
              </div>

              {/* Grid of Interactive Simulator Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-left">
                {simDevices.map((dev) => {
                  const volPercent = Math.round(dev.volume * 100);
                  return (
                    <div
                      key={dev.id}
                      className={`relative rounded-xl p-4 transition-all duration-200 border ${
                        dev.isSelected
                          ? 'bg-studio-900/90 border-cyan-500/50 shadow-[0_0_25px_rgba(0,242,254,0.08)]'
                          : 'bg-studio-900/40 border-studio-700/50 hover:border-studio-600/70 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${
                              dev.isSelected
                                ? 'bg-studio-800 border-cyan-500/40'
                                : 'bg-studio-850 border-studio-700/60'
                            }`}
                          >
                            {dev.type === 'bluetooth' ? (
                              <Bluetooth className="w-4 h-4 text-cyan-400" />
                            ) : dev.type === 'hdmidisplayport' ? (
                              <Tv className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Speaker className="w-4 h-4 text-teal-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-white truncate" title={dev.name}>
                              {dev.name}
                            </h4>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {dev.format}
                            </div>
                          </div>
                        </div>

                        {/* Selection Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleSimDevice(dev.id)}
                          className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-lg border transition-all cursor-pointer ${
                            dev.isSelected
                              ? 'bg-cyan-500 border-cyan-400 text-studio-950 shadow-[0_0_10px_rgba(0,242,254,0.45)]'
                              : 'border-studio-700 bg-studio-850 hover:border-cyan-500/50 text-slate-500'
                          }`}
                          title={dev.isSelected ? 'Unselect card' : 'Select card'}
                        >
                          {dev.isSelected ? (
                            <Check className="w-3.5 h-3.5 stroke-[2.75]" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                          )}
                        </button>
                      </div>

                      {/* Live Reactive Studio Spectrum Visualizer */}
                      <div className="mt-3">
                        <DeviceWaveVisualizer
                          isActive={dev.isSelected && !dev.isMuted && dev.volume > 0}
                          isSelected={dev.isSelected}
                          isTesting={dev.isTesting}
                          isMuted={dev.isMuted}
                          volume={dev.volume}
                          inputLevel={simInputLevel}
                          audioEffect={dev.audioEffect}
                          deviceName={dev.name}
                        />
                      </div>

                      {/* DSP Acoustic Effect Profile Selector */}
                      <div className="mt-2.5 pt-2 border-t border-studio-800/70">
                        <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                          <span className="text-slate-300 font-medium flex items-center gap-1 font-sans">
                            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                            Acoustic Profile
                          </span>
                          <span className="text-[9px] text-cyan-400/90 font-mono capitalize">
                            {dev.audioEffect === 'spatial_3d'
                              ? '3D Spatial'
                              : dev.audioEffect === 'bass_boost'
                              ? 'Bass Punch'
                              : dev.audioEffect === 'concert_hall'
                              ? 'Concert Hall'
                              : dev.audioEffect === 'vocal_clarity'
                              ? 'Vocal Clarity'
                              : 'Studio Master'}
                          </span>
                        </div>

                        <div className="grid grid-cols-5 gap-1">
                          {(
                            [
                              { id: 'studio', label: 'Studio', icon: <Sliders className="w-2.5 h-2.5" /> },
                              { id: 'spatial_3d', label: '3D', icon: <Radio className="w-2.5 h-2.5" /> },
                              { id: 'bass_boost', label: 'Bass', icon: <Zap className="w-2.5 h-2.5" /> },
                              { id: 'concert_hall', label: 'Concert', icon: <Music className="w-2.5 h-2.5" /> },
                              { id: 'vocal_clarity', label: 'Vocal', icon: <Mic className="w-2.5 h-2.5" /> },
                            ] as const
                          ).map((eff) => {
                            const isCur = dev.audioEffect === eff.id;
                            return (
                              <button
                                key={eff.id}
                                type="button"
                                disabled={!dev.isSelected}
                                onClick={() => setSimEffect(dev.id, eff.id)}
                                className={`py-1 px-0.5 rounded text-[9px] font-medium border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                                  isCur && dev.isSelected
                                    ? eff.id === 'spatial_3d'
                                      ? 'bg-purple-950/80 border-purple-500/70 text-purple-200 shadow-[0_0_8px_rgba(192,132,252,0.25)] font-semibold'
                                      : eff.id === 'bass_boost'
                                      ? 'bg-amber-950/80 border-amber-500/70 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.25)] font-semibold'
                                      : eff.id === 'concert_hall'
                                      ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.25)] font-semibold'
                                      : eff.id === 'vocal_clarity'
                                      ? 'bg-rose-950/80 border-rose-500/70 text-rose-200 shadow-[0_0_8px_rgba(251,113,133,0.25)] font-semibold'
                                      : 'bg-cyan-950/80 border-cyan-500/70 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.25)] font-semibold'
                                    : 'bg-studio-850/60 border-studio-800 text-slate-400 hover:text-slate-200 hover:bg-studio-800'
                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                              >
                                {eff.icon}
                                <span className="truncate w-full text-center text-[8px]">{eff.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Volume & Test Controls */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 font-medium flex items-center gap-1">
                            <Sliders className="w-3 h-3 text-cyan-400" />
                            Gain
                          </span>
                          <span className={`font-mono font-semibold ${dev.isMuted ? 'text-rose-400' : 'text-cyan-300'}`}>
                            {dev.isMuted ? 'MUTED' : `${volPercent}%`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSimMute(dev.id)}
                            disabled={!dev.isSelected}
                            className={`p-1.5 rounded-lg border transition-all ${
                              dev.isMuted
                                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                                : 'bg-studio-800 border-studio-700 text-slate-300'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title={dev.isMuted ? 'Unmute' : 'Mute'}
                          >
                            {dev.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>

                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={dev.volume}
                            disabled={!dev.isSelected}
                            onChange={(e) => setSimVolume(dev.id, parseFloat(e.target.value))}
                            className="w-full volume-slider disabled:opacity-40"
                          />

                          <button
                            type="button"
                            onClick={() => testSimDevice(dev.id)}
                            disabled={dev.isTesting}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium border flex items-center gap-1 transition-all ${
                              dev.isTesting
                                ? 'bg-cyan-500 text-studio-950 border-cyan-400 font-semibold'
                                : 'bg-studio-800 hover:bg-studio-700 border-studio-700 text-slate-300'
                            }`}
                            title="Test chime"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{dev.isTesting ? 'Testing' : 'Test'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'screenshots' && (
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-studio-950 border border-studio-700/60">
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
                    <img src={thumb.src} alt={thumb.title} className="rounded-lg w-full h-14 sm:h-16 object-cover" />
                    <span className="block text-[10px] sm:text-[11px] font-semibold text-slate-300 mt-1 truncate">
                      {thumb.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'routing' && (
            <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-studio-950 border border-studio-700/60 p-2 sm:p-4 flex items-center justify-center">
              <img
                src="/images/windows_audio_routing.png"
                alt="MultiWave Audio Routing Architecture"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="scroll-mt-24 py-14 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">
            Built For macOS &amp; Windows 10/11
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-2 font-display">
            Engineered For Pure Audio Perfection
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Traditional audio splitters suffer from delay drift, stuttering resamplers, and painful configuration. MultiWave was purpose-built to eliminate every single one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Feature 1 */}
          <div className="rounded-2xl sm:rounded-3xl border border-studio-700/70 bg-studio-900/60 p-5 sm:p-7 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 sm:mb-5">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Simultaneous Multi-Streaming</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300/80 leading-relaxed">
              Opens dedicated CoreAudio &amp; WASAPI shared-mode streams for all selected devices concurrently, broadcasting high-fidelity PCM audio without dropouts.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl sm:rounded-3xl border border-studio-700/70 bg-studio-900/60 p-5 sm:p-7 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 sm:mb-5">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Bluetooth Delay Sync (0-500ms)</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300/80 leading-relaxed">
              Wireless Bluetooth speakers naturally lag by 120–180ms. MultiWave lets you delay wired speakers so sound hits your ears with zero echo.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl sm:rounded-3xl border border-studio-700/70 bg-studio-900/60 p-5 sm:p-7 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 sm:mb-5">
              <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Per-Device Software Gain</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300/80 leading-relaxed">
              Independent volume sliders mapped to perceptual cubic curves (v²·⁵) with built-in soft-limiters to prevent digital clipping.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-2xl sm:rounded-3xl border border-studio-700/70 bg-studio-900/60 p-5 sm:p-7 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 sm:mb-5">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Studio Spectrum &amp; 5 DSP Effects</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300/80 leading-relaxed">
              16-Band high-resolution LED spectrum meters with floating peak-hold bars and Dual Stereo VU meters. Real-time acoustic profiles: 3D Spatial Surround soundstage widening, Studio Mastering, Bass Boost, Concert Hall convolution diffusion, and Vocal Dialogue clarity.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-2xl sm:rounded-3xl border border-studio-700/70 bg-studio-900/60 p-5 sm:p-7 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 sm:mb-5">
              <Music className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Built-in Multi-Tone Chimes</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300/80 leading-relaxed">
              Built-in harmonic C-Major chords, melodic arpeggios, and pink noise generators let you verify any speaker with a single click.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-2xl sm:rounded-3xl border border-studio-700/70 bg-studio-900/60 p-5 sm:p-7 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 sm:mb-5">
              <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Automated Driver Bundling</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300/80 leading-relaxed">
              Ships natively with virtual audio loopback drivers (BlackHole for macOS &amp; VB-Audio for Windows) and 1-click automated setup. No manual driver hunting needed.
            </p>
          </div>
        </div>

      </section>

      {/* Rebuild / CLI Option for Developers */}
      <section id="specs" className="scroll-mt-24 py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl sm:rounded-3xl border border-studio-700/80 bg-studio-900/70 p-5 sm:p-8 md:p-10 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="w-full md:w-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] sm:text-xs font-mono font-semibold mb-2">
                <span>OPEN SOURCE FOR INDIVIDUAL USE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">Want to inspect the code or compile yourself?</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg leading-relaxed">
                MultiWave is a 100% open-source project for individual use. Check out the source code, contribute, report issues, or build the Rust &amp; React application locally.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-studio-800 hover:bg-studio-750 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all shadow-sm hover:scale-[1.02] active:scale-100"
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    buildPlatform === 'mac'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-studio-850 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <AppleIcon className="w-3.5 h-3.5" />
                  <span>macOS Shell</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBuildPlatform('windows')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    buildPlatform === 'windows'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                      : 'bg-studio-850 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <WindowsIcon className="w-3.5 h-3.5" />
                  <span>PowerShell</span>
                </button>
              </div>

              <div className="flex items-center justify-between bg-studio-950 border border-studio-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 font-mono text-xs text-cyan-300 gap-2 sm:gap-4 overflow-hidden">
                <span className="truncate">{buildPlatform === 'mac' ? './build_mac.sh' : '.\\build_exe.ps1 -Installer'}</span>
                <button
                  type="button"
                  onClick={copyBuildCmd}
                  className="shrink-0 px-2.5 py-1 rounded-md bg-studio-800 hover:bg-studio-700 text-slate-300 hover:text-white transition-all text-[11px] font-sans font-semibold"
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
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-studio-900 via-studio-850 to-studio-900 border border-cyan-500/40 p-6 sm:p-10 md:p-14 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Ready to Sync Your Audio?
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-300 max-w-xl mx-auto">
            Download MultiWave for macOS &amp; Windows today. Free and open-source project for individual use with Desktop shortcuts, CoreAudio loopback, and virtual audio driver included.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
            {/* macOS (.dmg) */}
            <a
              href={macInstallerUrl}
              download="MultiWave_0.1.0_macOS.dmg"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-studio-800 hover:bg-studio-750 border border-cyan-500/60 hover:border-cyan-400 text-white shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-100 text-center"
            >
              <AppleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
              <span>Download for macOS (.dmg)</span>
            </a>

            {/* Windows (.exe) */}
            <a
              href={windowsInstallerUrl}
              download="MultiWave_0.1.0_x64-setup.exe"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all hover:scale-105 active:scale-100 text-center"
            >
              <WindowsIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>Download for Windows (.exe)</span>
            </a>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Also available as</span>
            <a
              href={macZipUrl}
              download="MultiWave_0.1.0_macOS.zip"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-500/40"
            >
              macOS Portable (.zip)
            </a>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-studio-800 bg-[#060911] px-4 sm:px-6 py-8 sm:py-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="MultiWave" className="w-7 h-7 rounded-lg object-cover" />
              <span className="font-bold text-white text-sm">MultiWave</span>
            </div>
            <span className="text-[11px] sm:text-xs text-slate-400 sm:border-l sm:border-studio-800 sm:pl-3">
              Open-source project for individual use • macOS &amp; Windows Audio Output Router
            </span>
          </div>


          <div className="text-[11px] sm:text-xs text-slate-400 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
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
