# MobileAction 270M — Bilingual Offline AI Voice Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-06b6d4.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.19-000000.svg)](https://expressjs.com/)

**MobileAction 270M** is an **offline-first, background-persistent, bilingual AI Voice Assistant** engineered for low-latency mobile and web execution in **English** and **Malayalam (മലയാളം)**. Powered by compact Small Language Models (SLM), on-device speech-to-text (STT), and native browser APIs, MobileAction operates seamlessly even when screen-locked or disconnected from the internet.

---

## 🌟 Key Features

### 🎧 1. Offline Speech Recognition & Local SLM Models
* **On-Device Vosk SLM Buffers**: Pre-loaded lightweight language models:
  * **English (India) SLM**: ~92MB
  * **Malayalam (India) SLM**: ~148MB
* **Zero Network Dependency**: Speech processing, intent recognition, and entity extraction execute locally without sending private voice data to external servers.
* **Auto-Recycling Stream Buffer**: Automatic 40-second audio stream memory flushes to prevent memory leaks during continuous background listening.

### 🔒 2. Background Execution & Lock-Screen Access
* **Screen Wake Lock API (`navigator.wakeLock`)**: Prevents OS display sleep while listening for user wake words (*"Hey MobileAction"*).
* **AudioContext Keep-Alive Sentinel**: Sub-audible sine pulse generator keeps the browser audio process prioritized when app is minimized or running in background.
* **Watchdog & Crash Recovery**: Automated health monitor that detects process drops and restarts background listening loops seamlessly.

### 🎵 3. YouTube Music ↔ Spotify Dual Sync Bridge
* **Cross-Platform Audio Mirroring**: Instantly switch playback and sync track metadata between **Spotify** and **YouTube Music**.
* **Embedded YouTube Video Player**: Watch official music videos inside a responsive embedded modal (`youtube-nocookie.com`).
* **Direct Links & One-Tap Copy**: Quick access to Spotify tracks and YouTube Music streams.

### 🧠 4. Short-Term Scratchpad & Long-Term Episodic Memory
* **Short-Term Context Scratchpad**: Resolves pronouns and conversational context dynamically (e.g., *"Call Amma"* ➔ *"Message her"* understands *"her"* = Amma).
* **Long-Term Episodic Memory**: Persists user preferences for favorite contacts, primary streaming apps, and default Bluetooth headsets across sessions.

### 📱 5. Hands-Free Automation & Accessibility
* **WhatsApp Automation**: Initiate WhatsApp voice/video calls and send transcribed text messages hands-free.
* **Accessibility Auto-Scroll**: Voice-triggered scrolling for social feeds, Instagram Reels, and YouTube Shorts.
* **Device Control**: Route audio between AirPods Pro, Bose QC Headphones, or phone speakers instantly.

---

## 🏗️ Architecture & Technology Stack

```
mobileaction-voice-assistant/
├── server.ts                             # Express + Vite SSR / API entry point
├── src/
│   ├── App.tsx                           # Main application stage & tab orchestration
│   ├── services/
│   │   ├── BackgroundServiceWorker.ts    # Wake-Lock API, Web Audio Keep-Alive, Watchdog
│   │   └── OfflineSpeechEngine.ts        # Vosk/Whisper STT model manager & buffer recycler
│   ├── utils/
│   │   └── speech.ts                     # Web Speech API recognition & TTS wrapper
│   ├── components/
│   │   ├── SystemServiceStatusBar.tsx    # Live indicator for BG Service, WakeLock, and SLMs
│   │   ├── VoiceAssistantOrb.tsx         # Interactive voice orb with live audio visualizer
│   │   ├── YouTubeSpotifyIntegrationBridge.tsx # Spotify ↔ YouTube Music ↔ YouTube Video Bridge
│   │   ├── MusicPlayerSection.tsx        # High-fidelity music player & queue
│   │   ├── DeviceDashboardSection.tsx    # Connected audio devices & signal meter
│   │   ├── BackgroundAndLockScreenSettings.tsx # Lock-screen & WhatsApp automation controls
│   │   ├── ModelManagerSection.tsx       # Local SLM & STT model weights manager
│   │   ├── AccentCalibrationSection.tsx  # Malayalam/English accent calibration
│   │   ├── CalendarPlannerSection.tsx    # Smart local schedule & event reminder manager
│   │   └── ShortcutBuilderSection.tsx    # Custom voice macro & shortcut automation engine
│   └── data/
│       └── initialData.ts                # Default dataset, contacts, and voice command presets
```

### Stack Overview
* **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons
* **Backend**: Node.js, Express, ESBuild CJS Bundler
* **Speech & AI**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`), Vosk SLM Models, Web Audio API
* **Build System**: Vite, `tsx`, `esbuild`

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** v18.0.0 or higher
* **npm** v9.0.0 or higher

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/mobileaction-voice-assistant.git
   cd mobileaction-voice-assistant
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

4. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🗣️ Voice Commands Examples

| Language | Voice Command Example | Action Executed |
| :--- | :--- | :--- |
| **English** | *"Call Amma on WhatsApp"* | Triggers WhatsApp voice call to primary contact |
| **Malayalam** | *"അമ്മയെ വാട്ട്സ്ആപ്പിൽ വിളിക്കൂ"* | Initiates Malayalam contact search and calls |
| **English** | *"Sync active track to YouTube Music"* | Mirrors Spotify track to YouTube Music & enables video embed |
| **Bilingual** | *"Scroll down reels"* | Triggers accessibility scroll gesture |
| **English** | *"Switch audio to Bose QuietComfort"* | Redirects active output device to Bluetooth headphones |

---

## 🛡️ Privacy & Permissions

* **Microphone Access**: Required only during active STT listening sessions.
* **Screen Wake Lock**: Used exclusively when background listening mode is manually enabled.
* **No Telemetry**: All speech parsing and state evaluations remain entirely on your local device.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
