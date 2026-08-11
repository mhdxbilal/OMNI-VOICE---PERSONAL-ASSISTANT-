import React, { useState } from 'react';
import { Header } from './components/Header';
import { SystemServiceStatusBar } from './components/SystemServiceStatusBar';
import { VoiceAssistantOrb } from './components/VoiceAssistantOrb';
import { ActionOverlayModal } from './components/ActionOverlayModal';
import { MusicPlayerSection } from './components/MusicPlayerSection';
import { CalendarPlannerSection } from './components/CalendarPlannerSection';
import { DeviceDashboardSection } from './components/DeviceDashboardSection';
import { AccentCalibrationSection } from './components/AccentCalibrationSection';
import { ModelManagerSection } from './components/ModelManagerSection';
import { BackgroundAndLockScreenSettings } from './components/BackgroundAndLockScreenSettings';
import { ShortcutBuilderSection } from './components/ShortcutBuilderSection';
import { VoiceLogDrawer } from './components/VoiceLogDrawer';
import { AndroidSystemFrame } from './components/AndroidSystemFrame';

import {
  LanguageMode,
  AssistantActionResponse,
  SongTrack,
  CalendarEvent,
  PhoneContact,
  SmsMessage,
  ConnectedDevice,
  VoiceAccentProfile,
  ModelPackage,
  CommandLog,
  BackgroundServiceConfig,
  VoiceShortcut,
} from './types';

