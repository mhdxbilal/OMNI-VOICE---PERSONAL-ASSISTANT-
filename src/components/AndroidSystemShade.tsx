import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Mic,
  MicOff,
  Sliders,
  ChevronUp,
  Battery,
  ShieldCheck,
  Smartphone,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { SongTrack } from '../types';

interface AndroidSystemShadeProps {
  isOpen: boolean;
  onClose: () => void;
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
  onOpenManifest: () => void;
}

export const AndroidSystemShade: React.FC<AndroidSystemShadeProps> = ({
  isOpen,
  onClose,
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
  onOpenManifest, }) => {
  const [dndActive, setDndActive] = useState(false);
  const [flashlightActive, setFlashlightActive] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [spatialAudio, setSpatialAudio] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 max-w-7xl mx-auto px-2 sm:px-4 animate-in slide-in-from-top duration-300">
      <div className="bg-slate-900/95 backdrop-blur-2xl border-b border-x border-slate-700/80 rounded-b-3xl shadow-2xl p-4 sm:p-6 text-slate-100 space-y-5">
        {/* Top Handle / Close Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs sm:text-sm text-slate-200">
              Android 15 Quick Settings & Media Controls
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Pixel 9 Pro
            </span>
          </div>

          <button
            onClick={onOpenManifest}
            className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium border border-slate-700 flex items-center gap-1 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>APK Manifest & Permissions</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Close Shade"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Settings Tiles Grid (Material Design 3 style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Internet / Cloud-Offline Tile */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
              isOffline
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider opacity-75">
                Internet Engine
              </div>
              <div className="text-xs font-bold mt-0.5">
                {isOffline ? 'Offline SLM 270M' : 'Cloud Hybrid'}
              </div>
            </div>
            {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
          </button>

          {/* Bluetooth Device Tile */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider opacity-75">
                Bluetooth Output
              </div>
              <div className="text-xs font-bold truncate max-w-[100px] mt-0.5">
                {activeDeviceName}
              </div>
            </div>
            <Bluetooth className="w-5 h-5" />
          </div>

          {/* Do Not Disturb Tile */}
          <button
            onClick={() => setDndActive(!dndActive)}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
              dndActive
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider opacity-75">
                Do Not Disturb
              </div>
              <div className="text-xs font-bold mt-0.5">{dndActive ? 'ON' : 'OFF'}</div>
            </div>
            <Moon className="w-5 h-5" />
          </button>

          {/* Spatial Audio Tile */}
          <button
            onClick={() => setSpatialAudio(!spatialAudio)}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
              spatialAudio
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider opacity-75">
                Spatial Audio 15
              </div>
              <div className="text-xs font-bold mt-0.5">{spatialAudio ? 'Enabled' : 'Off'}</div>
            </div>
            <Radio className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Slider Card */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center space-x-3">
          <VolumeX className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <Volume2 className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono font-bold w-10 text-right text-indigo-300">
            {volume}%
          </span>
        </div>

        {/* Android MediaSession Notification Banner */}
        <div className="bg-gradient-to-r from-indigo-950/80 to-purple-950/80 p-4 rounded-3xl border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-2xl object-cover shadow-md border border-white/10"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-400/30">
                MediaSession • {currentTrack.platform}
              </span>
              <h4 className="font-bold text-sm text-white leading-tight mt-1 truncate max-w-[220px]">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-slate-300 truncate max-w-[200px]">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onPrevTrack}
              className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={onTogglePlay}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={onNextTrack}
              className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Grab Bar */}
        <div className="flex justify-center pt-1">
          <button
            onClick={onClose}
            className="w-16 h-1.5 rounded-full bg-slate-700 hover:bg-slate-500 transition-colors"
            title="Pull up shade"
          />
        </div>
      </div>
    </div>
  );
};
