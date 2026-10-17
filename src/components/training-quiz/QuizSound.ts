/**
 * Zero-dependency Web Audio API Synthesizer for Quiz Sound Effects
 * (Countdown tick, Question start, Correct ding, Wrong buzzer, Streak & Podium fanfares)
 *
 * Fully SSR-safe and works without external audio files.
 */

class QuizSoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private unlocked: boolean = false;

  constructor() {
    // AudioContext will be lazily initialized on client side
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch {
          this.ctx = null;
        }
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Unlock audio on first user touch / click
   */
  public unlockAudio(): void {
    if (this.unlocked) return;
    const ctx = this.getContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          this.unlocked = true;
        }).catch(() => {});
      } else {
        this.unlocked = true;
      }
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public mute(): void {
    this.muted = true;
  }

  public unmute(): void {
    this.muted = false;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  /**
   * Synthesize a note with frequency, type, duration, and gain envelope
   */
  private playTone(
    freq: number,
    durationMs: number,
    type: OscillatorType = 'sine',
    gainLevel: number = 0.2,
    delayMs: number = 0
  ): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delayMs / 1000;
    const endTime = startTime + durationMs / 1000;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(endTime + 0.05);
    } catch {
      // Ignore audio synthesis errors on restricted devices
    }
  }

  /**
   * 15s Countdown tick (normal)
   */
  public playTick(): void {
    this.playTone(880, 60, 'sine', 0.15);
  }

  /**
   * Urgent fast countdown tick (last 3-5 seconds)
   */
  public playTickFast(): void {
    this.playTone(1320, 80, 'triangle', 0.25);
  }

  /**
   * Question start sound
   */
  public playQuestionStart(): void {
    this.playTone(523.25, 120, 'sine', 0.2, 0); // C5
    this.playTone(659.25, 120, 'sine', 0.2, 100); // E5
    this.playTone(783.99, 220, 'sine', 0.25, 200); // G5
  }

  /**
   * Correct Answer Ding (Joyful Arpeggio)
   */
  public playCorrect(): void {
    this.playTone(523.25, 100, 'triangle', 0.25, 0); // C5
    this.playTone(659.25, 100, 'triangle', 0.25, 80); // E5
    this.playTone(783.99, 120, 'triangle', 0.3, 160); // G5
    this.playTone(1046.5, 350, 'sine', 0.35, 240); // C6
  }

  /**
   * Wrong Answer Buzzer (Dissonant descending buzz)
   */
  public playWrong(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.35);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Audio error fallback
    }
  }

  /**
   * Streak bonus fanfare
   */
  public playStreak(): void {
    this.playTone(587.33, 90, 'sine', 0.25, 0); // D5
    this.playTone(739.99, 90, 'sine', 0.25, 90); // F#5
    this.playTone(880.0, 90, 'sine', 0.3, 180); // A5
    this.playTone(1174.66, 320, 'triangle', 0.35, 270); // D6
  }

  /**
   * Grand victory / Podium fanfare
   */
  public playPodium(): void {
    // Triumphant orchestral fanfare pattern
    const notes = [
      { freq: 523.25, dur: 120, delay: 0 }, // C5
      { freq: 523.25, dur: 120, delay: 140 }, // C5
      { freq: 523.25, dur: 120, delay: 280 }, // C5
      { freq: 659.25, dur: 320, delay: 420 }, // E5
      { freq: 587.33, dur: 140, delay: 760 }, // D5
      { freq: 659.25, dur: 140, delay: 920 }, // E5
      { freq: 783.99, dur: 450, delay: 1080 }, // G5
      { freq: 1046.5, dur: 800, delay: 1550 }, // C6
    ];

    notes.forEach((n) => {
      this.playTone(n.freq, n.dur, 'triangle', 0.3, n.delay);
    });
  }
}

export const quizSound = new QuizSoundEngine();
export default quizSound;
