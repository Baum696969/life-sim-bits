// Haptic Feedback Manager for Mobile Devices
// Uses the Vibration API for tactile feedback

class HapticsManager {
  private enabled: boolean = true;
  private isSupported: boolean = false;

  constructor() {
    // Check if vibration API is supported
    this.isSupported = 'vibrate' in navigator;
    
    const savedEnabled = localStorage.getItem('gitlife_haptics_enabled');
    this.enabled = savedEnabled !== 'false';
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('gitlife_haptics_enabled', String(enabled));
  }

  isHapticsEnabled(): boolean {
    return this.enabled && this.isSupported;
  }

  isDeviceSupported(): boolean {
    return this.isSupported;
  }

  private vibrate(pattern: number | number[]): void {
    if (!this.enabled || !this.isSupported) return;
    
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Haptic feedback failed:', e);
    }
  }

  // UI Haptics
  lightTap(): void {
    this.vibrate(10);
  }

  mediumTap(): void {
    this.vibrate(25);
  }

  heavyTap(): void {
    this.vibrate(50);
  }

  // Game Action Haptics
  success(): void {
    // Double pulse for success
    this.vibrate([30, 50, 30]);
  }

  error(): void {
    // Long vibration for error
    this.vibrate(100);
  }

  warning(): void {
    // Two short pulses
    this.vibrate([20, 30, 20]);
  }

  // Minigame Haptics
  collect(): void {
    // Quick tap for collecting items
    this.vibrate(15);
  }

  hit(): void {
    // Impact feedback
    this.vibrate(40);
  }

  explosion(): void {
    // Strong rumble pattern
    this.vibrate([50, 30, 80, 30, 50]);
  }

  jump(): void {
    // Light tap for jumping
    this.vibrate(12);
  }

  // Crime Haptics
  heist(): void {
    // Tension building pattern
    this.vibrate([20, 100, 20, 100, 20, 100, 80]);
  }

  alarm(): void {
    // Alarm pattern
    this.vibrate([100, 50, 100, 50, 100]);
  }

  prisonDoor(): void {
    // Heavy slam
    this.vibrate([100, 50, 150]);
  }

  // Life Event Haptics
  celebration(): void {
    // Happy pattern for big events
    this.vibrate([30, 50, 30, 50, 30, 50, 80]);
  }

  heartbeat(): void {
    // Heartbeat pattern (pregnancy, romance)
    this.vibrate([60, 100, 40, 200, 60, 100, 40]);
  }

  death(): void {
    // Fade out pattern
    this.vibrate([150, 100, 100, 100, 50, 100, 25]);
  }

  // Money Haptics
  coins(): void {
    // Quick successive taps
    this.vibrate([10, 20, 10, 20, 10, 20, 10]);
  }

  jackpot(): void {
    // Exciting winning pattern
    this.vibrate([20, 30, 20, 30, 20, 30, 50, 50, 100]);
  }

  // Timer Haptics
  timerTick(): void {
    this.vibrate(5);
  }

  timerWarning(): void {
    this.vibrate([15, 30, 15, 30, 15]);
  }
}

// Singleton instance
export const haptics = new HapticsManager();
