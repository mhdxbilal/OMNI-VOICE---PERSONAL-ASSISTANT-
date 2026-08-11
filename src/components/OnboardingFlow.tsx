import React, { useState } from 'react';
import { Mic, ShieldCheck, User, CheckCircle2, ChevronRight, Activity, Smartphone } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [voiceProgress, setVoiceProgress] = useState(0);

  const handleStartVoiceMatch = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setVoiceProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setStep(3), 800);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 p-8 shadow-2xl space-y-6 text-white animate-fade-in relative overflow-hidden">
        {/* Step 1: Welcome & Profile */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                <Mic className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Welcome to MBXTG
              </h2>
              <p className="text-slate-400 text-sm">
                Your on-device, highly private digital assistant. Let's set up your profile and voice match to personalize your experience.
              </p>
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-4">
                <User className="w-6 h-6 text-indigo-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Personalized Experience</h4>
                  <p className="text-xs text-slate-400">MBXTG adapts to your routines and accent.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">On-Device Privacy</h4>
                  <p className="text-xs text-slate-400">Audio processing happens locally. No cloud uploads.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              Get Started <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Voice Match */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in text-center">
            <h2 className="text-xl font-bold">Voice Match Setup</h2>
            <p className="text-sm text-slate-400">
              Train MBXTG to recognize your unique voice pattern. This allows the assistant to distinguish you from others.
            </p>

            <div className="py-8 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${voiceProgress > 0 ? 'bg-indigo-600 shadow-[0_0_40px_rgba(79,70,229,0.5)]' : 'bg-slate-800 border-2 border-slate-700'}`}>
                  <Mic className={`w-8 h-8 ${voiceProgress > 0 ? 'text-white animate-pulse' : 'text-slate-400'}`} />
                </div>
                {/* SVG Progress Ring */}
                <svg className="absolute top-0 left-0 w-24 h-24 -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="46"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="4"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="46"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="4"
                    strokeDasharray="289"
                    strokeDashoffset={289 - (289 * voiceProgress) / 100}
                    className="transition-all duration-500"
                  />
                </svg>
              </div>

              <div className="space-y-1">
                <p className="font-medium text-indigo-300">
                  {voiceProgress === 0 ? "Ready to listen" : voiceProgress < 100 ? "Listening and analyzing..." : "Voice Match Complete!"}
                </p>
                <p className="text-xs text-slate-500">
                  Please say: "Ok Jarvis, start my morning routine."
                </p>
              </div>
            </div>

            <button
              onClick={handleStartVoiceMatch}
              disabled={voiceProgress > 0}
              className={`w-full py-3.5 rounded-xl font-bold transition-all ${voiceProgress > 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'}`}
            >
              {voiceProgress === 0 ? 'Start Recording' : `${voiceProgress}% Analyzing`}
            </button>
          </div>
        )}

        {/* Step 3: Permissions & Integration Sync */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold">Setup Complete!</h2>
              <p className="text-sm text-slate-400">
                Your acoustic profile is saved. Lastly, let's configure your app integrations for the ultimate hands-free experience.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="font-semibold text-sm">System Contacts</h4>
                    <p className="text-xs text-slate-400">Required for WhatsApp & SMS</p>
                  </div>
                </div>
                <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-rose-400" />
                  <div>
                    <h4 className="font-semibold text-sm">Spotify Integration</h4>
                    <p className="text-xs text-slate-400">Required for music control</p>
                  </div>
                </div>
                <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </label>
            </div>

            <button
              onClick={onComplete}
              className="w-full py-3.5 mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md"
            >
              Enter Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
