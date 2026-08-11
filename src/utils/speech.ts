// Web Speech API Voice Recognition & Speech Synthesis Utility
// Bound with OfflineSpeechEngine and BackgroundServiceWorker for crash recovery & memory leak prevention

import { offlineSpeechEngine } from '../services/OfflineSpeechEngine';
import { backgroundServiceWorker } from '../services/BackgroundServiceWorker';

export interface SpeechListenerOptions {
  language: 'en-IN' | 'ml-IN' | 'en-US';
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function startSpeechListening(options: SpeechListenerOptions): boolean {
  if (!isSpeechRecognitionSupported()) {
    options.onError('Web Speech API is not supported in this browser environment.');
    return false;
  }

  // Ensure background wake-lock and keep-alive are running during voice session
  backgroundServiceWorker.startService();

  return offlineSpeechEngine.startListening(
    options.language,
    options.onResult,
    options.onError,
    options.onEnd
  );
}

export function stopSpeechListening() {
  offlineSpeechEngine.stopListening();
}

// Speech Synthesis (Text to Speech) with bilingual Malayalam pitch & rate handling
export function speakText(
  text: string,
  lang: 'en' | 'ml' = 'en',
  onStart?: () => void,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel(); // cancel any active speech immediately

  // Clean markdown asterisks or special markers
  const cleanText = text.replace(/\*\*/g, '').replace(/[\#\*\_]/g, '');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = lang === 'ml' ? 0.9 : 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Language mapping
  utterance.lang = lang === 'ml' ? 'ml-IN' : 'en-IN';

  // Find suitable voice if available
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const matchedVoice = voices.find((v) => {
      if (lang === 'ml') {
        return (
          v.lang.toLowerCase().includes('ml') ||
          v.name.toLowerCase().includes('malayalam') ||
          v.lang.toLowerCase().includes('hi-in')
        );
      }
      return v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('en-us');
    });

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