import {
  INITIAL_SONGS,
  INITIAL_CONTACTS,
  INITIAL_EVENTS,
  INITIAL_DEVICES,
  ACCENT_PROFILES,
  MODEL_PACKAGES,
  INITIAL_SHORTCUTS,
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('assistant');
  const [language, setLanguage] = useState<LanguageMode>('bilingual');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [lastResponse, setLastResponse] = useState<AssistantActionResponse | null>(null);

  // Active call & SMS overlays
  const [activeCallContact, setActiveCallContact] = useState<(PhoneContact & { isWhatsAppCall?: boolean; isVideoCall?: boolean }) | null>(null);
  const [sentSms, setSentSms] = useState<SmsMessage | null>(null);

  // Background & Lock Screen Service configuration
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundServiceConfig>({
    isBackgroundEnabled: true,
    isLockScreenListeningEnabled: true,
    isVoiceIdMatched: true,
    wakeWord: 'Hey Aura',
    accessibilityGranted: true,
    autoScrollSpeedMs: 5000,
  });

  // Custom Voice Shortcuts state
  const [shortcuts, setShortcuts] = useState<VoiceShortcut[]>(INITIAL_SHORTCUTS);

  // Music state
  const [songs] = useState<SongTrack[]>(INITIAL_SONGS);
  const [currentTrack, setCurrentTrack] = useState<SongTrack>(INITIAL_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(75);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');

  // Calendar & Contacts state
  const [contacts] = useState<PhoneContact[]>(INITIAL_CONTACTS);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);

  // Devices state
  const [devices, setDevices] = useState<ConnectedDevice[]>(INITIAL_DEVICES);

  // Scratchpad Short-Term Context & Long-Term Episodic Memory states
  const [scratchpadHistory, setScratchpadHistory] = useState<
    Array<{ role: string; content: string; contactName?: string; time?: string }>
  >([
    { role: 'user', content: 'Call Amma', contactName: 'Amma' },
    { role: 'assistant', content: 'Calling Amma now.' },
  ]);

  const [userPreferences] = useState({
    favoriteContact: 'Amma',
    primaryMusicApp: 'Spotify',
    preferredDevice: 'AirPods Pro',
  });

  // Models state
  const [models, setModels] = useState<ModelPackage[]>(MODEL_PACKAGES);

  // Logs state
  const [commandLogs, setCommandLogs] = useState<CommandLog[]>([
    {
      id: 'l1',
      commandText: 'Start my morning routine',
      languageDetected: 'English',
      actionType: 'CALENDAR',
      intentSummary: 'Multi-Step Routine: Checked calendar, played Malare, set vol 80%',
      spokenResponse: 'Executing Morning Launch Routine sequence for you now.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 0.98,
      engineUsed: 'MobileAction 270M Routine Engine',
    },
    {
      id: 'l2',
      commandText: 'Call Amma on WhatsApp',
      languageDetected: 'English',
      actionType: 'WHATSAPP_CALL',
      intentSummary: 'Initiated WhatsApp voice call to Amma',
      spokenResponse: 'Calling Amma on WhatsApp using hands-free integration.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 0.72, // Low confidence example for review feature
      engineUsed: 'MobileAction 270M On-Device SLM',
    },
  ]);

  // Accent Profiles state
  const [profiles, setProfiles] = useState<VoiceAccentProfile[]>(ACCENT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>('a1');

  const activeDevice = devices.find((d) => d.isConnected) || devices[0];
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Primary command processor handler
  const handleExecuteCommand = async (commandText: string): Promise<AssistantActionResponse | null> => {
    setIsProcessing(true);
    try {
      // Check if command phrase matches an enabled custom voice shortcut routine
      const matchedShortcut = shortcuts.find(
        (sc) =>
          sc.isEnabled &&
          (sc.triggerPhrase.toLowerCase() === commandText.toLowerCase() ||
            (sc.triggerPhraseMl && sc.triggerPhraseMl.toLowerCase() === commandText.toLowerCase()))
      );

      if (matchedShortcut) {
        // Execute the multi-step routine
        let lastRes: AssistantActionResponse | null = null;
        for (const step of matchedShortcut.steps) {
          lastRes = await handleExecuteCommand(step.commandText);
        }

        // Increment routine execution counter
        setShortcuts((prev) =>
          prev.map((s) =>
            s.id === matchedShortcut.id
              ? { ...s, executionCount: s.executionCount + 1, lastExecuted: 'Just now' }
              : s
          )
        );

        return (
          lastRes || {
            actionType: 'GENERAL_QUERY',
            intentSummary: `Executed ${matchedShortcut.title} Routine`,
            responseEn: `Completed ${matchedShortcut.steps.length}-step routine for "${matchedShortcut.title}".`,
            responseMl: `"${matchedShortcut.title}" പൂർത്തിയാക്കി.`,
            confidenceScore: 0.99,
            engine: 'MobileAction Routine Engine',
            parameters: {},
          }
        );
      }

      const response = await fetch('/api/assistant/process-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: commandText,
          language,
          isOffline,
          accentProfile: activeProfile.name,
          currentApp: currentTrack.platform,
          currentVolume: volume,
          isPlaying,
          activeDevice: activeDevice.name,
          scratchpadHistory,
          userPreferences,
        }),
      });

      const data: AssistantActionResponse = await response.json();
      setLastResponse(data);

      const params = data.parameters || {};

      // Append to scratchpad history
      setScratchpadHistory((prev) => [
        ...prev.slice(-6),
        { role: 'user', content: commandText, contactName: params.contactName },
        { role: 'assistant', content: data.intentSummary, contactName: params.contactName },
      ]);

      if (data.actionType === 'WHATSAPP_CALL') {
        const name = params.contactName || 'Amma';
        const matched = contacts.find((c) => c.name.toLowerCase().includes(name.toLowerCase())) || contacts[0];
        setActiveCallContact({
          ...matched,
          isWhatsAppCall: true,
          isVideoCall: params.callType === 'video',
        });
      } else if (data.actionType === 'WHATSAPP_MSG') {
        const name = params.contactName || 'Rahul';
        const body = params.messageBody || 'Reached safely!';
        setSentSms({
          id: 'wa-' + Date.now(),
          recipientName: name,
          phoneNumber: '+91 97453 88899',
          body,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
          appSource: 'WhatsApp',
        });
      } else if (data.actionType === 'CALL') {
        const name = params.contactName || 'Contact';
        const matched = contacts.find((c) => c.name.toLowerCase().includes(name.toLowerCase())) || contacts[0];
        setActiveCallContact({ ...matched, isWhatsAppCall: false });
      } else if (data.actionType === 'SMS') {
        const name = params.contactName || 'Rahul';
        const body = params.messageBody || 'I will be there soon.';
        setSentSms({
          id: 'sms-' + Date.now(),
          recipientName: name,
          phoneNumber: '+91 97453 88899',
          body,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
          appSource: 'SMS',
        });
      } else if (data.actionType === 'CALENDAR') {
        const newEvt: CalendarEvent = {
          id: 'evt-' + Date.now(),
          title: params.eventTitle || 'Appointment Scheduled',
          date: params.date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time: params.time || '15:00',
          location: params.location || 'Calendar Location',
          durationMinutes: params.durationMinutes || 45,
          category: 'Meeting',
          isAutomated: true,
        };
        setEvents((prev) => [newEvt, ...prev]);
      } else if (data.actionType === 'MUSIC_PLAY') {
        const songName = (params.songName || '').toLowerCase();
        const matchedSong = songs.find(
          (s) => s.title.toLowerCase().includes(songName) || s.artist.toLowerCase().includes(songName)
        );
        if (matchedSong) {
          setCurrentTrack(matchedSong);
        }
        setIsPlaying(true);
      } else if (data.actionType === 'MUSIC_CONTROL') {
        if (params.controlAction === 'pause') setIsPlaying(false);
        else if (params.controlAction === 'play') setIsPlaying(true);
        else if (params.controlAction === 'next') {
          const idx = songs.findIndex((s) => s.id === currentTrack.id);
          const nextTrack = songs[(idx + 1) % songs.length];
          setCurrentTrack(nextTrack);
          setIsPlaying(true);
        } else if (params.controlAction === 'previous') {
          const idx = songs.findIndex((s) => s.id === currentTrack.id);
          const prevTrack = songs[(idx - 1 + songs.length) % songs.length];
          setCurrentTrack(prevTrack);
          setIsPlaying(true);
        }
      } else if (data.actionType === 'VOLUME') {
        if (params.targetLevel !== undefined) {
          setVolume(params.targetLevel);
        }
      } else if (data.actionType === 'DEVICE') {
        if (params.targetDevice) {
          const targetName = params.targetDevice.toLowerCase();
          setDevices((prev) =>
            prev.map((d) => ({
              ...d,
              isConnected: d.name.toLowerCase().includes(targetName),
            }))
          );
        }
      }

      // Record command log
      const newLog: CommandLog = {
        id: 'log-' + Date.now(),
        commandText,
        languageDetected: language === 'ml' ? 'Malayalam' : language === 'en' ? 'English' : 'Bilingual',
        actionType: data.actionType,
        intentSummary: data.intentSummary,
        spokenResponse: language === 'ml' ? data.responseMl : data.responseEn,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: data.confidenceScore,
        engineUsed: data.engine,
      };

      setCommandLogs((prev) => [newLog, ...prev]);
      return data;
    } catch (err) {
      console.error('Error executing command:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Device handlers
  const handleConnectDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        isConnected: d.id === deviceId,
      }))
    );
  };

  const handleUpdateAncMode = (deviceId: string, mode: 'ANC High' | 'Transparency' | 'Off') => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, ancMode: mode } : d))
    );
  };

  const handleUpdateEq = (deviceId: string, eq: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, equalizerPreset: eq } : d))
    );
  };

  const handleToggleAutoReconnect = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, autoReconnect: !d.autoReconnect } : d))
    );
  };

  // Shortcut handlers
  const handleAddShortcut = (newShortcut: VoiceShortcut) => {
    setShortcuts((prev) => [newShortcut, ...prev]);
  };

  const handleUpdateShortcut = (updated: VoiceShortcut) => {
    setShortcuts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteShortcut = (id: string) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
  };

  // Log correction handler
  const handleUpdateLog = (updatedLog: CommandLog) => {
    setCommandLogs((prev) => prev.map((l) => (l.id === updatedLog.id ? updatedLog : l)));
  };

  // Accent handlers
  const handleCalibrateProfile = (profileId: string, newAccuracy: number) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, accuracyScore: newAccuracy, isCalibrated: true } : p))
    );
  };

  // Model handlers
  const handleDownloadModel = (modelId: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, isDownloading: true, downloadProgress: 10 } : m))
    );

    let prog = 10;
    const interval = setInterval(() => {
      prog += 25;
      if (prog >= 100) {
        clearInterval(interval);
        setModels((prev) =>
          prev.map((m) => (m.id === modelId ? { ...m, isDownloading: false, isDownloaded: true, downloadProgress: 100 } : m))
        );
      } else {
        setModels((prev) =>
          prev.map((m) => (m.id === modelId ? { ...m, downloadProgress: prog } : m))
        );
      }
    }, 600);
  };

  // WhatsApp quick triggers
  const handleTriggerWhatsAppCall = (contact: PhoneContact, isVideo: boolean) => {
    setActiveCallContact({
      ...contact,
      isWhatsAppCall: true,
      isVideoCall: isVideo,
    });
  };

  const handleTriggerWhatsAppMsg = (contact: PhoneContact, msg: string) => {
    setSentSms({
      id: 'wa-' + Date.now(),
      recipientName: contact.name,
      phoneNumber: contact.phoneNumber,
      body: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      appSource: 'WhatsApp',
    });
  };

  return (
    <AndroidSystemFrame
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      language={language}
      setLanguage={setLanguage}
      isOffline={isOffline}
      setIsOffline={setIsOffline}
      activeDeviceName={activeDevice.name}
      volume={volume}
      setVolume={setVolume}
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      onTogglePlay={() => setIsPlaying(!isPlaying)}
      onNextTrack={() => {
        const idx = songs.findIndex((s) => s.id === currentTrack.id);
        setCurrentTrack(songs[(idx + 1) % songs.length]);
      }}
      onPrevTrack={() => {
        const idx = songs.findIndex((s) => s.id === currentTrack.id);
        setCurrentTrack(songs[(idx - 1 + songs.length) % songs.length]);
      }}
      onTriggerFloatingOrb={() => {
        setActiveTab('assistant');
      }}
    >
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        activeDeviceName={activeDevice.name}
        activeVolume={volume}
      />

      {/* Permanent System Service Status Bar (Background Worker, WakeLock, Offline Models) */}
      <SystemServiceStatusBar language={language} isOffline={isOffline} />

      {/* Main Content Stage */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 space-y-8">
        {activeTab === 'assistant' && (
          <div className="space-y-8">
            <VoiceAssistantOrb
              language={language}
              isOffline={isOffline}
              onExecuteCommand={handleExecuteCommand}
              lastResponse={lastResponse}
              isProcessing={isProcessing}
              scratchpadContext={scratchpadHistory}
              userPreferences={userPreferences}
            />

            {/* Quick Hands-Free Music Overview Widget */}
            <MusicPlayerSection
              songs={songs}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onNextTrack={() => {
                const idx = songs.findIndex((s) => s.id === currentTrack.id);
                setCurrentTrack(songs[(idx + 1) % songs.length]);
              }}
              onPrevTrack={() => {
                const idx = songs.findIndex((s) => s.id === currentTrack.id);
                setCurrentTrack(songs[(idx - 1 + songs.length) % songs.length]);
              }}
              onSkipSeconds={() => {}}
              volume={volume}
              onChangeVolume={setVolume}
              onSelectTrack={(t) => {
                setCurrentTrack(t);
                setIsPlaying(true);
              }}
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
              isOffline={isOffline}
            />

            {/* Activity Logs with Review & Correction capability */}
            <VoiceLogDrawer
              logs={commandLogs}
              onClearLogs={() => setCommandLogs([])}
              onUpdateLog={handleUpdateLog}
              onExecuteCommand={handleExecuteCommand}
            />
          </div>
        )}

        {activeTab === 'shortcuts' && (
          <ShortcutBuilderSection
            shortcuts={shortcuts}
            onAddShortcut={handleAddShortcut}
            onUpdateShortcut={handleUpdateShortcut}
            onDeleteShortcut={handleDeleteShortcut}
            onExecuteCommand={handleExecuteCommand}
          />
        )}

        {activeTab === 'music' && (
          <MusicPlayerSection
            songs={songs}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onNextTrack={() => {
              const idx = songs.findIndex((s) => s.id === currentTrack.id);
              setCurrentTrack(songs[(idx + 1) % songs.length]);
            }}
            onPrevTrack={() => {
              const idx = songs.findIndex((s) => s.id === currentTrack.id);
              setCurrentTrack(songs[(idx - 1 + songs.length) % songs.length]);
            }}
            onSkipSeconds={() => {}}
            volume={volume}
            onChangeVolume={setVolume}
            onSelectTrack={(t) => {
              setCurrentTrack(t);
              setIsPlaying(true);
            }}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
            isOffline={isOffline}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarPlannerSection
            events={events}
            onAddEvent={(evt) =>
              setEvents((prev) => [{ id: 'evt-' + Date.now(), ...evt }, ...prev])
            }
            onDeleteEvent={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
            language={language}
          />
        )}

        {activeTab === 'devices' && (
          <DeviceDashboardSection
            devices={devices}
            onConnectDevice={handleConnectDevice}
            onUpdateAncMode={handleUpdateAncMode}
            onUpdateEq={handleUpdateEq}
            onToggleAutoReconnect={handleToggleAutoReconnect}
          />
        )}

        {activeTab === 'background' && (
          <BackgroundAndLockScreenSettings
            config={backgroundConfig}
            onUpdateConfig={(upd) => setBackgroundConfig((prev) => ({ ...prev, ...upd }))}
            contacts={contacts}
            onTriggerWhatsAppCall={handleTriggerWhatsAppCall}
            onTriggerWhatsAppMsg={handleTriggerWhatsAppMsg}
            onExecuteCommand={handleExecuteCommand}
          />
        )}

        {activeTab === 'accent' && (
          <AccentCalibrationSection
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelectProfile={setActiveProfileId}
            onCalibrateProfile={handleCalibrateProfile}
          />
        )}

        {activeTab === 'models' && (
          <ModelManagerSection models={models} onDownloadModel={handleDownloadModel} />
        )}
      </main>

      {/* Active Call / SMS Modal Overlays */}
      <ActionOverlayModal
        activeCallContact={activeCallContact}
        onEndCall={() => setActiveCallContact(null)}
        sentSms={sentSms}
        onCloseSms={() => setSentSms(null)}
      />
    </AndroidSystemFrame>
  );
}
