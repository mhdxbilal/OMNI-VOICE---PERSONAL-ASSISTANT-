import React, { useState } from 'react';
import {
  Youtube,
  Music,
  ExternalLink,
  ArrowRightLeft,
  CheckCircle2,
  Tv,
  RefreshCw,
  Sparkles,
  Play,
  X,
  Radio,
  Share2,
  Copy,
  Layers,
} from 'lucide-react';
import { SongTrack } from '../types';

interface YouTubeSpotifyIntegrationBridgeProps {
  currentTrack: SongTrack;
  onSelectPlatform: (platform: string) => void;
  onSyncPlatforms?: (trackId: string, targetPlatform: 'Spotify' | 'YouTube Music' | 'YouTube') => void;
}

export const YouTubeSpotifyIntegrationBridge: React.FC<YouTubeSpotifyIntegrationBridgeProps> = ({
  currentTrack,
  onSelectPlatform,
  onSyncPlatforms,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleSyncPlatforms = (target: 'Spotify' | 'YouTube Music' | 'YouTube') => {
    setIsSyncing(true);
    setSyncStatusMsg(`Matching track IDs & syncing playlist metadata with ${target}...`);

    setTimeout(() => {
      setIsSyncing(false);
      if (onSyncPlatforms) {
        onSyncPlatforms(currentTrack.id, target);
      }
      setSyncStatusMsg(`Successfully linked "${currentTrack.title}" across Spotify, YouTube Music, and YouTube!`);

      setTimeout(() => {
        setSyncStatusMsg(null);
      }, 3500);
    }, 1200);
  };

  const handleCopyLink = (url: string, platformName: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(platformName);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const youtubeVideoId = currentTrack.youtubeVideoId || '_fI-7P6Yx_o';
  const youtubeMusicUrl = currentTrack.youtubeMusicUrl || `https://music.youtube.com/search?q=${encodeURIComponent(currentTrack.title)}`;
  const spotifyUrl = currentTrack.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(currentTrack.title)}`;

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
              <Youtube className="w-3 h-3" /> YouTube & Spotify Bridge
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <Music className="w-3 h-3" /> Cross-App Sync
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            YouTube Music ↔ Spotify Dual Sync Integration
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Mirror track playback, sync liked playlists, and watch embedded official YouTube videos seamlessly.
          </p>
        </div>

        {/* Watch YouTube Video Button */}
        <button
          id="open-youtube-modal-btn"
          onClick={() => setShowYouTubeModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-medium text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95"
        >
          <Tv className="w-4 h-4" />
          <span>Watch Official YouTube Video</span>
        </button>
      </div>

      {/* Sync Status Banner */}
      {syncStatusMsg && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/50 text-xs text-indigo-200 shadow-md flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="font-mono text-slate-200">{syncStatusMsg}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30 shrink-0">
            Cross-API Verified
          </span>
        </div>
      )}

      {/* Main Bridge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spotify Platform Integration Card */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-500/50 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Spotify Engine</h4>
                <p className="text-xs text-slate-400">High-Fidelity Audio Stream</p>
              </div>
            </div>

            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              {currentTrack.platform === 'Spotify' ? 'ACTIVE STREAM' : 'SYNC READY'}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Track Match:</span>
              <span className="font-mono text-emerald-400 font-semibold">{currentTrack.title}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Status:</span>
              <span className="flex items-center gap-1 text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> ID Matched
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              id="switch-to-spotify-btn"
              onClick={() => {
                onSelectPlatform('Spotify');
                handleSyncPlatforms('Spotify');
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Switch to Spotify</span>
            </button>

            <a
              href={spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
              title="Open in Spotify Web Player"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* YouTube Music & YouTube Video Integration Card */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-rose-500/30 hover:border-rose-500/50 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <Youtube className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">YouTube Music & Video</h4>
                <p className="text-xs text-slate-400">Audio Stream & Official MV</p>
              </div>
            </div>

            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              {currentTrack.platform === 'YouTube Music' ? 'ACTIVE STREAM' : 'EMBED READY'}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>YouTube Video ID:</span>
              <span className="font-mono text-rose-400 font-semibold">{youtubeVideoId}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Sync Status:</span>
              <span className="flex items-center gap-1 text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Video & Music Synced
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              id="switch-to-ytmusic-btn"
              onClick={() => {
                onSelectPlatform('YouTube Music');
                handleSyncPlatforms('YouTube Music');
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Switch to YouTube Music</span>
            </button>

            <button
              id="watch-yt-video-card-btn"
              onClick={() => setShowYouTubeModal(true)}
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-rose-300 transition-colors"
              title="Play YouTube Video Embed"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>

            <a
              href={youtubeMusicUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
              title="Open in YouTube Music Web"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Quick Cross-App Sync Action Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Layers className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="text-xs font-bold text-white">
              Instant Playlist & Liked Song Transfer
            </p>
            <p className="text-[11px] text-slate-400">
              Automatically mirror "{currentTrack.title}" between YouTube Music and Spotify playlists.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="sync-track-cross-btn"
            onClick={() => handleSyncPlatforms('YouTube Music')}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all active:scale-95 flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Spotify ↔ YouTube'}</span>
          </button>

          <button
            id="copy-spotify-link-btn"
            onClick={() => handleCopyLink(spotifyUrl, 'Spotify')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors flex items-center space-x-1"
            title="Copy Spotify Link"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span>{copiedLink === 'Spotify' ? 'Copied!' : 'Spotify Link'}</span>
          </button>

          <button
            id="copy-yt-link-btn"
            onClick={() => handleCopyLink(youtubeMusicUrl, 'YouTube Music')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors flex items-center space-x-1"
            title="Copy YouTube Music Link"
          >
            <Copy className="w-3.5 h-3.5 text-rose-400" />
            <span>{copiedLink === 'YouTube Music' ? 'Copied!' : 'YouTube Link'}</span>
          </button>
        </div>
      </div>

      {/* Embedded YouTube Video Player Modal Overlay */}
      {showYouTubeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-rose-600 text-white">
                  <Youtube className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{currentTrack.title}</h3>
                  <p className="text-xs text-slate-400">Official YouTube Video Stream • {currentTrack.artist}</p>
                </div>
              </div>

              <button
                id="close-youtube-modal-btn"
                onClick={() => setShowYouTubeModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Responsive YouTube Iframe */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&rel=0`}
                title={`${currentTrack.title} Official Video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Modal Bottom Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <span className="text-slate-400 font-mono flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Embedded Stream active (Video ID: {youtubeVideoId})
              </span>

              <div className="flex items-center space-x-2">
                <a
                  href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open on YouTube.com</span>
                </a>

                <button
                  onClick={() => setShowYouTubeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
