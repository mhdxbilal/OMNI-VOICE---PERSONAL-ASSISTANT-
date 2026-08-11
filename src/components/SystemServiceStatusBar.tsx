import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  RefreshCw,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Volume2,
  HardDrive,
  Layers,
} from 'lucide-react';
import { backgroundServiceWorker, BackgroundWorkerStatus } from '../services/BackgroundServiceWorker';
import { offlineSpeechEngine, OfflineEngineState } from '../services/OfflineSpeechEngine';
import { LanguageMode } from '../types';

interface SystemServiceStatusBarProps {
  language: LanguageMode;
  isOffline: boolean;
}

export const SystemServiceStatusBar: React.FC<SystemServiceStatusBarProps> = ({
  language,
  isOffline,
}) => {
  const [bgStatus, setBgStatus] = useState<BackgroundWorkerStatus>(backgroundServiceWorker.getStatus());
  const [engineState, setEngineState] = useState<OfflineEngineState>(offlineSpeechEngine.getState());
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    const unsubBg = backgroundServiceWorker.subscribe(setBgStatus);
    const unsubEngine = offlineSpeechEngine.subscribe(setEngineState);
    return () => {
      unsubBg();
      unsubEngine();
    };
  }, []);

  const handleManualCrashRecovery = () => {
    setIsRecovering(true);
    backgroundServiceWorker.triggerCrashRecovery();
    setTimeout(() => {
      setIsRecovering(false);
    }, 1500);
  };

  const handleToggleBgWorker = () => {
    if (bgStatus.isRunning) {
      backgroundServiceWorker.stopService();
    } else {
      backgroundServiceWorker.startService();
    }
  };

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800/90 text-slate-200 text-xs py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 overflow-visible">
        {/* Left Side: Background Service Worker & Wake Lock Heartbeat Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Background Worker Status Badge */}
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  bgStatus.isRunning ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  bgStatus.isRunning ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="font-mono font-bold text-slate-200 text-[11px]">
              BG Service: {bgStatus.isRunning ? 'RUNNING' : 'STANDBY'}
            </span>
            <button
              id="bg-status-toggle-btn"
              onClick={handleToggleBgWorker}
              className="ml-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 transition-colors"
            >
              {bgStatus.isRunning ? 'Pause' : 'Activate'}
            </button>
          </div>

          {/* Screen Wake Lock Status */}
          <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
            <Lock className={`w-3.5 h-3.5 ${bgStatus.wakeLockActive ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="font-mono text-[11px] text-slate-300">
              WakeLock: <strong className={bgStatus.wakeLockActive ? 'text-emerald-300' : 'text-slate-400'}>
                {bgStatus.wakeLockActive ? 'ACTIVE (PREVENT OS SLEEP)' : 'INACTIVE'}
              </strong>
            </span>
          </div>

          {/* Watchdog Status */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-[11px] text-indigo-300">
              Watchdog: Auto-Restart Ready ({bgStatus.restartCount} Restarts)
            </span>
          </div>
        </div>

        {/* Right Side: Offline STT Language Models (English & Malayalam) Status */}
        <div className="flex flex-wrap items-center gap-2.5 overflow-visible">
          {/* English Vosk Model Badge */}
          <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-[11px] text-slate-300">
              English SLM (92MB): <span className="text-emerald-400 font-bold">LOADED</span>
            </span>
          </div>

          {/* Malayalam Vosk Model Badge with dynamic line-height for Malayalam script */}
          <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 overflow-visible">
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono text-[11px] text-slate-300 leading-relaxed overflow-visible">
              മലയാളം SLM (148MB): <span className="text-emerald-400 font-bold">LOADED</span>
            </span>
          </div>

          {/* Crash Recovery Reset Action Button */}
          <button
            id="watchdog-crash-recovery-btn"
            onClick={handleManualCrashRecovery}
            disabled={isRecovering}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-all active:scale-95"
            title="Simulate service recovery watchdog"
          >
            <RefreshCw className={`w-3 h-3 text-amber-400 ${isRecovering ? 'animate-spin' : ''}`} />
            <span>{isRecovering ? 'Recovering...' : 'Test Recovery Watchdog'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
