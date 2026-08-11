import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check API
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'MobileAction 270M Assistant Service',
      version: '1.0.0',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // Process voice/text command API
  app.post('/api/assistant/process-command', async (req, res) => {
    try {
      const {
        command,
        language = 'en', // 'en' | 'ml' | 'bilingual'
        isOffline = false,
        accentProfile = 'Malayalam-English',
        currentApp = 'Spotify',
        currentVolume = 70,
        isPlaying = false,
        activeDevice = 'AirPods Pro',
        scratchpadHistory = [], // Short-Term Scratchpad context
        userPreferences = {}, // Long-Term Episodic Memory preferences
      } = req.body;

      if (!command || typeof command !== 'string') {
        return res.status(400).json({ error: 'Command text is required' });
      }

      // If offline mode is enabled or no Gemini API key, use simulated MobileAction 270M On-Device SLM
      if (isOffline || !process.env.GEMINI_API_KEY) {
        const localResult = processMobileAction270MOffline(
          command,
          language,
          currentApp,
          currentVolume,
          isPlaying,
          activeDevice,
          scratchpadHistory,
          userPreferences
        );
        return res.json({
          ...localResult,
          engine: 'MobileAction 270M On-Device SLM (Offline Local Engine)',
          encryptedDataHash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        });
      }

      // Initialize Gemini AI client server-side
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const historyContext = scratchpadHistory.length > 0
        ? `Short-Term Dialogue Scratchpad History: ${JSON.stringify(scratchpadHistory.slice(-4))}`
        : 'Short-Term Scratchpad: Empty';

      const memoryContext = `Long-Term Episodic Memory User Profile:
- Favorite Contact: ${userPreferences.favoriteContact || 'Amma'}
- Primary Music App: ${userPreferences.primaryMusicApp || currentApp}
- Preferred Audio Device: ${userPreferences.preferredDevice || activeDevice}
- Common Routine: Morning Launch (Calendar -> Weather -> Play Music)`;

      const systemInstruction = `You are an ultra-responsive, proactive Personal AI Voice Assistant.
Core Directives:
1. Low Latency & Direct Output: Sentence 1 MUST contain direct substance or action confirmation. NEVER use introductory fluff ("Sure!", "Here is...", "I'd be happy to...", "Okay, I will...").
2. Fluid Pronoun & Context Resolution: Use the provided Short-Term Dialogue Scratchpad to resolve fluid pronouns ("call her", "remind me then", "play that song").
3. Long-Term Memory: Use saved preferences (${userPreferences.favoriteContact || 'Amma'}, ${userPreferences.primaryMusicApp || currentApp}) without asking the user to repeat details.
4. Proactive Chained Actions: Anticipate logical next steps (e.g., event lookup -> travel duration -> setting alarm/reminder -> queue media) in a single turn.
5. Scannable Visual Receipts: Format text outputs with brief bullet points and bold key entities (**Contact**, **App**, **Time**, **Action**) for instant tracking.
6. High-Stakes Safeguard: Mark "requiresConfirmation": true ONLY for financial, high-stakes, or destructive actions.

Supported Action Types:
- "CALL": Phone call. Extract contactName, phoneNumber.
- "SMS": Text message. Extract contactName, messageBody.
- "WHATSAPP_CALL": WhatsApp call. Extract contactName, callType ("voice" | "video").
- "WHATSAPP_MSG": WhatsApp message. Extract contactName, messageBody.
- "CALENDAR": Schedule appointment or reminder. Extract eventTitle, date, time, location, durationMinutes.
- "MUSIC_PLAY": Play music. Extract songName, artistName, platform.
- "MUSIC_CONTROL": Playback controls (play, pause, next, previous, skip_forward, skip_backward).
- "VOLUME": Adjust volume (set, up, down, mute). Target level 0-100.
- "DEVICE": Manage audio output device. Extract targetDevice, deviceAction.
- "ACCENT_CALIBRATE": Voice calibration mode.
- "GENERAL_QUERY": Conversational Q&A or multi-step proactive information.

Context State:
${historyContext}
${memoryContext}
Language requested: ${language}. Accent tuning: ${accentProfile}.
Current Media State: Platform: ${currentApp}, Volume: ${currentVolume}%, Playing: ${isPlaying}, Connected Device: ${activeDevice}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Process user voice command: "${command}"`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              actionType: {
                type: Type.STRING,
                description: 'Classified action type: CALL, SMS, WHATSAPP_CALL, WHATSAPP_MSG, CALENDAR, MUSIC_PLAY, MUSIC_CONTROL, VOLUME, DEVICE, ACCENT_CALIBRATE, GENERAL_QUERY',
              },
              intentSummary: {
                type: Type.STRING,
                description: 'Short scannable intent summary with **bold entities**',
              },
              responseEn: {
                type: Type.STRING,
                description: 'Ultra-direct spoken response in English. Sentence 1 MUST be direct action confirmation without fluff.',
              },
              responseMl: {
                type: Type.STRING,
                description: 'Ultra-direct spoken response in Malayalam script.',
              },
              requiresConfirmation: {
                type: Type.BOOLEAN,
                description: 'True ONLY if action is destructive or financial',
              },
              chainedSteps: {
                type: Type.ARRAY,
                description: 'Proactively chained multi-step actions executed in this single turn',
                items: {
                  type: Type.STRING,
                },
              },
              parameters: {
                type: Type.OBJECT,
                properties: {
                  contactName: { type: Type.STRING },
                  phoneNumber: { type: Type.STRING },
                  messageBody: { type: Type.STRING },
                  eventTitle: { type: Type.STRING },
                  date: { type: Type.STRING },
                  time: { type: Type.STRING },
                  location: { type: Type.STRING },
                  durationMinutes: { type: Type.NUMBER },
                  songName: { type: Type.STRING },
                  artistName: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  controlAction: { type: Type.STRING },
                  skipSeconds: { type: Type.NUMBER },
                  volumeAction: { type: Type.STRING },
                  targetLevel: { type: Type.NUMBER },
                  targetDevice: { type: Type.STRING },
                  deviceAction: { type: Type.STRING },
                },
              },
              confidenceScore: {
                type: Type.NUMBER,
                description: 'Confidence score 0.0 to 1.0',
              },
            },
            required: ['actionType', 'intentSummary', 'responseEn', 'responseMl', 'confidenceScore'],
          },
        },
      });

      const parsedJson = JSON.parse(response.text || '{}');
      return res.json({
        ...parsedJson,
        engine: 'MobileAction 270M Cloud + On-Device Hybrid Engine',
        encryptedDataHash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      });
    } catch (err: any) {
      console.error('Error processing command via Gemini:', err);
      // Fallback gracefully to offline MobileAction 270M parser
      const fallbackResult = processMobileAction270MOffline(
        req.body.command || '',
        req.body.language || 'en',
        req.body.currentApp,
        req.body.currentVolume,
        req.body.isPlaying,
        req.body.activeDevice,
        req.body.scratchpadHistory,
        req.body.userPreferences
      );
      return res.json({
        ...fallbackResult,
        engine: 'MobileAction 270M Local Fallback Engine',
        fallbackReason: err?.message || 'Server processing fallback',
        encryptedDataHash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      });
    }
  });

  // Vite development or production static server setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MobileAction 270M Voice Assistant Server running on http://0.0.0.0:${PORT}`);
  });
}

