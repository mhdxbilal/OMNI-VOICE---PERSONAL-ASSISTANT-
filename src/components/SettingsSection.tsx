import React, { useState, useEffect } from 'react';
import { Settings, User, Mic, Smartphone, Shield, Activity, Languages, Zap, MonitorSmartphone } from 'lucide-react';

export const SettingsSection: React.FC = () => {
  const [wakeWord, setWakeWord] = useState('Ok Jarvis');
  const [screenContext, setScreenContext] = useState(false);

  useEffect(() => {
    const savedWakeWord = localStorage.getItem('mbxtg_wake_word');
    if (savedWakeWord) setWakeWord(savedWakeWord);
    
    const savedScreenContext = localStorage.getItem('mbxtg_screen_context');
    if (savedScreenContext === 'true') setScreenContext(true);
  }, []);

  const handleWakeWordChange = (val: string) => {
    setWakeWord(val);
    localStorage.setItem('mbxtg_wake_word', val);
  };

  const handleScreenContextToggle = () => {
    const newVal = !screenContext;
    setScreenContext(newVal);
    localStorage.setItem('mbxtg_screen_context', newVal ? 'true' : 'false');
    if (newVal && window.AndroidNative && window.AndroidNative.openAccessibilitySettings) {
      window.AndroidNative.openAccessibilitySettings();
    }
  };

  const resetOnboarding = () => {
    localStorage.removeItem('mbxtg_setup_complete');
    window.location.reload();
  };

  const openAssistantSettings = () => {
    if (window.AndroidNative && window.AndroidNative.openAssistantSettings) {
      window.AndroidNative.openAssistantSettings();
    } else {
      alert("This feature is available in the native Android app.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Assistant Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Voice & Recognition */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Mic className="w-4 h-4 text-indigo-400" /> Voice & Recognition
            </h3>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
              
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-white">Wake Word (Quick Phrase)</label>
                <p className="text-[10px] text-slate-400">Modify the quick phrase used to wake up the assistant (e.g. "Hey Google", "Jarvis").</p>
                <input 
                  type="text" 
                  value={wakeWord} 
                  onChange={(e) => handleWakeWordChange(e.target.value)}
                  placeholder="e.g. Jarvis"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-700 flex flex-col space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Languages className="w-4 h-4 text-indigo-400" /> Primary Recognition Language
                </label>
                <select className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500">
                  <option>Bilingual (English + Malayalam)</option>
                  <option>English (India)</option>
                  <option>Malayalam (ml-IN)</option>
                  <option>English (US)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-700 flex flex-col space-y-2">
                <label className="text-sm font-medium text-white">Voice Match Retraining</label>
                <p className="text-xs text-slate-400">Recalibrate the assistant to better recognize your vocal patterns.</p>
                <button
                  onClick={resetOnboarding}
                  className="mt-2 w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs transition-colors border border-slate-600"
                >
                  Retrain Voice Match
                </button>
              </div>

            </div>
          </div>

          {/* Connected Integrations & OS Level */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" /> System Integration
            </h3>
            
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-400" /> Default Digital Assistant
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Set MBXTG as your default Android assistant to activate it by <strong>long-pressing the power button</strong>.
                  </p>
                  <button
                    onClick={openAssistantSettings}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-md"
                  >
                    Open Android Assistant Settings
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-700 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <MonitorSmartphone className="w-4 h-4 text-emerald-400" /> Screen Context
                    </label>
                    <button 
                      onClick={handleScreenContextToggle}
                      className={`w-10 h-5 rounded-full relative transition-colors ${screenContext ? 'bg-emerald-500' : 'bg-slate-600'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${screenContext ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Allow the assistant to see screen content (use screen and app data). Required to extract context from the currently open app on your screen.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">WhatsApp Native Bridge</h4>
                    <p className="text-[10px] text-slate-400">Status: Connected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Personalization & Privacy */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" /> Privacy & Local Data
            </h3>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h4 className="font-medium text-white text-sm">Local Activity Logs</h4>
                <p className="text-xs text-slate-400">Your voice transcripts are stored only on-device using AES-256.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs border border-slate-600">
                  Export Logs
                </button>
                <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium text-xs border border-rose-500/30">
                  Clear All Data
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
