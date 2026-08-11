export type LanguageMode = 'en' | 'ml' | 'bilingual';

export type ActionType =
  | 'CALL'
  | 'SMS'
  | 'WHATSAPP_CALL'
  | 'WHATSAPP_MSG'
  | 'APP_OPEN'
  | 'SCROLL_REELS'
  | 'CALENDAR'
  | 'MUSIC_PLAY'
  | 'MUSIC_CONTROL'
  | 'VOLUME'
  | 'DEVICE'
  | 'ACCENT_CALIBRATE'
  | 'GENERAL_QUERY';

export interface AssistantActionResponse {
  actionType: ActionType;
  intentSummary: string;
  responseEn: string;
  responseMl: string;
  confidenceScore: number;
  engine: string;
  encryptedDataHash?: string;
  fallbackReason?: string;
  chainedSteps?: string[];
  requiresConfirmation?: boolean;
  parameters: {
    contactName?: string;
    phoneNumber?: string;
    messageBody?: string;
    platformApp?: string;
    scrollDirection?: 'up' | 'down' | 'next' | 'prev';
    callType?: 'voice' | 'video';
    eventTitle?: string;
    date?: string;
    time?: string;
    location?: string;
    durationMinutes?: number;
    songName?: string;
    artistName?: string;
    platform?: string;
    controlAction?: 'play' | 'pause' | 'next' | 'previous' | 'skip_forward' | 'skip_backward';
    skipSeconds?: number;
    volumeAction?: 'set' | 'up' | 'down' | 'mute';
    targetLevel?: number;
    targetDevice?: string;
    deviceAction?: 'connect' | 'disconnect' | 'check_battery';
  };
}

export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl?: string; // audio sample or synth stream
  language: 'Malayalam' | 'English';
  platform: 'Spotify' | 'YouTube Music' | 'Apple Music' | 'Wynk Music' | 'Amazon Music' | 'Offline Local';
  youtubeVideoId?: string; // YouTube Video embed ID
  youtubeMusicUrl?: string; // Direct YouTube Music URL
  spotifyUrl?: string; // Direct Spotify URL
  syncedPlatforms?: string[]; // Platforms this track is synced with
  isSyncedToYoutube?: boolean;
  isSyncedToSpotify?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location?: string;
  durationMinutes: number;
  category: 'Meeting' | 'Call' | 'Personal' | 'Routine' | 'Medical';
  isAutomated?: boolean;
}

export interface PhoneContact {
  id: string;
  name: string;
  nameMl?: string;
  relationship?: string;
  phoneNumber: string;
  avatarUrl: string;
  isFavorite: boolean;
  hasWhatsApp?: boolean;
}

export interface SmsMessage {
  id: string;
  recipientName: string;
  phoneNumber: string;
  body: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'draft';
  appSource?: 'SMS' | 'WhatsApp';
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'Headphones' | 'Earbuds' | 'Car Audio' | 'Smart Speaker' | 'Phone Speaker';
  isConnected: boolean;
  batteryLevel: number; // 0 - 100
  isCharging?: boolean;
  autoReconnect?: boolean;
  latencyMs: number;
  codec: string;
  ancMode: 'ANC High' | 'Transparency' | 'Off';
  equalizerPreset: string;
  lastConnected: string;
}

export interface VoiceAccentProfile {
  id: string;
  name: string;
  region: string;
  accuracyScore: number;
  isCalibrated: boolean;
  samplePhraseMl: string;
  samplePhraseEn: string;
}

export interface ModelPackage {
  id: string;
  name: string;
  description: string;
  sizeMb: number;
  version: string;
  language: string;
  isDownloaded: boolean;
  downloadProgress: number; // 0 - 100
  isDownloading: boolean;
}

export interface CommandLog {
  id: string;
  commandText: string;
  languageDetected: 'English' | 'Malayalam' | 'Bilingual';
  actionType: ActionType;
  intentSummary: string;
  spokenResponse: string;
  timestamp: string;
  confidence: number;
  engineUsed: string;
  isCorrected?: boolean;
  originalText?: string;
}

export interface VoiceShortcutStep {
  id: string;
  actionType: ActionType;
  description: string;
  commandText: string;
}

export interface VoiceShortcut {
  id: string;
  triggerPhrase: string;
  triggerPhraseMl?: string;
  title: string;
  description: string;
  isEnabled: boolean;
  steps: VoiceShortcutStep[];
  category: 'Morning Routine' | 'Commute' | 'Focus' | 'Evening' | 'Custom';
  executionCount: number;
  lastExecuted?: string;
}

export interface BackgroundServiceConfig {
  isBackgroundEnabled: boolean;
  isLockScreenListeningEnabled: boolean;
  isVoiceIdMatched: boolean;
  wakeWord: string;
  accessibilityGranted: boolean;
  autoScrollSpeedMs: number;
}
