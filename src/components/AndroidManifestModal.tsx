import React from 'react';
import {
  Smartphone,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  XCircle,
  HardDrive,
  Layers,
  Activity,
  X,
  Code2,
  Lock,
  Terminal,
} from 'lucide-react';

interface AndroidManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOffline: boolean;
  activeDeviceName: string;
}

export const AndroidManifestModal: React.FC<AndroidManifestModalProps> = ({
  isOpen,
  onClose,
  isOffline,
  activeDeviceName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="bg-slate-950/90 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Native Android Build Spec
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  Android 15 (API 35)
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">com.mobileaction.omnivoise.android</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* APK Package Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">App Version</span>
              <strong className="text-sm font-mono text-white">v2.7.0-release</strong>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Target Architecture</span>
              <strong className="text-sm font-mono text-emerald-400">arm64-v8a</strong>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Min SDK / Target</span>
              <strong className="text-sm font-mono text-indigo-300">API 26 / API 35</strong>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">NPU Acceleration</span>
              <strong className="text-sm font-mono text-purple-300">NNAPI Active</strong>
            </div>
          </div>

          {/* Native C++ Shared Libraries (.so JNI Bridges) */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Native C++ JNI Shared Libraries
            </h3>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono text-[11px] space-y-1.5">
              <div className="flex justify-between items-center text-slate-300">
                <span>libmobileaction270m.so (Vosk + Whisper SLM)</span>
                <span className="text-emerald-400 font-bold">240 MB • LOADED</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>libonnxruntime.so (Tensor Flow / NNAPI)</span>
                <span className="text-emerald-400 font-bold">18 MB • ACTIVE</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>libaudiotrack_jni.so (Android Low-Latency DSP)</span>
                <span className="text-indigo-400 font-bold">4.2 MB • BOUND</span>
              </div>
            </div>
          </div>

          {/* Android Runtime Permissions Granted */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Android Manifest Permissions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { name: 'android.permission.RECORD_AUDIO', label: 'Mic Stream', granted: true },
                { name: 'android.permission.CALL_PHONE', label: 'Direct Telephony', granted: true },
                { name: 'android.permission.SEND_SMS', label: 'SmsManager API', granted: true },
                { name: 'android.permission.READ_CONTACTS', label: 'Contacts Provider', granted: true },
                { name: 'android.permission.SYSTEM_ALERT_WINDOW', label: 'Floating Overlay', granted: true },
                { name: 'android.permission.BIND_ACCESSIBILITY_SERVICE', label: 'Auto-Scroll & Routine', granted: true },
                { name: 'android.permission.FOREGROUND_SERVICE_MICROPHONE', label: 'BG Listening', granted: true },
                { name: 'android.permission.ACCESS_FINE_LOCATION', label: 'Location & Weather', granted: true },
              ].map((perm) => (
                <div
                  key={perm.name}
                  className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-200 text-[11px]">{perm.label}</div>
                    <div className="text-[9px] font-mono text-slate-500">{perm.name}</div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Granted
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Android Background Foreground Service & WakeLock */}
          <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-indigo-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Android ForegroundService & WakeLock Status
              </h4>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-400/30">
                Service Active
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Maintains an Android <code className="text-indigo-200">ForegroundService</code> notification banner
              preventing the Android Doze mode CPU throttle. Continuous offline wake word detection ("Hey Aura") runs on native NPU hardware accelerators.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg transition-all"
          >
            Close Build Spec
          </button>
        </div>
      </div>
    </div>
  );
};
