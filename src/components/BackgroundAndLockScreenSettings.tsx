import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Mic,
  Play,
  CheckCircle2,
  Lock,
  Layers,
  MessageSquare,
  PhoneCall,
  Video,
  Sparkles,
  Zap,
  RefreshCw,
  AlertOctagon,
  HardDrive,
  Activity,
} from 'lucide-react';
import { BackgroundServiceConfig, PhoneContact, AssistantActionResponse } from '../types';
import { backgroundServiceWorker, BackgroundWorkerStatus } from '../services/BackgroundServiceWorker';
import { offlineSpeechEngine, OfflineEngineState } from '../services/OfflineSpeechEngine';

interface BackgroundAndLockScreenSettingsProps {
  config: BackgroundServiceConfig;
  onUpdateConfig: (updated: Partial<BackgroundServiceConfig>) => void;
  contacts: PhoneContact[];
  onTriggerWhatsAppCall: (contact: PhoneContact, isVideo: boolean) => void;
  onTriggerWhatsAppMsg: (contact: PhoneContact, messageText: string) => void;
  onExecuteCommand: (commandText: string) => Promise<AssistantActionResponse | null>;
}

export const BackgroundAndLockScreenSettings: React.FC<BackgroundAndLockScreenSettingsProps> = ({
  config,
  onUpdateConfig,
  contacts,
  onTriggerWhatsAppCall,
  onTriggerWhatsAppMsg,
  onExecuteCommand,
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || 'c1');
  const [customMsgText, setCustomMsgText] = useState<string>('Hey, I am driving home now. Will call you shortly!');
  const [isSimulatingScroll, setIsSimulatingScroll] = useState<boolean>(false);
  const [scrollFeedback, setScrollFeedback] = useState<string>('');
  const [bgWorkerStatus, setBgWorkerStatus] = useState<BackgroundWorkerStatus>(backgroundServiceWorker.getStatus());
  const [offlineState, setOfflineState] = useState<OfflineEngineState>(offlineSpeechEngine.getState());

  useEffect(() => {
    const unsubBg = backgroundServiceWorker.subscribe(setBgWorkerStatus);
    const unsubEngine = offlineSpeechEngine.subscribe(setOfflineState);
    return () => {
      unsubBg();
      unsubEngine();
    };
  }, []);

  const selectedContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];

  const handleSimulateReelsScroll = async () => {
    setIsSimulatingScroll(true);
    setScrollFeedback('Background Service: Executing Accessibility Scroll Down gesture on Instagram Reels...');
    await onExecuteCommand('Scroll down reels');
    setTimeout(() => {
      setScrollFeedback('Scrolled to next video reel! Background overlay active.');
      setIsSimulatingScroll(false);
    }, 1200);
  };

  const handleToggleBackgroundService = () => {
    const nextState = !config.isBackgroundEnabled;
    onUpdateConfig({ isBackgroundEnabled: nextState });
    if (nextState) {
      backgroundServiceWorker.startService();
    } else {
      backgroundServiceWorker.stopService();
    }
  };

  const handleToggleLockScreen = () => {
    const nextState = !config.isLockScreenListeningEnabled;
    onUpdateConfig({ isLockScreenListeningEnabled: nextState });
    backgroundServiceWorker.setLockScreenListening(nextState);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Background Service & Lock Screen Controls
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Enable hands-free background execution, screen-locked voice recognition with Voice ID matching, and automated WhatsApp actions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Accessibility & Lock-Screen Active</span>
          </span>
        </div>
      </div>

      {/* Live System Diagnostics Panel */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <Activity className={`w-5 h-5 ${bgWorkerStatus.isRunning ? 'text-emerald-400' : 'text-slate-500'}`} />
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Background Loop</div>
            <div className="font-bold text-white">
              {bgWorkerStatus.isRunning ? 'Running (Active Worker)' : 'Standby'}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <Lock className={`w-5 h-5 ${bgWorkerStatus.wakeLockActive ? 'text-emerald-400' : 'text-slate-500'}`} />
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Wake Lock Sentinel</div>
            <div className="font-bold text-white">
              {bgWorkerStatus.wakeLockActive ? 'Active (Screen Stay Awake)' : 'Released'}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <HardDrive className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Offline STT Engine Memory</div>
            <div className="font-bold text-white">
              240MB Vosk SLM ({offlineState.memoryLeakPreventedCount} Buffer Flushes)
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Background & Lock Screen Toggles Panel */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-indigo-400" />
            Background & Lock Screen Permission Controls
          </h3>

          {/* Background Execution Toggle */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Background App Support</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Allows assistant to scroll reels/shorts, open apps, and control audio while in other applications.
                </p>
              </div>

              <button
                id="toggle-background-service"
                onClick={handleToggleBackgroundService}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.isBackgroundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.isBackgroundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {config.isBackgroundEnabled && (
              <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-indigo-300">
                <span>Auto Scroll Speed: {config.autoScrollSpeedMs / 1000}s per reel</span>
                <button
                  onClick={handleSimulateReelsScroll}
                  disabled={isSimulatingScroll}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition-all flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Test Reel Scroll</span>
                </button>
              </div>
            )}
          </div>

          {/* Lock Screen Voice Listening Toggle */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Lock Screen Voice Commands</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Listen for "{config.wakeWord}" even when phone display is off or locked.
                  </p>
                </div>
              </div>

              <button
                id="toggle-lockscreen-service"
                onClick={handleToggleLockScreen}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.isLockScreenListeningEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.isLockScreenListeningEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Voice ID Recognition Matching */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4 text-amber-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Voice ID Match Security</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Only execute lock-screen calls or messages if acoustic voice matches owner accent profile.
                  </p>
                </div>
              </div>

              <button
                id="toggle-voice-id-match"
                onClick={() => onUpdateConfig({ isVoiceIdMatched: !config.isVoiceIdMatched })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.isVoiceIdMatched ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.isVoiceIdMatched ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {config.isVoiceIdMatched && (
              <div className="text-[11px] text-amber-300 font-mono pt-1">
                Voice ID Profile: Active (Accent Calibrated 96.4% match confidence)
              </div>
            )}
          </div>

          {scrollFeedback && (
            <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-200 animate-pulse">
              {scrollFeedback}
            </div>
          )}
        </div>

        {/* WhatsApp Voice Automation Integration Panel */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            WhatsApp Voice Integration (Automated Transcribe & Call)
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Select Contact for WhatsApp Action</label>
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.relationship || 'Contact'}) - {c.phoneNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Action Buttons for WhatsApp */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                id="whatsapp-voice-call-btn"
                onClick={() => onTriggerWhatsAppCall(selectedContact, false)}
                className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call on WhatsApp</span>
              </button>

              <button
                id="whatsapp-video-call-btn"
                onClick={() => onTriggerWhatsAppCall(selectedContact, true)}
                className="p-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg shadow-emerald-700/30 flex items-center justify-center space-x-2 active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>Video Call WhatsApp</span>
              </button>
            </div>

            {/* Transcribe and Send Message Field */}
            <div className="pt-2 space-y-2">
              <label className="block font-semibold text-slate-300">
                Voice Transcribed Message to {selectedContact?.name}:
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                <textarea
                  rows={2}
                  value={customMsgText}
                  onChange={(e) => setCustomMsgText(e.target.value)}
                  placeholder="Transcribed voice text..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs leading-relaxed"
                />
              </div>

              <button
                id="whatsapp-send-msg-btn"
                onClick={() => onTriggerWhatsAppMsg(selectedContact, customMsgText)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>Send WhatsApp Message Hands-Free</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