// Offline MobileAction 270M rule-based SLM simulator
function processMobileAction270MOffline(
  cmd: string,
  lang: string,
  currentApp = 'Spotify',
  currentVolume = 70,
  isPlaying = false,
  activeDevice = 'AirPods Pro',
  scratchpadHistory: any[] = [],
  userPreferences: any = {}
) {
  const text = cmd.toLowerCase().trim();

  // Helper to find last contact or favorite contact from memory
  const favContact = userPreferences.favoriteContact || 'Amma';
  let lastMentionedContact = favContact;

  if (scratchpadHistory.length > 0) {
    for (let i = scratchpadHistory.length - 1; i >= 0; i--) {
      const item = scratchpadHistory[i];
      if (item.contactName) {
        lastMentionedContact = item.contactName;
        break;
      }
    }
  }

  // 1. Phone Calls
  if (
    text.includes('call') ||
    text.includes('vilikk') ||
    text.includes('വിളിക്ക') ||
    text.includes('dial')
  ) {
    let name = favContact;
    if (text.includes('her') || text.includes('him') || text.includes('them')) {
      name = lastMentionedContact;
    } else if (text.includes('amma') || text.includes('അമ്മ')) name = 'Amma';
    else if (text.includes('doctor') || text.includes('ഡാക്ടർ')) name = 'Dr. Alex';
    else if (text.includes('priya') || text.includes('പ്രിയ')) name = 'Priya';
    else if (text.includes('rahul') || text.includes('രാഹുൽ')) name = 'Rahul';
    else {
      const words = cmd.split(' ');
      const callIdx = words.findIndex(
        (w) => w.toLowerCase().includes('call') || w.toLowerCase().includes('vilikk')
      );
      if (callIdx !== -1 && words[callIdx + 1]) name = words[callIdx + 1];
    }

    return {
      actionType: 'CALL',
      intentSummary: `Initiating voice call to **${name}**`,
      responseEn: `Calling **${name}** now.`,
      responseMl: `**${name}**-നെ വിളിക്കുന്നു.`,
      parameters: { contactName: name, phoneNumber: '+91 98765 43210' },
      confidenceScore: 0.98,
      chainedSteps: [`Extracted contact: **${name}** from memory`, `Dialing hands-free`],
    };
  }

  // 2. Text Message / WhatsApp
  if (
    text.includes('message') ||
    text.includes('sms') ||
    text.includes('text') ||
    text.includes('ayakk') ||
    text.includes('അയക്കുക') ||
    text.includes('സന്ദേശം') ||
    text.includes('whatsapp')
  ) {
    let name = lastMentionedContact;
    if (text.includes('priya') || text.includes('പ്രിയ')) name = 'Priya';
    else if (text.includes('amma') || text.includes('അമ്മ')) name = 'Amma';
    else if (text.includes('rahul') || text.includes('രാഹുൽ')) name = 'Rahul';

    let msg = 'I will be there in 15 minutes.';
    if (text.includes('late')) msg = 'I am running a bit late, will update you soon!';
    if (text.includes('reached') || text.includes('ethiy')) msg = 'Reached home safely!';

    const isWhatsApp = text.includes('whatsapp');

    return {
      actionType: isWhatsApp ? 'WHATSAPP_MSG' : 'SMS',
      intentSummary: `Sending ${isWhatsApp ? 'WhatsApp' : 'SMS'} to **${name}**: "${msg}"`,
      responseEn: `Sending message to **${name}**: "${msg}"`,
      responseMl: `**${name}**-ലേക്ക് സന്ദേശം അയക്കുന്നു: "${msg}"`,
      parameters: { contactName: name, messageBody: msg },
      confidenceScore: 0.96,
      chainedSteps: [`Resolved recipient **${name}**`, `Composed body: "${msg}"`],
    };
  }

  // 3. Calendar & Meetings & Reminders
  if (
    text.includes('schedule') ||
    text.includes('meeting') ||
    text.includes('appointment') ||
    text.includes('reminder') ||
    text.includes('calendar') ||
    text.includes('samayam') ||
    text.includes('മീറ്റിംഗ്') ||
    text.includes('ഓർമ്മപ്പെടുത്തൽ')
  ) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    return {
      actionType: 'CALENDAR',
      intentSummary: `Scheduled **Team Sync** for **tomorrow at 3:00 PM**`,
      responseEn: `Scheduled appointment: **Team Sync** tomorrow at **3:00 PM**.`,
      responseMl: `കലണ്ടറിൽ നാളെ **3:00 PM**-ന് **ടീം മീറ്റിംഗ്** ചേർത്തു.`,
      parameters: {
        eventTitle: 'Team Sync & Project Review',
        date: dateStr,
        time: '15:00',
        location: 'Google Meet / Conference Room A',
        durationMinutes: 45,
      },
      confidenceScore: 0.97,
      chainedSteps: [
        `Checked schedule availability for tomorrow`,
        `Created **Team Sync** event at **3:00 PM**`,
        `Set automated reminder 15 minutes prior`,
      ],
    };
  }

  // 4. Music Playback Control (Pause, Play, Next, Previous, Skip)
  if (
    text.includes('pause') ||
    text.includes('stop') ||
    text.includes('നിർത്തുക') ||
    text.includes('play') ||
    text.includes('next') ||
    text.includes('adutha') ||
    text.includes('അടുത്ത') ||
    text.includes('previous') ||
    text.includes('skip')
  ) {
    let ctrl: 'play' | 'pause' | 'next' | 'previous' | 'skip_forward' | 'skip_backward' = 'play';
    let secs = 15;

    if (text.includes('pause') || text.includes('stop') || text.includes('നിർത്തുക')) ctrl = 'pause';
    else if (text.includes('next') || text.includes('adutha') || text.includes('അടുത്ത')) ctrl = 'next';
    else if (text.includes('previous') || text.includes('munpethe')) ctrl = 'previous';
    else if (text.includes('skip')) {
      ctrl = 'skip_forward';
      if (text.includes('10')) secs = 10;
      if (text.includes('30')) secs = 30;
    } else if (text.includes('play') || text.includes('തുടങ്ങുക')) ctrl = 'play';

    const respEn =
      ctrl === 'pause'
        ? 'Pausing music playback.'
        : ctrl === 'next'
        ? `Playing next track on **${currentApp}**.`
        : ctrl === 'previous'
        ? 'Going back to previous track.'
        : ctrl === 'skip_forward'
        ? `Skipping forward ${secs} seconds.`
        : `Resuming playback on **${currentApp}**.`;

    const respMl =
      ctrl === 'pause'
        ? 'മ്യൂസിക് പാസ്സ് ചെയ്യുന്നു.'
        : ctrl === 'next'
        ? 'അടുത്ത പാട്ട് പ്ലേ ചെയ്യുന്നു.'
        : ctrl === 'previous'
        ? 'മുൻപത്തെ പാട്ടിലേക്ക് പോകുന്നു.'
        : ctrl === 'skip_forward'
        ? `${secs} സെക്കൻഡ് മുന്നോട്ട് പോയി.`
        : 'മ്യൂസിക് പ്ലേ ചെയ്യുന്നു.';

    return {
      actionType: 'MUSIC_CONTROL',
      intentSummary: `Music control: **${ctrl}** on **${currentApp}**`,
      responseEn: respEn,
      responseMl: respMl,
      parameters: { controlAction: ctrl, skipSeconds: secs },
      confidenceScore: 0.99,
    };
  }

  // 5. Cross-Platform Sync & Music Bridge (YouTube Music ↔ Spotify ↔ YouTube Video)
  if (
    text.includes('sync') ||
    text.includes('bridge') ||
    text.includes('transfer') ||
    text.includes('mirror') ||
    text.includes('watch') ||
    text.includes('video')
  ) {
    if (text.includes('watch') || text.includes('video')) {
      return {
        actionType: 'MUSIC_PLAY',
        intentSummary: `Opened official **YouTube Video** embed stream`,
        responseEn: `Opening official **YouTube Video** player for the active track.`,
        responseMl: `**YouTube Video** ഔദ്യോഗിക സ്ട്രീം ആരംഭിക്കുന്നു.`,
        parameters: { platform: 'YouTube', songName: 'Malare Ninne' },
        confidenceScore: 0.98,
        chainedSteps: [
          `Resolved YouTube Video ID: **_fI-7P6Yx_o**`,
          `Initialized embedded YouTube video player modal`,
        ],
      };
    }

    const targetPlatform = text.includes('spotify') ? 'Spotify' : 'YouTube Music';
    return {
      actionType: 'MUSIC_PLAY',
      intentSummary: `Synced playlist & mirrored track to **${targetPlatform}**`,
      responseEn: `Cross-synced active track between **Spotify** and **${targetPlatform}**.`,
      responseMl: `**Spotify**-ൽ നിന്നും **${targetPlatform}**-ലേക്ക് ട്രാക്ക് വിവരങ്ങൾ സിങ്ക് ചെയ്തു.`,
      parameters: { platform: targetPlatform, songName: 'Malare Ninne' },
      confidenceScore: 0.98,
      chainedSteps: [
        `Extracted Spotify track ID and audio metadata`,
        `Matched corresponding **YouTube Music** audio stream`,
        `Linked official **YouTube Video** embed stream`,
      ],
    };
  }

  // 6. Play Specific Song or Platform
  if (
    text.includes('song') ||
    text.includes('paattu') ||
    text.includes('പാട്ട്') ||
    text.includes('music') ||
    text.includes('spotify') ||
    text.includes('youtube') ||
    text.includes('apple') ||
    text.includes('wynk')
  ) {
    let platform = userPreferences.primaryMusicApp || currentApp;
    if (text.includes('youtube') || text.includes('yt')) platform = 'YouTube Music';
    else if (text.includes('spotify')) platform = 'Spotify';
    else if (text.includes('apple')) platform = 'Apple Music';
    else if (text.includes('wynk')) platform = 'Wynk Music';
    else if (text.includes('amazon')) platform = 'Amazon Music';

    let song = 'Malare Ninne (Premam)';
    let artist = 'Vijay Yesudas';

    if (text.includes('jeevamshamayi') || text.includes('ജീവ അംശമായി')) {
      song = 'Jeevamshamayi (Theevram)';
      artist = 'K. S. Harisankar';
    } else if (text.includes('darshana') || text.includes('ദർശനാ')) {
      song = 'Darshana (Hridayam)';
      artist = 'Hesham Abdul Wahab';
    } else if (text.includes('shape of you')) {
      song = 'Shape of You';
      artist = 'Ed Sheeran';
    } else if (text.includes('blinding lights')) {
      song = 'Blinding Lights';
      artist = 'The Weeknd';
    }

    return {
      actionType: 'MUSIC_PLAY',
      intentSummary: `Playing **"${song}"** by **${artist}** on **${platform}**`,
      responseEn: `Playing **"${song}"** on **${platform}**.`,
      responseMl: `**${platform}**-ൽ **"${song}"** പ്ലേ ചെയ്യുന്നു.`,
      parameters: { songName: song, artistName: artist, platform },
      confidenceScore: 0.97,
      chainedSteps: [`Connected to **${platform}** API`, `Queued track **"${song}"**`],
    };
  }

  // 6. Volume Adjustment
  if (text.includes('volume') || text.includes('sound') || text.includes('ശബ്ദം') || text.includes('ശബ്ദം കൂട്ടുക')) {
    let volAction: 'set' | 'up' | 'down' | 'mute' = 'set';
    let lvl = currentVolume;

    if (text.includes('up') || text.includes('increase') || text.includes('koottoo') || text.includes('കൂട്ടുക')) {
      volAction = 'up';
      lvl = Math.min(100, currentVolume + 20);
    } else if (text.includes('down') || text.includes('decrease') || text.includes('kurakku') || text.includes('കുറയ്ക്കുക')) {
      volAction = 'down';
      lvl = Math.max(0, currentVolume - 20);
    } else if (text.includes('mute') || text.includes('silent')) {
      volAction = 'mute';
      lvl = 0;
    } else {
      const match = text.match(/\d+/);
      if (match) {
        lvl = parseInt(match[0], 10);
      }
    }

    return {
      actionType: 'VOLUME',
      intentSummary: `Adjusted volume to **${lvl}%**`,
      responseEn: `Volume set to **${lvl}%**.`,
      responseMl: `ശബ്ദം **${lvl}%** ആക്കി മാറ്റി.`,
      parameters: { volumeAction: volAction, targetLevel: lvl },
      confidenceScore: 0.98,
    };
  }

  // 7. Bluetooth Audio Devices
  if (
    text.includes('device') ||
    text.includes('airpods') ||
    text.includes('headphone') ||
    text.includes('bluetooth') ||
    text.includes('speaker') ||
    text.includes('bose') ||
    text.includes('car')
  ) {
    let target = userPreferences.preferredDevice || 'AirPods Pro';
    if (text.includes('bose')) target = 'Bose QuietComfort';
    if (text.includes('sony')) target = 'Sony WH-1000XM5';
    if (text.includes('car')) target = 'Car Bluetooth Audio';
    if (text.includes('speaker')) target = 'Phone Speaker';

    return {
      actionType: 'DEVICE',
      intentSummary: `Routed audio output to **${target}**`,
      responseEn: `Connected and routed audio to **${target}**.`,
      responseMl: `ഓഡിയോ **${target}**-ലേക്ക് കണക്ട് ചെയ്തു.`,
      parameters: { targetDevice: target, deviceAction: 'connect' },
      confidenceScore: 0.95,
      chainedSteps: [`Initiated Bluetooth SDP handshake with **${target}**`],
    };
  }

  // Default General Query response
  return {
    actionType: 'GENERAL_QUERY',
    intentSummary: `Processed query: "${cmd}"`,
    responseEn: `Processed request: "${cmd}". How else can I assist?`,
    responseMl: `അഭ്യർത്ഥന നടപ്പിലാക്കി: "${cmd}". എനിക്ക് എങ്ങനെ സഹായിക്കാനാകും?`,
    parameters: {},
    confidenceScore: 0.91,
  };
}

startServer();
