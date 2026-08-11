// Background Service Worker & Lock-Screen Controller
// Provides Screen Wake Lock API, AudioContext Keep-Alive, Heartbeat Watchdog, & Crash Recovery

export interface BackgroundWorkerStatus {
  isRunning: boolean;
  wakeLockActive: boolean;
  audioKeepAliveActive: boolean;
  watchdogActive: boolean;
  lastHeartbeat: number;
  restartCount: number;
  lockScreenListeningActive: boolean;
  statusMessage: string;
}

type StatusCallback = (status: BackgroundWorkerStatus) => void;

class BackgroundServiceWorker {
  private wakeLockSentinel: any = null;
  private audioContext: AudioContext | null = null;
  private keepAliveOscillator: OscillatorNode | null = null;
  private watchdogTimer: any = null;
  private isRunning: boolean = false;
  private watchdogActive: boolean = false;
  private restartCount: number = 0;
  private lockScreenListeningActive: boolean = false;
  private listeners: Set<StatusCallback> = new Set();

  private status: BackgroundWorkerStatus = {
    isRunning: false,
    wakeLockActive: false,
    audioKeepAliveActive: false,
    watchdogActive: false,
    lastHeartbeat: Date.now(),
    restartCount: 0,
    lockScreenListeningActive: false,
    statusMessage: 'Background Worker Initialized (Standby)',
  };

  constructor() {
    this.setupVisibilityAndLockListeners();
  }

  // Subscribe to status updates
  public subscribe(callback: StatusCallback): () => void {
    this.listeners.add(callback);
    callback(this.getStatus());
    return () => this.listeners.delete(callback);
  }

  private notify() {
    const updatedStatus = this.getStatus();
    this.listeners.forEach((cb) => cb(updatedStatus));
  }

  public getStatus(): BackgroundWorkerStatus {
    return {
      ...this.status,
      isRunning: this.isRunning,
      restartCount: this.restartCount,
      lockScreenListeningActive: this.lockScreenListeningActive,
      lastHeartbeat: Date.now(),
    };
  }

  // Start background service with wake-lock and audio keep-alive
  public async startService(): Promise<boolean> {
    this.isRunning = true;
    this.status.statusMessage = 'Starting Background Foreground Service & Wake Lock...';
    this.notify();

    await this.acquireWakeLock();
    this.startAudioKeepAlive();
    this.startWatchdog();

    this.status.statusMessage = 'Background Service Running (Lock-Screen Active & Keep-Alive Sentinel)';
    this.notify();
    return true;
  }

  // Stop background service
  public stopService() {
    this.isRunning = false;
    this.releaseWakeLock();
    this.stopAudioKeepAlive();
    this.stopWatchdog();

    this.status.statusMessage = 'Background Service Stopped';
    this.notify();
  }

  // Acquire Screen Wake Lock to prevent lock-screen sleep termination
  private async acquireWakeLock(): Promise<boolean> {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      this.status.wakeLockActive = false;
      this.status.statusMessage = 'Wake Lock API not natively supported; using Web Audio Keep-Alive fallback.';
      this.notify();
      return false;
    }

    try {
      this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      this.status.wakeLockActive = true;

      this.wakeLockSentinel.addEventListener('release', () => {
        this.status.wakeLockActive = false;
        // Auto-reacquire if service should be running
        if (this.isRunning) {
          setTimeout(() => this.acquireWakeLock(), 1000);
        }
        this.notify();
      });

      this.notify();
      return true;
    } catch (err) {
      console.warn('Wake Lock acquisition failed:', err);
      this.status.wakeLockActive = false;
      this.notify();
      return false;
    }
  }

  private releaseWakeLock() {
    if (this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel.release();
      } catch {
        // ignore
      }
      this.wakeLockSentinel = null;
    }
    this.status.wakeLockActive = false;
    this.notify();
  }

  // Web Audio keep-alive silent buffer loop to prevent OS background suspension
  private startAudioKeepAlive() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create near-inaudible 15Hz sub-audio pulse to hold audio thread priority
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(15, this.audioContext.currentTime); // sub-audible
      gain.gain.setValueAtTime(0.0001, this.audioContext.currentTime); // silent

      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start();

      this.keepAliveOscillator = osc;
      this.status.audioKeepAliveActive = true;
      this.notify();
    } catch (err) {
      console.warn('Audio Keep-Alive initialization warning:', err);
      this.status.audioKeepAliveActive = false;
    }
  }

  private stopAudioKeepAlive() {
    if (this.keepAliveOscillator) {
      try {
        this.keepAliveOscillator.stop();
        this.keepAliveOscillator.disconnect();
      } catch {
        // ignore
      }
      this.keepAliveOscillator = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {
        // ignore
      }
      this.audioContext = null;
    }
    this.status.audioKeepAliveActive = false;
    this.notify();
  }

  // Heartbeat watchdog with auto-recovery if worker thread hangs
  private startWatchdog() {
    this.watchdogActive = true;
    this.status.watchdogActive = true;

    if (this.watchdogTimer) clearInterval(this.watchdogTimer);

    this.watchdogTimer = setInterval(() => {
      if (!this.isRunning) return;

      // Check AudioContext health
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      // Re-acquire WakeLock if dropped
      if (!this.status.wakeLockActive && 'wakeLock' in navigator) {
        this.acquireWakeLock().catch(() => {});
      }

      this.notify();
    }, 4000);

    this.notify();
  }

  private stopWatchdog() {
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    this.watchdogActive = false;
    this.status.watchdogActive = false;
    this.notify();
  }

  // Crash Recovery restart hook
  public triggerCrashRecovery() {
    this.restartCount += 1;
    this.status.statusMessage = `Crash recovery triggered! Auto-restarting background loop (Attempt ${this.restartCount})...`;
    this.notify();

    this.stopAudioKeepAlive();
    setTimeout(() => {
      this.startService();
    }, 800);
  }

  public setLockScreenListening(enabled: boolean) {
    this.lockScreenListeningActive = enabled;
    this.status.lockScreenListeningActive = enabled;
    if (enabled && !this.isRunning) {
      this.startService();
    } else {
      this.notify();
    }
  }

  private setupVisibilityAndLockListeners() {
    if (typeof window === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isRunning && !this.status.wakeLockActive) {
        this.acquireWakeLock();
      }
    });

    window.addEventListener('focus', () => {
      if (this.isRunning && this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
    });
  }
}

export const backgroundServiceWorker = new BackgroundServiceWorker();
