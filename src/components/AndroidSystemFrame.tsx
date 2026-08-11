import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Battery,
  BatteryCharging,
  Mic,
  Smartphone,
  ChevronDown,
  ShieldCheck,
  Maximize2,
  Minimize2,
  RotateCcw,
  Home,
  ArrowLeft,
  Square,
  Sparkles,
  HelpCircle,
  Volume2,
} from 'lucide-react';
import { LanguageMode, SongTrack } from '../types';
import { AndroidSystemShade } from './AndroidSystemShade';
import { AndroidManifestModal } from './AndroidManifestModal';

interface AndroidSystemFrameProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  activeDeviceName: string;
  volume: number;
  setVolume: (v: number) => void;
  currentTrack: SongTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onTriggerFloatingOrb: () => void;
}

export const AndroidSystemFrame: React.FC<AndroidSystemFrameProps> = ({
  children,
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  isOffline,
  setIsOffline,
  activeDeviceName,
  volume,
  setVolume,
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onTriggerFloatingOrb,
}) => {
  const [timeString, setTimeString] = useState<string>('');
  const [isShadeOpen, setIsShadeOpen] = useState<boolean>(false);
  const [isManifestOpen, setIsManifestOpen] = useState<boolean>(false);
  const [navMode, setNavMode] = useState<'gesture' | 'buttons'>('gesture');
  const [batteryLevel, setBatteryLevel] = useState<number>(88);
  const [isCharging] = useState<boolean>(true);
  const [isFloatingBubbleActive, setIsFloatingBubbleActive] = useState<boolean>(true);

  // Live time updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Android 15 Status Bar (System Bar) */}
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-2 text-xs select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Clock & Punch-Hole Camera / Notification Badges */}
          <div className="flex items-center space-x-3">
            <span className="font-mono font-bold text-white tracking-wide text-xs">
              {timeString || '12:45'}
            </span>
            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-slate-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System Microphone Active" />
              <span className="text-emerald-400 font-medium">Mic Active</span>
              <span className="text-slate-600">•</span>
              <span className="text-indigo-400 font-mono text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                com.mobileaction.omnivoise
              </span>
            </div>
          </div>

          {/* Center: Quick System Shade Pull-Down Trigger */}
          <button
            onClick={() => setIsShadeOpen(!isShadeOpen)}
            className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all active:scale-95 shadow-inner"
            title="Pull down Android 15 Quick Settings & Media Controls"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-200">Android 15 System Shade</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Right: Network, Bluetooth, Battery Status */}
          <div className="flex items-center space-x-3 text-slate-300 text-xs">
            <button
              onClick={() => setIsOffline(!isOffline)}
              className="flex items-center space-x-1 hover:text-white transition-colors"
              title={isOffline ? 'Using On-Device SLM (Offline)' : 'Cloud Hybrid Engine'}
            >
              {isOffline ? (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="font-mono text-[10px] hidden md:inline">
                {isOffline ? 'OFFLINE SLM' : '5G'}
              </span>
            </button>

            <div className="flex items-center space-x-1" title={`Bluetooth: ${activeDeviceName}`}>
              <Bluetooth className="w-3.5 h-3.5 text-indigo-400" />
            </div>

            <div className="flex items-center space-x-1" title="Battery Status">
              <span className="font-mono text-[11px] font-semibold text-slate-200">{batteryLevel}%</span>
              {isCharging ? (
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
              ) : (
                <Battery className="w-4 h-4 text-slate-300" />
              )}
            </div>

            <button
              onClick={() => setIsManifestOpen(true)}
              className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] hover:bg-emerald-500/20 transition-colors"
              title="View Native Android APK Build & Permissions Spec"
            >
              APK SPEC
            </button>
          </div>
        </div>
      </div>

      {/* Android Quick Settings Pull-Down Shade Modal */}
      <AndroidSystemShade
        isOpen={isShadeOpen}
        onClose={() => setIsShadeOpen(false)}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        activeDeviceName={activeDeviceName}
        volume={volume}
        setVolume={setVolume}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        onNextTrack={onNextTrack}
        onPrevTrack={onPrevTrack}
        onOpenManifest={() => {
          setIsShadeOpen(false);
          setIsManifestOpen(true);
        }}
      />

      {/* Android Build Specification & Permissions Modal */}
      <AndroidManifestModal
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
        isOffline={isOffline}
        activeDeviceName={activeDeviceName}
      />

      {/* Main Content View Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 pb-24">
        {children}
      </div>

      {/* Android System Alert Window (Floating Chat Head / Assistant Overlay Bubble) */}
      {isFloatingBubbleActive && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 animate-bounce hover:animate-none">
          <button
            onClick={onTriggerFloatingOrb}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl ring-4 ring-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
            title="Trigger Android Native Voice Assistant Overlay (System Alert Window)"
          >
            <Mic className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-bold text-slate-950 items-center justify-center">
                AI
              </span>
            </span>
          </button>
        </div>
      )}

      {/* Bottom Android Material Design 3 Navigation System Bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 py-2 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {navMode === 'gesture' ? (
            /* Android Gesture Navigation Bar Handle */
            <div className="w-full flex justify-center py-1.5">
              <button
                onClick={() => setActiveTab('assistant')}
                className="w-36 h-1.5 rounded-full bg-slate-500 hover:bg-slate-300 transition-colors cursor-pointer"
                title="Swipe up for Home / Tap for Voice Assistant"
              />
            </div>
          ) : (
            /* Android 3-Button Navigation (Back, Home, Recents) */
            <div className="w-full flex items-center justify-around py-1">
              <button
                onClick={() => setActiveTab('assistant')}
                className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-90"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveTab('assistant')}
                className="p-2.5 rounded-full text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 transition-all active:scale-90"
                title="Home"
              >
                <Home className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsShadeOpen(true)}
                className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-90"
                title="Quick Settings / Recents"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Small Navigation Mode Toggle (Gesture vs 3-Button) */}
        <div className="flex justify-center text-[10px] text-slate-500 mt-1 space-x-2 font-mono">
          <button
            onClick={() => setNavMode(navMode === 'gesture' ? 'buttons' : 'gesture')}
            className="hover:text-slate-300 transition-colors"
          >
            Nav: {navMode === 'gesture' ? 'Gesture Pill' : '3-Button Bar'} (Click to switch)
          </button>
        </div>
      </div>
    </div>
  );
};
