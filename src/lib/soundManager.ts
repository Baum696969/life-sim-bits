// Sound Manager for GitLife
// Uses Web Audio API for sound effects

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmVolume: number = 0.3;

  constructor() {
    // Load preference from localStorage
    const savedEnabled = localStorage.getItem('gitlife_sound_enabled');
    this.enabled = savedEnabled !== 'false';
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('gitlife_sound_enabled', String(enabled));
    
    if (!enabled && this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Generate simple sounds using Web Audio API
  private createOscillatorSound(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ): void {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // UI Sounds
  playClick(): void {
    this.createOscillatorSound(800, 0.05, 'sine', 0.2);
  }

  playHover(): void {
    this.createOscillatorSound(600, 0.03, 'sine', 0.1);
  }

  // Game Sounds
  playPositiveEffect(): void {
    if (!this.enabled) return;
    // Ascending notes for positive feedback
    setTimeout(() => this.createOscillatorSound(523, 0.1, 'sine', 0.25), 0);
    setTimeout(() => this.createOscillatorSound(659, 0.1, 'sine', 0.25), 100);
    setTimeout(() => this.createOscillatorSound(784, 0.15, 'sine', 0.25), 200);
  }

  playNegativeEffect(): void {
    if (!this.enabled) return;
    // Descending notes for negative feedback
    setTimeout(() => this.createOscillatorSound(400, 0.1, 'square', 0.2), 0);
    setTimeout(() => this.createOscillatorSound(300, 0.15, 'square', 0.2), 100);
  }

  playLevelUp(): void {
    if (!this.enabled) return;
    // Celebratory arpeggio
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.createOscillatorSound(freq, 0.15, 'sine', 0.25), i * 80);
    });
  }

  playGameOver(): void {
    if (!this.enabled) return;
    // Sad descending melody
    const notes = [392, 349, 330, 294, 262];
    notes.forEach((freq, i) => {
      setTimeout(() => this.createOscillatorSound(freq, 0.2, 'triangle', 0.25), i * 150);
    });
  }

  playNewYear(): void {
    if (!this.enabled) return;
    // Bell-like sound for new year
    this.createOscillatorSound(880, 0.3, 'sine', 0.3);
    setTimeout(() => this.createOscillatorSound(1320, 0.3, 'sine', 0.2), 150);
  }

  playMinigameStart(): void {
    if (!this.enabled) return;
    // Exciting start sound
    const notes = [262, 330, 392, 523];
    notes.forEach((freq, i) => {
      setTimeout(() => this.createOscillatorSound(freq, 0.08, 'square', 0.15), i * 50);
    });
  }

  playMinigameWin(): void {
    if (!this.enabled) return;
    // Victory fanfare
    const melody = [523, 523, 523, 698, 784, 698, 784];
    const durations = [0.1, 0.1, 0.1, 0.15, 0.3, 0.1, 0.4];
    let time = 0;
    melody.forEach((freq, i) => {
      setTimeout(() => this.createOscillatorSound(freq, durations[i], 'sine', 0.25), time);
      time += durations[i] * 500;
    });
  }

  playMinigameLose(): void {
    if (!this.enabled) return;
    // Sad trombone
    const notes = [349, 330, 311, 294];
    notes.forEach((freq, i) => {
      setTimeout(() => this.createOscillatorSound(freq, 0.25, 'sawtooth', 0.15), i * 200);
    });
  }

  playCoins(): void {
    if (!this.enabled) return;
    // Coin collect sound
    this.createOscillatorSound(1047, 0.05, 'sine', 0.2);
    setTimeout(() => this.createOscillatorSound(1319, 0.08, 'sine', 0.2), 50);
  }

  playCardFlip(): void {
    this.createOscillatorSound(400, 0.03, 'sine', 0.15);
  }

  playMatch(): void {
    if (!this.enabled) return;
    this.createOscillatorSound(659, 0.1, 'sine', 0.25);
    setTimeout(() => this.createOscillatorSound(784, 0.1, 'sine', 0.25), 80);
  }

  // Background Music using simple oscillator-based ambient
  startBackgroundMusic(): void {
    if (!this.enabled) return;
    
    // Create ambient background with subtle drone
    this.playAmbientLoop();
  }

  private ambientInterval: NodeJS.Timeout | null = null;

  private playAmbientLoop(): void {
    if (!this.enabled) return;
    
    // Clear existing interval
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
    }

    // Play subtle ambient notes periodically
    const playAmbientNote = () => {
      if (!this.enabled) return;
      
      const ctx = this.getContext();
      const notes = [130.81, 164.81, 196, 220]; // C3, E3, G3, A3
      const note = notes[Math.floor(Math.random() * notes.length)];
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.5);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 3);
    };

    // Play note every 4-6 seconds
    this.ambientInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        playAmbientNote();
      }
    }, 4000);
  }

  stopBackgroundMusic(): void {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }
  }
}

// Singleton instance
export const soundManager = new SoundManager();
