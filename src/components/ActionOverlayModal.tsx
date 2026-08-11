import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  CheckCircle2,
  X,
  User,
  ShieldCheck,
} from 'lucide-react';
import { PhoneContact, SmsMessage } from '../types';

interface ActionOverlayModalProps {
  activeCallContact: PhoneContact | null;
  onEndCall: () => void;
  sentSms: SmsMessage | null;
  onCloseSms: () => void;
}

export const ActionOverlayModal: React.FC<ActionOverlayModalProps> = ({
  activeCallContact,
  onEndCall,
  sentSms,
  onCloseSms,
}) => {
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (activeCallContact) {
      setCallSeconds(0);
      interval = setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeCallContact]);

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Active Phone Call Overlay Modal */}
      {activeCallContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 text-center text-slate-100 shadow-2xl space-y-6">
            {/* Top Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> MobileAction Voice Dial
              </span>
              <span className="font-mono text-indigo-300">{formatCallTime(callSeconds)}</span>
            </div>

            {/* Contact Avatar & Pulsing Wave */}
            <div className="relative flex flex-col items-center">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-pulse"></div>
                <img
                  src={activeCallContact.avatarUrl}
                  alt={activeCallContact.name}
                  className="relative w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-xl"
                />
              </div>

              <h3 className="text-xl font-bold text-white mt-4">{activeCallContact.name}</h3>
              {activeCallContact.nameMl && (
                <p className="text-sm font-sans text-indigo-300">{activeCallContact.nameMl}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">{activeCallContact.phoneNumber}</p>
              <p className="text-xs text-emerald-400 font-semibold tracking-wide uppercase mt-2 animate-pulse">
                In-Call Voice Active
              </p>
            </div>

            {/* Conversation Voice Waveform Visualizer */}
            <div className="flex items-center justify-center space-x-1 h-6">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full animate-bounce"
                  style={{
                    height: `${Math.floor(Math.random() * 20) + 6}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>

            {/* Call Controls Bar */}
            <div className="flex items-center justify-center space-x-4 pt-2">
              <button
                id="call-mute-btn"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full border transition-all ${
                  isMuted
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
                title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                id="call-speaker-btn"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-3.5 rounded-full border transition-all ${
                  isSpeakerOn
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
                title={isSpeakerOn ? 'Speakerphone ON' : 'Speakerphone OFF'}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                id="call-end-btn"
                onClick={onEndCall}
                className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sent SMS Modal Popup */}
      {sentSms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl space-y-4">
            <button
              id="close-sms-btn"
              onClick={onCloseSms}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  SMS Message Sent Hands-Free
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                    Delivered
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Recipient: {sentSms.recipientName} ({sentSms.phoneNumber})</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-sm text-slate-200">
              <p className="italic">"{sentSms.body}"</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> MobileAction Carrier Dispatch
              </span>
              <span className="text-slate-500">{sentSms.timestamp}</span>
            </div>

            <button
              id="confirm-sms-btn"
              onClick={onCloseSms}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
};
