import React, { useState } from 'react';
import {
  Headphones,
  Battery,
  Zap,
  Sliders,
  CheckCircle2,
  Volume2,
  Radio,
  Plus,
  Bluetooth,
  ShieldCheck,
  RotateCw,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Activity,
  Sparkles,
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface DeviceDashboardSectionProps {
  devices: ConnectedDevice[];
  onConnectDevice: (deviceId: string) => void;
  onUpdateAncMode: (deviceId: string, mode: 'ANC High' | 'Transparency' | 'Off') => void;
  onUpdateEq: (deviceId: string, eq: string) => void;
  onToggleAutoReconnect?: (deviceId: string) => void;
}

export const DeviceDashboardSection: React.FC<DeviceDashboardSectionProps> = ({
  devices,
  onConnectDevice,
  onUpdateAncMode,
  onUpdateEq,
  onToggleAutoReconnect,
}) => {
  // Local synchronization animation state
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);
  const [syncType, setSyncType] = useState<'reconnect' | 'auto-reconnect' | null>(null);
  const [isFullStackSyncing, setIsFullStackSyncing] = useState<boolean>(false);
  const [syncLogMessage, setSyncLogMessage] = useState<string | null>(null);

  const activeDevice = devices.find((d) => d.isConnected) || devices[0];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Earbuds':
      case 'Headphones':
        return <Headphones className="w-6 h-6 text-indigo-400" />;
      case 'Car Audio':
        return <Radio className="w-6 h-6 text-amber-400" />;
      default:
        return <Volume2 className="w-6 h-6 text-emerald-400" />;
    }
  };

  // Trigger device connection with subtle synchronization animation
  const handleConnectWithSyncAnimation = (deviceId: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    setSyncingDeviceId(deviceId);
    setSyncType('reconnect');
    setSyncLogMessage(`Initiating Bluetooth SDP handshake & audio stream sync with ${dev?.name || 'Device'}...`);

    setTimeout(() => {
      onConnectDevice(deviceId);
      setSyncType(null);
      setSyncLogMessage(`Successfully synchronized audio channel with ${dev?.name || 'Device'} (Latency ${dev?.latencyMs || 20}ms).`);

      setTimeout(() => {
        setSyncingDeviceId(null);
        setSyncLogMessage(null);
      }, 2500);
    }, 1200);
  };

  // Trigger auto-reconnect toggle with subtle synchronization animation
  const handleAutoReconnectWithSyncAnimation = (deviceId: string) => {
    if (!onToggleAutoReconnect) return;
    const dev = devices.find((d) => d.id === deviceId);
    const newStatus = !dev?.autoReconnect;

    setSyncingDeviceId(deviceId);
    setSyncType('auto-reconnect');
    setSyncLogMessage(`Updating hardware auto-pairing policy for ${dev?.name}...`);

    setTimeout(() => {
      onToggleAutoReconnect(deviceId);
      setSyncType(null);
      setSyncLogMessage(`Auto-reconnect ${newStatus ? 'ENABLED' : 'DISABLED'} for ${dev?.name}. Preference saved to device stack.`);

      setTimeout(() => {
        setSyncingDeviceId(null);
        setSyncLogMessage(null);
      }, 2500);
    }, 800);
  };

  // Force re-sync audio stack across all paired devices
  const handleFullStackSync = () => {
    setIsFullStackSyncing(true);
    setSyncLogMessage('Scanning Bluetooth stack & re-synchronizing codec profiles for all paired devices...');

    setTimeout(() => {
      setIsFullStackSyncing(false);
      setSyncLogMessage('Audio hardware stack fully synchronized. All codec channels verified.');
      setTimeout(() => setSyncLogMessage(null), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Audio Device Management Dashboard
            <Bluetooth className={`w-5 h-5 text-indigo-400 ${isFullStackSyncing ? 'animate-bounce text-emerald-400' : ''}`} />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage paired Bluetooth headphones, smart speakers, and car audio hands-free with real-time state synchronization.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Re-sync Stack Button */}
          <button
            id="resync-stack-btn"
            onClick={handleFullStackSync}
            disabled={isFullStackSyncing}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-all active:scale-95"
            title="Re-synchronize Bluetooth audio state with hardware stack"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isFullStackSyncing ? 'animate-spin' : ''}`} />
            <span>{isFullStackSyncing ? 'Syncing Stack...' : 'Sync Audio Stack'}</span>
          </button>

          <button
            id="pair-device-btn"
            onClick={() => alert('Scanning for nearby Bluetooth audio devices in pairing mode...')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Pair New Audio Device</span>
          </button>
        </div>
      </div>

      {/* Sync State Live Feedback Notification Banner */}
      {syncLogMessage && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/70 border border-indigo-500/50 text-xs text-indigo-200 shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="font-mono text-slate-200">{syncLogMessage}</span>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30 shrink-0">
            Backend Synced
          </span>
        </div>
      )}

      {/* Active Device Quick Equalizer & Noise Control Hero */}
      {activeDevice && (
        <div className="rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/40 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle Background Sync Wave Pulse */}
          {syncingDeviceId === activeDevice.id && (
            <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none animate-pulse border-2 border-indigo-400/50 rounded-3xl" />
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300">
                {getDeviceIcon(activeDevice.type)}
                {syncingDeviceId === activeDevice.id && (
                  <span className="absolute -top-1 -right-1 p-1 bg-indigo-600 rounded-full text-white shadow-lg animate-spin">
                    <RotateCw className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Output
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                    {activeDevice.codec}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mt-0.5">{activeDevice.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type: {activeDevice.type} • Latency: <span className="text-indigo-300 font-mono">{activeDevice.latencyMs}ms</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Auto-Reconnect Badge & Switch in Hero */}
              {onToggleAutoReconnect && (
                <button
                  id={`hero-toggle-autoreconnect-${activeDevice.id}`}
                  onClick={() => handleAutoReconnectWithSyncAnimation(activeDevice.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-2xl border text-xs transition-all ${
                    activeDevice.autoReconnect
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Toggle automatic reconnection on proximity"
                >
                  {syncingDeviceId === activeDevice.id && syncType === 'auto-reconnect' ? (
                    <RotateCw className="w-4 h-4 text-amber-400 animate-spin" />
                  ) : activeDevice.autoReconnect ? (
                    <ToggleRight className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-500" />
                  )}
                  <span className="font-semibold text-[11px]">
                    Auto-Reconnect: {activeDevice.autoReconnect ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}

              <div className="flex items-center space-x-3 bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800">
                <Battery className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-slate-400">Battery</p>
                  <p className="text-sm font-bold text-emerald-300 font-mono">{activeDevice.batteryLevel}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Noise Cancellation (ANC) Controls */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Noise Control Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ANC High', 'Transparency', 'Off'] as const).map((mode) => (
                <button
                  key={mode}
                  id={`anc-mode-${mode.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onUpdateAncMode(activeDevice.id, mode)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    activeDevice.ancMode === mode
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:bg-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Equalizer Preset Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Equalizer Audio Preset
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Malayalam Vocal Enhancer',
                'Deep Bass Boost',
                'Acoustic Surround',
                'Clarity Mode',
              ].map((eq) => (
                <button
                  key={eq}
                  id={`eq-preset-${eq.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onUpdateEq(activeDevice.id, eq)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    activeDevice.equalizerPreset === eq
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Paired Audio Devices List */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Paired Devices ({devices.length})
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h3>

          <span className="text-xs text-slate-400 italic">
            Click 'Switch Audio' or toggle Auto-Reconnect to preview sync status
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((device) => {
            const isDeviceSyncing = syncingDeviceId === device.id;

            return (
              <div
                key={device.id}
                id={`device-card-${device.id}`}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                  isDeviceSyncing
                    ? 'bg-indigo-950/60 border-indigo-400 shadow-xl ring-2 ring-indigo-500/50 animate-pulse'
                    : device.isConnected
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative p-3 rounded-xl bg-slate-800 border border-slate-700">
                      {getDeviceIcon(device.type)}
                      {isDeviceSyncing && (
                        <span className="absolute -top-1 -right-1 p-0.5 bg-indigo-500 rounded-full text-white shadow animate-spin">
                          <RotateCw className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {device.name}
                        {device.isConnected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        )}
                      </h4>
                      <p className="text-xs text-slate-400">{device.type} • {device.codec}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-emerald-400 font-semibold">
                      {device.batteryLevel}%
                    </span>
                    <p className="text-[10px] text-slate-500">{device.lastConnected}</p>
                  </div>
                </div>

                {/* Card Controls Row */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs">
                  {/* Auto Reconnect Toggle on Card */}
                  {onToggleAutoReconnect ? (
                    <button
                      id={`card-toggle-autoreconnect-${device.id}`}
                      onClick={() => handleAutoReconnectWithSyncAnimation(device.id)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                        device.autoReconnect
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Toggle auto-reconnect preference"
                    >
                      {isDeviceSyncing && syncType === 'auto-reconnect' ? (
                        <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      ) : (
                        <Bluetooth className={`w-3.5 h-3.5 ${device.autoReconnect ? 'text-emerald-400' : 'text-slate-500'}`} />
                      )}
                      <span className="text-[11px] font-medium">
                        Auto-sync: <strong className="font-mono">{device.autoReconnect ? 'ON' : 'OFF'}</strong>
                      </span>
                    </button>
                  ) : (
                    <span className="text-slate-400">
                      EQ: <strong className="text-indigo-300">{device.equalizerPreset}</strong>
                    </span>
                  )}

                  {/* Connect / Switch Audio Button */}
                  <button
                    id={`connect-dev-${device.id}`}
                    onClick={() => handleConnectWithSyncAnimation(device.id)}
                    disabled={device.isConnected || isDeviceSyncing}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                      isDeviceSyncing && syncType === 'reconnect'
                        ? 'bg-indigo-600/80 text-indigo-200 border border-indigo-400 shadow-md'
                        : device.isConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-95'
                    }`}
                  >
                    {isDeviceSyncing && syncType === 'reconnect' ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 text-white animate-spin" />
                        <span>Syncing...</span>
                      </>
                    ) : device.isConnected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <span>Switch Audio</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
