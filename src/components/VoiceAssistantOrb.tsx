import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Send,
  Zap,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Calendar,
  Music,
  Sliders,
  Radio,
  Cpu,
  ArrowRight,
  Brain,
  Layers,
  ListChecks,
  ShieldAlert,
} from 'lucide-react';
import { LanguageMode, AssistantActionResponse } from '../types';
import { SAMPLE_COMMANDS } from '../data/initialData';
import { startSpeechListening, stopSpeechListening, speakText, stopSpeaking, isSpeechRecognitionSupported } from '../utils/speech';

interface VoiceAssistantOrbProps {
  language: LanguageMode;
  isOffline: boolean;
  onExecuteCommand: (commandText: string) => Promise<AssistantActionResponse | null>;
  lastResponse: AssistantActionResponse | null;
  isProcessing: boolean;
  scratchpadContext?: Array<{ role: string; content: string; contactName?: string; time?: string }>;
  userPreferences?: { favoriteContact?: string; primaryMusicApp?: string; preferredDevice?: string };
}

export const VoiceAssistantOrb: React.FC<VoiceAssistantOrbProps> = ({
  language,
  isOffline,
  onExecuteCommand,
  lastResponse,
  isProcessing,
  scratchpadContext = [
    { role: 'user', content: 'Call Amma', contactName: 'Amma' },
    { role: 'assistant', content: 'Calling Amma now.' },
  ],
  userPreferences = {
    favoriteContact: 'Amma',
    primaryMusicApp: 'Spotify',
    preferredDevice: 'AirPods Pro',
  },
}) => {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeakingResponse, setIsSpeakingResponse] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  // Toggle voice listening via Web Speech API with immediate barge-in interruption
  const handleToggleListening = () => {
    // Immediate barge-in: stop any active assistant speech
    stopSpeaking();
    setIsSpeakingResponse(false);

    if (isListening) {
      stopSpeechListening();
      setIsListening(false);
      if (interimText.trim()) {
        handleSubmitText(interimText.trim());
      }
    } else {
      setSpeechError(null);
      setInterimText('');
      const langCode = language === 'ml' ? 'ml-IN' : 'en-IN';

      const success = startSpeechListening({
        language: langCode,
        onResult: (text, isFinal) => {
          setInterimText(text);
          if (isFinal && text.trim()) {
            stopSpeechListening();
            setIsListening(false);
            handleSubmitText(text.trim());
          }
        },
        onError: (err) => {
          setSpeechError(err);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });

      if (success) {
        setIsListening(true);
      }
    }
  };

  const handleSubmitText = async (cmdToRun?: string) => {
    const textToSubmit = cmdToRun || inputText;
    if (!textToSubmit.trim() || isProcessing) return;

    // Immediate barge-in interruption
    stopSpeaking();
    setIsSpeakingResponse(false);

    setInputText('');
    setInterimText('');
    const res = await onExecuteCommand(textToSubmit.trim());

    if (res) {
      // Speak response verbally using Web Speech Synthesis
      const spokenMsg = (language === 'ml' && res.responseMl ? res.responseMl : res.responseEn).replace(/\*\*/g, '');
      setIsSpeakingResponse(true);
      speakText(
        spokenMsg,
        language === 'ml' ? 'ml' : 'en',
        () => setIsSpeakingResponse(true),
        () => setIsSpeakingResponse(false)
      );
    }
  };

  const handleSpeakLastResponse = () => {
    if (!lastResponse) return;
    const spokenMsg = (language === 'ml' && lastResponse.responseMl ? lastResponse.responseMl : lastResponse.responseEn).replace(/\*\*/g, '');
    setIsSpeakingResponse(true);
    speakText(
      spokenMsg,
      language === 'ml' ? 'ml' : 'en',
      () => setIsSpeakingResponse(true),
      () => setIsSpeakingResponse(false)
    );
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'CALL':
        return <PhoneCall className="w-5 h-5 text-emerald-400" />;
      case 'SMS':
        return <MessageSquare className="w-5 h-5 text-sky-400" />;
      case 'CALENDAR':
        return <Calendar className="w-5 h-5 text-amber-400" />;
      case 'MUSIC_PLAY':
      case 'MUSIC_CONTROL':
        return <Music className="w-5 h-5 text-purple-400" />;
      case 'VOLUME':
      case 'DEVICE':
        return <Sliders className="w-5 h-5 text-pink-400" />;
      default:
        return <Radio className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Central Voice Orb & Main Listening Stage */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
          {/* Header Status Tag */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs text-slate-300 shadow-inner">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-indigo-300">MobileAction 270M Core</span>
            <span className="text-slate-600">•</span>
            <span>{isOffline ? 'Offline SLM Mode' : 'Cloud Hybrid Gemini'}</span>
          </div>

          {/* Glowing Animated Voice Orb Button */}
          <div className="relative flex items-center justify-center my-2">
            {/* Outer Ripple Rings when listening */}
            {isListening && (
              <>
                <div className="absolute w-44 h-44 rounded-full bg-indigo-500/20 animate-ping"></div>
                <div className="absolute w-36 h-36 rounded-full bg-purple-500/30 animate-pulse"></div>
              </>
            )}

            <button
              id="voice-orb-btn"
              onClick={handleToggleListening}
              className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all transform active:scale-95 ${
                isListening
                  ? 'bg-gradient-to-br from-rose-500 via-purple-600 to-indigo-600 shadow-rose-500/40 ring-4 ring-rose-400/50 scale-105'
                  : isProcessing
                  ? 'bg-gradient-to-br from-amber-500 via-indigo-600 to-purple-600 animate-spin'
                  : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 hover:shadow-indigo-500/40 hover:scale-105 ring-4 ring-indigo-500/20'
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 text-white animate-bounce" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
              <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest mt-1">
                {isListening ? 'Listening...' : isProcessing ? 'Processing' : 'Tap to Speak'}
              </span>
            </button>
          </div>

          {/* Sound Wave Equalizer Bars when listening */}
          {isListening && (
            <div className="flex items-center justify-center space-x-1.5 h-8">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-indigo-500 to-pink-400 rounded-full animate-pulse"
                  style={{
                    height: `${Math.floor(Math.random() * 24) + 8}px`,
                    animationDelay: `${i * 0.08}s`,
                    animationDuration: '0.6s',
                  }}
                ></div>
              ))}
            </div>
          )}

          {/* Real-time Voice Live Transcript Display */}
          <div className="w-full">
            {interimText ? (
              <p className="text-base sm:text-lg font-medium text-indigo-200 bg-indigo-950/40 border border-indigo-500/30 px-4 py-3 rounded-2xl animate-pulse">
                "{interimText}"
              </p>
            ) : isListening ? (
              <p className="text-sm text-slate-400">
                Speak now in {language === 'ml' ? 'Malayalam' : 'English'} (e.g. "Amma kee call cheyyu" or "Play Malare on Spotify")...
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Tap microphone or type a command below to automate call, message, music, or calendar tasks.
              </p>
            )}

            {speechError && (
              <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-lg mt-2">
                {speechError} (You can also type your command directly into the input field below).
              </p>
            )}
          </div>

          {/* Manual Text Command Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitText();
            }}
            className="w-full flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-1.5 pl-4 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500"
          >
            <input
              type="text"
              id="voice-command-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask assistant or type command (e.g. 'Call Amma', 'നാളെ 3 PM ന് മീറ്റിംഗ് വെക്കൂ')..."
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-md transition-all"
            >
              <span>Process</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Bilingual Voice Command Shortcut Chips */}
          <div className="w-full space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick Bilingual Command Chips
              </span>
              <span className="text-[11px] text-slate-500">Tap to execute instantly</span>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {SAMPLE_COMMANDS.map((sample, idx) => (
                <button
                  key={idx}
                  id={`chip-cmd-${idx}`}
                  onClick={() => handleSubmitText(sample.command)}
                  disabled={isProcessing}
                  className="group flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-indigo-500/50 text-slate-300 hover:text-white text-xs transition-all text-left shadow-sm"
                >
                  <Zap className="w-3 h-3 text-indigo-400 group-hover:text-indigo-300" />
                  <span className="font-medium">
                    {language === 'ml' ? sample.labelMl : sample.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {/* Short-Term Scratchpad & Long-Term Episodic Memory Context Bar */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-left">
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                <span>Short-Term Scratchpad</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                Active Context: <strong className="text-white">Amma</strong> • Pronouns: <span className="text-emerald-300">"her" ➔ Amma</span>
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Long-Term Episodic Memory</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                Fav Contact: <strong className="text-emerald-300">{userPreferences.favoriteContact}</strong> • Music: <strong className="text-purple-300">{userPreferences.primaryMusicApp}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Processed MobileAction 270M Executed Result Card */}
      {lastResponse && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/80">
                {getActionIcon(lastResponse.actionType)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    {lastResponse.actionType}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> {(lastResponse.confidenceScore * 100).toFixed(0)}% Confidence
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  {lastResponse.intentSummary.replace(/\*\*/g, '')}
                </h3>
              </div>
            </div>

            {/* Repeat Audio Voice Button */}
            <button
              id="repeat-voice-btn"
              onClick={handleSpeakLastResponse}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isSpeakingResponse
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeakingResponse ? 'Speaking...' : 'Listen Voice'}</span>
            </button>
          </div>

          {/* High-Stakes Financial / Destructive Confirmation Card if required */}
          {lastResponse.requiresConfirmation && (
            <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs space-y-2 flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-amber-300">Explicit User Confirmation Required</p>
                <p className="text-amber-200/90 text-[11px] mt-0.5">
                  This action involves high-stakes or destructive operations. Please confirm before proceeding.
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => setActionStatus('Confirmed')}
                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[11px]"
                  >
                    Confirm & Execute
                  </button>
                  <button
                    onClick={() => setActionStatus('Cancelled')}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chained Proactive Multi-Step Workflows */}
          {lastResponse.chainedSteps && lastResponse.chainedSteps.length > 0 && (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-300">
                <ListChecks className="w-4 h-4 text-emerald-400" />
                <span>Autonomously Chained Agentic Steps ({lastResponse.chainedSteps.length})</span>
              </div>
              <ul className="space-y-1 pl-2 text-xs text-slate-300">
                {lastResponse.chainedSteps.map((step, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span className="font-medium">{step.replace(/\*\*/g, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bilingual Responses Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-medium text-slate-300">English Voice Output</span>
                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">en-IN</span>
              </div>
              <p className="text-sm text-indigo-100 font-medium">
                "{lastResponse.responseEn}"
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-medium text-slate-300">Malayalam Spoken Output (മലയാളം)</span>
                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">ml-IN</span>
              </div>
              <p className="text-sm text-emerald-100 font-medium font-sans">
                "{lastResponse.responseMl}"
              </p>
            </div>
          </div>

          {/* Execution Engine Footnote */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Engine: <strong className="text-slate-200">{lastResponse.engine}</strong>
            </span>
            {lastResponse.encryptedDataHash && (
              <span className="font-mono text-[11px] text-slate-500">
                Encrypted Vault Hash: {lastResponse.encryptedDataHash}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
