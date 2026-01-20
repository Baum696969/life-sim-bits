// Sound Manager for GitLife
// Uses Web Audio API for rich sound effects

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmVolume: number = 0.3;
  private masterVolume: number = 0.5;

  constructor() {
    const savedEnabled = localStorage.getItem('gitlife_sound_enabled');
    this.enabled = savedEnabled !== 'false';
    
    const savedVolume = localStorage.getItem('gitlife_master_volume');
    if (savedVolume) {
      this.masterVolume = parseFloat(savedVolume);
    }
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

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('gitlife_master_volume', String(this.masterVolume));
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

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

      const adjustedVolume = volume * this.masterVolume;
      gainNode.gain.setValueAtTime(adjustedVolume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Complex sound with multiple oscillators
  private createChord(frequencies: number[], duration: number, type: OscillatorType = 'sine', volume: number = 0.15): void {
    frequencies.forEach(freq => {
      this.createOscillatorSound(freq, duration, type, volume);
    });
  }

  // UI Sounds
  playClick(): void {
    this.createOscillatorSound(880, 0.04, 'sine', 0.15);
    setTimeout(() => this.createOscillatorSound(1100, 0.03, 'sine', 0.1), 20);
  }

  playHover(): void {
    this.createOscillatorSound(600, 0.02, 'sine', 0.08);
  }

  playButtonPress(): void {
    this.createOscillatorSound(200, 0.05, 'square', 0.1);
    this.createOscillatorSound(400, 0.03, 'sine', 0.1);
  }

  playToggle(): void {
    this.createOscillatorSound(523, 0.05, 'sine', 0.15);
    setTimeout(() => this.createOscillatorSound(784, 0.08, 'sine', 0.12), 40);
  }

  // Game Sounds
  playPositiveEffect(): void {
    if (!this.enabled) return;
    // Bright ascending arpeggio
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.createOscillatorSound(freq, 0.12, 'sine', 0.2), i * 60);
    });
  }

  playNegativeEffect(): void {
    if (!this.enabled) return;
    // Dark descending notes
    setTimeout(() => this.createOscillatorSound(311, 0.15, 'sawtooth', 0.12), 0);
    setTimeout(() => this.createOscillatorSound(233, 0.2, 'sawtooth', 0.1), 100);
  }

  playLevelUp(): void {
    if (!this.enabled) return;
    // Epic fanfare
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillatorSound(freq, 0.2, 'sine', 0.2);
        this.createOscillatorSound(freq * 0.5, 0.2, 'triangle', 0.1);
      }, i * 80);
    });
  }

  playGameOver(): void {
    if (!this.enabled) return;
    // Dramatic game over
    const notes = [392, 349, 311, 277, 247];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillatorSound(freq, 0.3, 'triangle', 0.2);
        this.createOscillatorSound(freq * 0.5, 0.3, 'sine', 0.1);
      }, i * 200);
    });
  }

  playNewYear(): void {
    if (!this.enabled) return;
    // Celebration bells
    this.createChord([880, 1109, 1319], 0.3, 'sine', 0.15);
    setTimeout(() => this.createChord([1047, 1319, 1568], 0.4, 'sine', 0.12), 200);
  }

  playMinigameStart(): void {
    if (!this.enabled) return;
    // Exciting arcade start
    const notes = [262, 330, 392, 523, 659];
    notes.forEach((freq, i) => {
      setTimeout(() => this.createOscillatorSound(freq, 0.06, 'square', 0.12), i * 40);
    });
  }

  playMinigameWin(): void {
    if (!this.enabled) return;
    // Victory fanfare - epic!
    const melody = [523, 523, 523, 698, 784, 698, 784, 1047];
    const durations = [0.08, 0.08, 0.08, 0.12, 0.2, 0.08, 0.15, 0.4];
    let time = 0;
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillatorSound(freq, durations[i], 'sine', 0.2);
        this.createOscillatorSound(freq * 0.5, durations[i], 'triangle', 0.1);
      }, time);
      time += durations[i] * 400;
    });
  }

  playMinigameLose(): void {
    if (!this.enabled) return;
    // Sad trombone
    const notes = [349, 330, 311, 294, 277];
    notes.forEach((freq, i) => {
      setTimeout(() => this.createOscillatorSound(freq, 0.2, 'sawtooth', 0.1), i * 180);
    });
  }

  playCoins(): void {
    if (!this.enabled) return;
    // Coin collect - multiple chimes
    this.createOscillatorSound(1047, 0.04, 'sine', 0.15);
    setTimeout(() => this.createOscillatorSound(1319, 0.06, 'sine', 0.12), 40);
    setTimeout(() => this.createOscillatorSound(1568, 0.08, 'sine', 0.1), 80);
  }

  playCardFlip(): void {
    this.createOscillatorSound(300, 0.02, 'sine', 0.1);
    setTimeout(() => this.createOscillatorSound(600, 0.03, 'sine', 0.08), 20);
  }

  playMatch(): void {
    if (!this.enabled) return;
    this.createChord([659, 784, 988], 0.15, 'sine', 0.12);
  }

  // NEW SOUNDS
  playSchoolBell(): void {
    if (!this.enabled) return;
    // Classic school bell
    this.createOscillatorSound(880, 0.5, 'sine', 0.2);
    setTimeout(() => this.createOscillatorSound(880, 0.5, 'sine', 0.15), 300);
  }

  playJobPromotion(): void {
    if (!this.enabled) return;
    // Triumphant promotion sound
    const notes = [392, 523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillatorSound(freq, 0.15, 'sine', 0.18);
        this.createOscillatorSound(freq * 1.5, 0.15, 'triangle', 0.08);
      }, i * 100);
    });
  }

  playCrimeSuccess(): void {
    if (!this.enabled) return;
    // Sneaky success
    this.createOscillatorSound(200, 0.1, 'triangle', 0.15);
    setTimeout(() => this.createOscillatorSound(300, 0.1, 'triangle', 0.12), 80);
    setTimeout(() => this.createOscillatorSound(400, 0.15, 'sine', 0.1), 160);
  }

  playCrimeFail(): void {
    if (!this.enabled) return;
    // Alarm / caught
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createOscillatorSound(800, 0.1, 'square', 0.15);
        this.createOscillatorSound(600, 0.1, 'square', 0.12);
      }, i * 150);
    }
  }

  playPrisonDoor(): void {
    if (!this.enabled) return;
    // Heavy metal door slam
    this.createOscillatorSound(80, 0.3, 'sawtooth', 0.2);
    setTimeout(() => this.createOscillatorSound(60, 0.4, 'square', 0.15), 100);
  }

  playBottleCollect(): void {
    if (!this.enabled) return;
    // Glass clink
    this.createOscillatorSound(2000, 0.03, 'sine', 0.1);
    setTimeout(() => this.createOscillatorSound(2400, 0.04, 'sine', 0.08), 30);
  }

  playShoot(): void {
    if (!this.enabled) return;
    // Laser pew
    this.createOscillatorSound(800, 0.05, 'square', 0.1);
    this.createOscillatorSound(400, 0.08, 'sawtooth', 0.08);
  }

  playExplosion(): void {
    if (!this.enabled) return;
    // Explosion
    this.createOscillatorSound(80, 0.2, 'sawtooth', 0.2);
    this.createOscillatorSound(60, 0.25, 'square', 0.15);
    setTimeout(() => this.createOscillatorSound(40, 0.3, 'sawtooth', 0.1), 50);
  }

  playHit(): void {
    if (!this.enabled) return;
    this.createOscillatorSound(150, 0.1, 'square', 0.15);
  }

  playHealthUp(): void {
    if (!this.enabled) return;
    // Healing sound
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.createOscillatorSound(freq, 0.1, 'sine', 0.12), i * 50);
    });
  }

  playHealthDown(): void {
    if (!this.enabled) return;
    // Damage sound
    this.createOscillatorSound(200, 0.15, 'sawtooth', 0.15);
    setTimeout(() => this.createOscillatorSound(150, 0.2, 'square', 0.1), 50);
  }

  playAgeUp(): void {
    if (!this.enabled) return;
    // Birthday celebration
    const melody = [523, 523, 587, 523, 698, 659];
    melody.forEach((freq, i) => {
      setTimeout(() => this.createOscillatorSound(freq, 0.15, 'sine', 0.15), i * 120);
    });
  }

  playTimerTick(): void {
    this.createOscillatorSound(1000, 0.02, 'sine', 0.05);
  }

  playTimerWarning(): void {
    if (!this.enabled) return;
    this.createOscillatorSound(880, 0.1, 'square', 0.12);
  }

  playCorrectAnswer(): void {
    if (!this.enabled) return;
    this.createOscillatorSound(880, 0.08, 'sine', 0.15);
    setTimeout(() => this.createOscillatorSound(1047, 0.1, 'sine', 0.12), 60);
  }

  playWrongAnswer(): void {
    if (!this.enabled) return;
    this.createOscillatorSound(200, 0.15, 'sawtooth', 0.12);
  }

  playEventAppear(): void {
    if (!this.enabled) return;
    // Whoosh + chime
    this.createOscillatorSound(300, 0.08, 'sine', 0.08);
    setTimeout(() => this.createOscillatorSound(600, 0.1, 'sine', 0.1), 50);
    setTimeout(() => this.createOscillatorSound(900, 0.08, 'sine', 0.08), 100);
  }

  playOptionSelect(): void {
    if (!this.enabled) return;
    this.createOscillatorSound(523, 0.04, 'sine', 0.12);
    setTimeout(() => this.createOscillatorSound(659, 0.06, 'sine', 0.1), 30);
  }

  // Background Music
  startBackgroundMusic(): void {
    if (!this.enabled) return;
    this.playAmbientLoop();
  }

  private ambientInterval: NodeJS.Timeout | null = null;

  private playAmbientLoop(): void {
    if (!this.enabled) return;
    
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
    }

    const playAmbientNote = () => {
      if (!this.enabled) return;
      
      const ctx = this.getContext();
      const notes = [130.81, 164.81, 196, 220, 261.63]; // C3, E3, G3, A3, C4
      const note = notes[Math.floor(Math.random() * notes.length)];
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note, ctx.currentTime);
      
      const vol = 0.03 * this.masterVolume;
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.5);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 3);
    };

    // Play note every 3-5 seconds
    this.ambientInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        playAmbientNote();
      }
    }, 3500);
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
