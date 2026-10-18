import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioDevice, PlaybackMetrics, AppSettings, ToneType } from '../types/audio';
import { TauriAudioService } from '../services/tauriService';

export function useAudioMixer() {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [metrics, setMetrics] = useState<PlaybackMetrics>({
    status: 'stopped',
    active_stream_count: 0,
    master_volume: 1.0,
    master_mute: false,
    tone_type: 'system_loopback',
    sample_rate: 48000,
    underrun_count: 0,
    input_level: 0,
    capture_device: 'Virtual Speakers (Auto)',
  });
  const [settings, setSettings] = useState<AppSettings>({
    selected_device_ids: [],
    device_volumes: {},
    device_mutes: {},
    device_delays: {},
    master_volume: 1.0,
    master_mute: false,
    tone_type: 'system_loopback',
    theme: 'dark',
    auto_reconnect: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testingDeviceId, setTestingDeviceId] = useState<string | null>(null);

  const clearError = () => setErrorMessage(null);
  const isRefreshingRef = useRef(false);

  const refreshDevices = useCallback(async () => {
    if (isRefreshingRef.current) return [];
    isRefreshingRef.current = true;
    try {
      const devList = await TauriAudioService.refreshAudioDevices();
      setDevices(devList);
      return devList;
    } catch (err: unknown) {
      console.error('Failed to refresh devices:', err);
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
      return [];
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  const refreshState = useCallback(async () => {
    try {
      const [devList, currentMetrics, currentSettings] = await Promise.all([
        TauriAudioService.getAudioDevices(),
        TauriAudioService.getPlaybackState(),
        TauriAudioService.getSettings(),
      ]);
      setDevices(devList);
      setMetrics(currentMetrics);
      setSettings(currentSettings);

      // Automatically change Windows default audio route to MultiWave on open
      if (devList && devList.length > 0) {
        const vdev = devList.find(
          (d) =>
            (d.device_type === 'virtual' ||
              d.name.toLowerCase().includes('virtual') ||
              d.name.toLowerCase().includes('multiwave') ||
              d.name.toLowerCase().includes('cable')) &&
            !d.name.toLowerCase().includes('16ch') &&
            !d.name.toLowerCase().includes('16 ch')
        );
        if (vdev && !vdev.is_default) {
          TauriAudioService.activateMultiwaveRouting()
            .then((m) => {
              if (m) setMetrics(m);
              refreshDevices();
            })
            .catch((e) => console.error('Auto routing on launch error:', e));
        }
      }
    } catch (err: unknown) {
      console.error('Failed to fetch initial state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshState();

    let unlistenState: (() => void) | undefined;
    let unlistenDefault: (() => void) | undefined;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const triggerDebouncedRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        refreshDevices();
      }, 300);
    };

    TauriAudioService.onDeviceStateChanged(() => {
      triggerDebouncedRefresh();
    }).then((unlisten) => {
      unlistenState = unlisten;
    });

    TauriAudioService.onDefaultDeviceChanged(() => {
      triggerDebouncedRefresh();
    }).then((unlisten) => {
      unlistenDefault = unlisten;
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (unlistenState) unlistenState();
      if (unlistenDefault) unlistenDefault();
    };
  }, [refreshState, refreshDevices]);

  // Real-time audio input level polling while playing (chained setTimeout to prevent queue congestion)
  useEffect(() => {
    if (metrics.status !== 'playing') return;

    let active = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      if (!active) return;
      try {
        const state = await TauriAudioService.getPlaybackState();
        if (active) {
          setMetrics((prev) => ({
            ...prev,
            input_level: state.input_level,
            active_stream_count: state.active_stream_count,
            capture_device: state.capture_device,
          }));
        }
      } catch (e) {
        console.error('Playback poll notice:', e);
      }
      if (active) {
        timerId = setTimeout(poll, 80);
      }
    };

    timerId = setTimeout(poll, 80);

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [metrics.status]);

  const setCaptureDevice = async (name?: string) => {
    try {
      const updated = await TauriAudioService.setCaptureDevice(name);
      if (updated) setMetrics(updated);
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const openSoundSettings = async () => {
    try {
      await TauriAudioService.openWindowsSoundSettings();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const toggleDeviceSelection = async (deviceId: string) => {
    clearError();
    const target = devices.find((d) => d.id === deviceId);
    if (!target) return;

    try {
      if (target.is_selected) {
        await TauriAudioService.deselectOutputDevice(deviceId);
      } else {
        await TauriAudioService.selectOutputDevice(deviceId);
      }
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, is_selected: !d.is_selected } : d))
      );
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const selectAll = async () => {
    clearError();
    try {
      await TauriAudioService.selectAllDevices();
      setDevices((prev) => prev.map((d) => ({ ...d, is_selected: true })));
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const deselectAll = async () => {
    clearError();
    try {
      await TauriAudioService.deselectAllDevices();
      setDevices((prev) => prev.map((d) => ({ ...d, is_selected: false })));
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const setDeviceVolume = async (deviceId: string, volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, software_volume: clamped } : d))
    );
    try {
      await TauriAudioService.setDeviceVolume(deviceId, clamped);
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const toggleDeviceMute = async (deviceId: string) => {
    const target = devices.find((d) => d.id === deviceId);
    if (!target) return;
    const newMute = !target.software_mute;

    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, software_mute: newMute } : d))
    );
    try {
      await TauriAudioService.setDeviceMute(deviceId, newMute);
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const setDeviceDelay = async (deviceId: string, delayMs: number) => {
    const clamped = Math.max(0, Math.min(500, delayMs));
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, sync_delay_ms: clamped } : d))
    );
    try {
      await TauriAudioService.setDeviceDelay(deviceId, clamped);
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const setMasterVolume = async (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    setMetrics((prev) => ({ ...prev, master_volume: clamped }));
    try {
      const updated = await TauriAudioService.setMasterVolume(clamped);
      if (updated) setMetrics(updated);
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const toggleMasterMute = async () => {
    const newMute = !metrics.master_mute;
    setMetrics((prev) => ({ ...prev, master_mute: newMute }));
    try {
      const updated = await TauriAudioService.setMasterMute(newMute);
      if (updated) setMetrics(updated);
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const setToneType = async (toneType: ToneType) => {
    setMetrics((prev) => ({ ...prev, tone_type: toneType }));
    try {
      const updated = await TauriAudioService.setToneType(toneType);
      if (updated) setMetrics(updated);
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const togglePlayback = async () => {
    clearError();
    try {
      if (metrics.status === 'playing') {
        const updated = await TauriAudioService.pausePlayback();
        setMetrics(updated);
      } else if (metrics.status === 'paused') {
        const updated = await TauriAudioService.resumePlayback();
        setMetrics(updated);
      } else {
        const selected = devices.filter((d) => d.is_selected);
        if (selected.length === 0) {
          setErrorMessage('Please select at least one output device to begin multi-device playback.');
          return;
        }
        const updated = await TauriAudioService.startPlayback();
        setMetrics(updated);
      }
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const stopPlayback = async () => {
    clearError();
    try {
      const updated = await TauriAudioService.stopPlayback();
      setMetrics(updated);
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const testDevice = async (deviceId: string) => {
    clearError();
    setTestingDeviceId(deviceId);
    try {
      await TauriAudioService.testOutputDevice(deviceId);
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    } finally {
      setTimeout(() => {
        setTestingDeviceId((curr) => (curr === deviceId ? null : curr));
      }, 2600);
    }
  };

  const updateSettings = async (newSettings: AppSettings) => {
    clearError();
    try {
      const saved = await TauriAudioService.updateSettings(newSettings);
      setSettings(saved);
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const virtualDevice = devices.find(
    (d) =>
      (d.device_type === 'virtual' ||
        d.name.toLowerCase().includes('virtual') ||
        d.name.toLowerCase().includes('audiorelay') ||
        d.name.toLowerCase().includes('multiwave') ||
        d.name.toLowerCase().includes('cable')) &&
      !d.name.toLowerCase().includes('16ch') &&
      !d.name.toLowerCase().includes('16 ch')
  );

  const currentDefaultDevice = devices.find((d) => d.is_default);
  const isVirtualDefault = Boolean(virtualDevice && virtualDevice.is_default);

  const activateMultiwaveRouting = async () => {
    clearError();
    try {
      const updated = await TauriAudioService.activateMultiwaveRouting();
      setMetrics(updated);
      await refreshDevices();
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const setDefaultOutputDevice = async (deviceId: string) => {
    clearError();
    try {
      await TauriAudioService.setDefaultOutputDevice(deviceId);
      await refreshDevices();
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const configureVirtualSpeakerName = async () => {
    clearError();
    try {
      await TauriAudioService.configureVirtualSpeakerName();
      setTimeout(refreshDevices, 3000);
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  const [hasAutoActivated, setHasAutoActivated] = useState(false);

  // Automatically activate routing whenever a virtual speaker is present and not yet default
  useEffect(() => {
    if (virtualDevice && !isVirtualDefault && !hasAutoActivated) {
      setHasAutoActivated(true);
      activateMultiwaveRouting();
    }
  }, [virtualDevice, isVirtualDefault, hasAutoActivated]);

  const installVirtualSpeakerDriver = async () => {
    clearError();
    try {
      await TauriAudioService.installVirtualSpeakerDriver();
      // Actively poll for the device every 2s for 30s
      let checks = 0;
      const interval = setInterval(async () => {
        checks++;
        const updatedDevices = await TauriAudioService.refreshAudioDevices();
        if (updatedDevices && updatedDevices.length > 0) {
          setDevices(updatedDevices);
          const found = updatedDevices.some(
            (d) =>
              d.device_type === 'virtual' ||
              d.name.toLowerCase().includes('virtual') ||
              d.name.toLowerCase().includes('multiwave')
          );
          if (found) {
            clearInterval(interval);
            try {
              const updated = await TauriAudioService.activateMultiwaveRouting();
              setMetrics(updated);
              await TauriAudioService.refreshAudioDevices().then(setDevices);
            } catch (e) {
              console.error('Auto routing error after install:', e);
            }
          }
        }
        if (checks >= 15) {
          clearInterval(interval);
        }
      }, 2000);
    } catch (err: unknown) {
      setErrorMessage(typeof err === 'string' ? err : (err as Error).message);
    }
  };

  return {
    devices,
    metrics,
    settings,
    isLoading,
    errorMessage,
    testingDeviceId,
    virtualDevice,
    currentDefaultDevice,
    isVirtualDefault,
    clearError,
    refreshDevices,
    toggleDeviceSelection,
    selectAll,
    deselectAll,
    setDeviceVolume,
    toggleDeviceMute,
    setDeviceDelay,
    setMasterVolume,
    toggleMasterMute,
    setToneType,
    togglePlayback,
    stopPlayback,
    testDevice,
    updateSettings,
    setCaptureDevice,
    openSoundSettings,
    activateMultiwaveRouting,
    setDefaultOutputDevice,
    configureVirtualSpeakerName,
    installVirtualSpeakerDriver,
  };
}

