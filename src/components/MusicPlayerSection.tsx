import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Music,
  Radio,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SongTrack } from '../types';
import { YouTubeSpotifyIntegrationBridge } from './YouTubeSpotifyIntegrationBridge';

interface MusicPlayerSectionProps {
  songs: SongTrack[];
  currentTrack: SongTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSkipSeconds: (seconds: number) => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  onSelectTrack: (track: SongTrack) => void;
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
  isOffline: boolean;
}

export const MusicPlayerSection: React.FC<MusicPlayerSectionProps> = ({
  songs,
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSkipSeconds,
  volume,
  onChangeVolume,
  onSelectTrack,
  selectedPlatform,
  onSelectPlatform,
  isOffline,
}) => {
  const [currentTime, setCurrentTime] = useState(42);
  const platforms = ['All', 'Spotify', 'YouTube Music', 'Apple Music', 'Wynk Music', 'Amazon Music', 'Offline Local'];

  // Simulate timeline ticking when playing
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((t) => (t >= currentTrack.duration ? 0 : t + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const filteredSongs = songs.filter((s) => {
    if (selectedPlatform === 'All') return true;
    return s.platform === selectedPlatform;
  });

  const getPlatformBadgeColor = (p: string) => {
    switch (p) {
      case 'Spotify':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'YouTube Music':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Apple Music':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      case 'Wynk Music':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Offline Local':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Media Player Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          {/* Album Cover Art */}
          <div className="relative group flex-shrink-0">
            <div className="absolute -inset-2 rounded-3xl bg-indigo-500/20 blur-xl group-hover:bg-indigo-500/30 transition-all"></div>
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover shadow-2xl border border-slate-700/80 transition-transform ${
                isPlaying ? 'scale-100 shadow-indigo-500/20' : 'scale-95 opacity-90'
              }`}
            />
            {/* Spinning Vinyl Effect when Playing */}
            {isPlaying && (
              <div className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-slate-700">
                <Radio className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>

          {/* Song Details & Controls */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold border flex items-center gap-1.5 ${getPlatformBadgeColor(
                  currentTrack.platform
                )}`}
              >
                <Music className="w-3.5 h-3.5" />
                {currentTrack.platform}
              </span>

              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  {currentTrack.language}
                </span>
                {isOffline && (
                  <span className="flex items-center gap-1 text-amber-300 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Offline Cache
                  </span>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {currentTrack.title}
              </h2>
              <p className="text-sm sm:text-base text-indigo-300 font-medium mt-1">
                {currentTrack.artist} • <span className="text-slate-400">{currentTrack.album}</span>
              </p>
            </div>

            {/* Audio Waveform Spectrum Bar */}
            {isPlaying && (
              <div className="flex items-center space-x-1 h-6 pt-1">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.floor(Math.random() * 20) + 4}px`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  ></div>
                ))}
              </div>
            )}

            {/* Timeline Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={currentTrack.duration}
                value={currentTime}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
            </div>

            {/* Main Playback Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Previous Track */}
                <button
                  id="music-prev-btn"
                  onClick={onPrevTrack}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
                  title="Previous Track"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* Skip 15s Back */}
                <button
                  id="music-skip-back-btn"
                  onClick={() => {
                    setCurrentTime((t) => Math.max(0, t - 15));
                    onSkipSeconds(-15);
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 flex items-center space-x-1 text-xs"
                  title="Skip -15 Seconds"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="font-mono text-[10px]">15s</span>
                </button>

                {/* Main Play / Pause Button */}
                <button
                  id="music-toggle-play-btn"
                  onClick={onTogglePlay}
                  className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>

                {/* Skip 15s Forward */}
                <button
                  id="music-skip-fwd-btn"
                  onClick={() => {
                    setCurrentTime((t) => Math.min(currentTrack.duration, t + 15));
                    onSkipSeconds(15);
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 flex items-center space-x-1 text-xs"
                  title="Skip +15 Seconds"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="font-mono text-[10px]">15s</span>
                </button>

                {/* Next Track */}
                <button
                  id="music-next-btn"
                  onClick={onNextTrack}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
                  title="Next Track"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Volume Slider Control */}
              <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/80">
                <button
                  id="music-volume-mute-btn"
                  onClick={() => onChangeVolume(volume > 0 ? 0 : 70)}
                  className="text-slate-400 hover:text-white"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => onChangeVolume(Number(e.target.value))}
                  className="w-20 sm:w-28 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-xs font-mono text-slate-300 w-8 text-right">{volume}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Music & Spotify Integration Bridge */}
      <YouTubeSpotifyIntegrationBridge
        currentTrack={currentTrack}
        onSelectPlatform={onSelectPlatform}
      />

      {/* Streaming Platform Integrator & Song Queue */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Multi-Streaming Platform Music Library
              <Zap className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Hands-free voice music routing across Spotify, YouTube Music, Apple Music, Wynk & Offline Storage.
            </p>
          </div>

          {/* Platform Filter Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {platforms.map((p) => (
              <button
                key={p}
                id={`platform-filter-${p.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => onSelectPlatform(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedPlatform === p
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Songs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {filteredSongs.map((track) => {
            const isSelected = track.id === currentTrack.id;
            return (
              <div
                key={track.id}
                id={`song-card-${track.id}`}
                onClick={() => onSelectTrack(track)}
                className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500/60 shadow-lg'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-700"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs flex-shrink-0 pl-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-medium text-[10px] border ${getPlatformBadgeColor(
                      track.platform
                    )}`}
                  >
                    {track.platform}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTrack(track);
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      isSelected && isPlaying
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isSelected && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
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
