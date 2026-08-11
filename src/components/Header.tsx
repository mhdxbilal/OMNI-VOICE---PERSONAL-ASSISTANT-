import React from 'react';
import {
  Mic,
  ShieldCheck,
  Globe,
  Wifi,
  WifiOff,
  Headphones,
  SlidersHorizontal,
  DownloadCloud,
  Calendar,
  Music,
  Smartphone,
  ListOrdered,
  Cpu,
} from 'lucide-react';
import { LanguageMode } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  activeDeviceName: string;
  activeVolume: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  isOffline,
  setIsOffline,
  activeDeviceName,
  activeVolume,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Model Branding */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-slate-950 p-0.5 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20">
            <img src="/app-icon.svg" alt="MobileAction App Icon" className="w-full h-full rounded-lg object-cover" referrerPolicy="no-referrer" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Aura AI <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-mono">MobileAction 270M</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Bilingual Voice Assistant</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> AES-256 Secured
              </span>
            </p>
          </div>
        </div>

        {/* Right Status Controls: Offline Toggle, Language Switcher, Active Device */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Active Device Quick Badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <Headphones className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium text-slate-200">{activeDeviceName}</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-indigo-300">{activeVolume}%</span>
          </div>

          {/* Language Mode Selector */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700/80 text-xs">
            <Globe className="w-3.5 h-3.5 ml-1.5 mr-1 text-slate-400" />
            <button
              id="lang-btn-en"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                language === 'en'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              id="lang-btn-ml"
              onClick={() => setLanguage('ml')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                language === 'ml'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              മലയാളം
            </button>
            <button
              id="lang-btn-bilingual"
              onClick={() => setLanguage('bilingual')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                language === 'bilingual'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bilingual
            </button>
          </div>

          {/* Offline Engine Toggle Button */}
          <button
            id="offline-toggle-btn"
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-inner'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title={isOffline ? 'Using On-Device MobileAction 270M Local SLM' : 'Cloud Hybrid Gemini + MobileAction SLM'}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Offline Engine</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cloud Hybrid</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 scrollbar-none text-xs sm:text-sm font-medium">
          <button
            id="tab-assistant"
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'assistant'
                ? 'bg-indigo-600/90 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Assistant Center</span>
          </button>

          <button
            id="tab-shortcuts"
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'shortcuts'
                ? 'bg-indigo-600/90 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-amber-400" />
            <span>Voice Routines & Shortcuts</span>
          </button>

          <button
            id="tab-music"
            onClick={() => setActiveTab('music')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'music'
                ? 'bg-indigo-600/90 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Hands-Free Music</span>
          </button>

          <button
            id="tab-calendar"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'calendar'
                ? 'bg-indigo-600/90 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Calendar & Tasks</span>
          </button>

          <button
            id="tab-devices"
            onClick={() => setActiveTab('devices')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'devices'
                ? 'bg-indigo-600/90 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Connected Devices</span>
          </button>

          <button
            id="tab-background"
            onClick={() => setActiveTab('background')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'background'
                ? 'bg-indigo-600/90 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Background & WhatsApp</span>
          </button>

          <button
            id="tab-accent"
            onClick={() => setActiveTab('accent')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'accent'
                ? 'bg-indigo-600/90 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Accent Calibration</span>
          </button>

          <button
            id="tab-models"
            onClick={() => setActiveTab('models')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'models'
                ? 'bg-indigo-600/90 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Speech Models</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
