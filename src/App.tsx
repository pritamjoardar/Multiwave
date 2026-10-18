import { useState, useEffect } from 'react';
import { useAudioMixer } from './hooks/useAudioMixer';
import { Header } from './components/Header';
import { DeviceCard } from './components/DeviceCard';
import { SettingsModal } from './components/SettingsModal';
import { UserGuideModal } from './components/UserGuideModal';
import {
  AlertTriangle,
  X,
  Volume2,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const {
    devices,
    metrics,
    settings,
    isLoading,
    errorMessage,
    testingDeviceId,
    virtualDevice,
    isVirtualDefault,
    clearError,
    refreshDevices,
    toggleDeviceSelection,
    setDeviceVolume,
    toggleDeviceMute,
    setDeviceDelay,
    togglePlayback,
    testDevice,
    updateSettings,
    openSoundSettings,
    activateMultiwaveRouting,
    setDefaultOutputDevice,
    configureVirtualSpeakerName,
    installVirtualSpeakerDriver,
  } = useAudioMixer();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Automatically open step-by-step User Guide the first time the user opens the application
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('multiwave_has_seen_guide');
    if (!hasSeenGuide) {
      setIsGuideOpen(true);
    }
  }, []);

  // Apply theme dynamically to document root
  useEffect(() => {
    const currentTheme = settings.theme || localStorage.getItem('multiwave_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('multiwave_theme', currentTheme);
  }, [settings.theme]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDevices();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Only real physical audio output devices are displayed to the user
  const physicalDevices = devices.filter(
    (d) =>
      d.device_type !== 'virtual' &&
      !d.name.toLowerCase().includes('virtual') &&
      !d.name.toLowerCase().includes('cable') &&
      !d.name.toLowerCase().includes('audiorelay') &&
      !d.name.toLowerCase().includes('multiwave')
  );

  const selectedDevices = physicalDevices.filter((d) => d.is_selected);

  return (
    <div className="min-h-screen bg-studio-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-studio-950 transition-colors duration-200">
      {/* Top Application Header */}
      <Header
        totalDevices={physicalDevices.length}
        selectedCount={selectedDevices.length}
        playbackStatus={metrics.status}
        activeStreams={metrics.active_stream_count}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onTogglePlayback={togglePlayback}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="rounded-xl p-4 bg-rose-950/80 border border-rose-500/50 text-rose-200 flex items-start justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">Audio Engine Notice</h4>
                <p className="text-xs text-rose-200 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="p-1 rounded-lg hover:bg-rose-900/60 text-rose-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Output Devices Header */}
        <div className="pt-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            Audio Output Devices
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select multiple outputs to route audio simultaneously with independent gain, delay sync, and live visualizer meters.
          </p>
        </div>

        {/* Output Device Grid */}
        <section aria-label="Audio Devices Grid">
          {isLoading ? (
            <div className="p-12 text-center rounded-2xl border border-studio-800 bg-studio-900/40 space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-300 font-medium">Enumerating Windows Core Audio endpoints...</p>
              <p className="text-xs text-slate-500 font-mono">Querying IMMDeviceEnumerator & WASAPI formats</p>
            </div>
          ) : physicalDevices.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-studio-800 bg-studio-900/40 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-studio-800 border border-studio-700 mx-auto flex items-center justify-center text-slate-400">
                <Volume2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">No Audio Output Endpoints Detected</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                  Make sure your speakers, headphones, or Bluetooth audio devices are connected and enabled in Windows Sound Settings.
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-studio-950 font-semibold text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rescan Audio Devices</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {physicalDevices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  isTesting={testingDeviceId === device.id}
                  isPlaying={metrics.status === 'playing'}
                  isMasterMuted={metrics.master_mute}
                  masterVolume={metrics.master_volume}
                  inputLevel={metrics.input_level}
                  onToggleSelect={toggleDeviceSelection}
                  onVolumeChange={setDeviceVolume}
                  onToggleMute={toggleDeviceMute}
                  onDelayChange={setDeviceDelay}
                  onTestOutput={testDevice}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        devices={devices}
        virtualDevice={virtualDevice}
        isVirtualDefault={isVirtualDefault}
        onClose={() => setIsSettingsOpen(false)}
        onSave={updateSettings}
        onActivateRouting={activateMultiwaveRouting}
        onRestoreDirect={setDefaultOutputDevice}
        onConfigureName={configureVirtualSpeakerName}
        onOpenSoundSettings={openSoundSettings}
        onInstallDriver={installVirtualSpeakerDriver}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Interactive Step-by-Step User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenSettings={() => {
          setIsGuideOpen(false);
          setIsSettingsOpen(true);
        }}
      />
    </div>
  );
}
