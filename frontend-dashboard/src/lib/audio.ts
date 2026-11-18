// Web Audio API Micro-Haptics Engine
// Zero external audio files; pure synthesized physical clicks, thuds, and pulses.

class SoundEngine {
  private ctx: AudioContext | null = null;
  // Muted by default (opt-in audio haptics per WCAG 2.2 AA / M10)
  private isMuted: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("audio_muted");
      this.isMuted = saved !== "false";
    }
  }

  private initCtx() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("audio_muted", String(this.isMuted));
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public click() {
    this.playTick();
  }

  // Tonal chime when audit completes or recovery is unlocked
  public playSuccess() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio policy
    }
  }

  // Soft mechanical tick (like an Apple Watch digital crown or Leica shutter)
  public playTick() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.015);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.018);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Rich positive confirmation click (when toggling concepts or locking coordinates)
  public playLock() {
    this.playPseudoHaptic();
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // 18ms dual-stage physical pseudo-haptic recoil engine
  // Simulates Leica mechanical shutter recoil / Sony camera dial tactile pulse
  public playPseudoHaptic() {
    if (this.isMuted) return;

    // Real mobile device haptic vibration strictly after explicit user gesture
    if (
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      typeof navigator.vibrate === "function" &&
      (navigator as unknown as { userActivation?: { hasBeenActive?: boolean } }).userActivation?.hasBeenActive
    ) {
      try {
        navigator.vibrate([16, 32, 16]);
      } catch {
        // Ignore vibration permission denials
      }
    }

    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;

      // 1. Low sub-bass physical thump (90Hz -> 45Hz) for perceived mass
      const oscLow = ctx.createOscillator();
      const gainLow = ctx.createGain();
      oscLow.type = "sine";
      oscLow.frequency.setValueAtTime(90, t);
      oscLow.frequency.exponentialRampToValueAtTime(45, t + 0.024);
      gainLow.gain.setValueAtTime(0.08, t);
      gainLow.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      oscLow.connect(gainLow);
      gainLow.connect(ctx.destination);
      oscLow.start(t);
      oscLow.stop(t + 0.026);

      // 2. High mechanical transient snap (780Hz -> 320Hz)
      const oscHigh = ctx.createOscillator();
      const gainHigh = ctx.createGain();
      oscHigh.type = "triangle";
      oscHigh.frequency.setValueAtTime(780, t);
      oscHigh.frequency.exponentialRampToValueAtTime(320, t + 0.018);
      gainHigh.gain.setValueAtTime(0.05, t);
      gainHigh.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      oscHigh.connect(gainHigh);
      gainHigh.connect(ctx.destination);
      oscHigh.start(t);
      oscHigh.stop(t + 0.022);
    } catch {
      // Audio policy
    }
  }

  // Heavy mechanical reticle lock-on (for locating discrepancies or selecting bounding boxes)
  public playReticleLock() {
    this.playPseudoHaptic();
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      // Dual harmonic radar lock: 340Hz fundamental + 1020Hz third harmonic
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(340, t);
      osc1.frequency.exponentialRampToValueAtTime(510, t + 0.08);
      gain1.gain.setValueAtTime(0.05, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.12);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(680, t + 0.015);
      osc2.frequency.exponentialRampToValueAtTime(1020, t + 0.09);
      gain2.gain.setValueAtTime(0.03, t + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t + 0.015);
      osc2.stop(t + 0.1);
    } catch {
      // Audio policy
    }
  }

  // Laser scanner sweep sound (subtle futuristic hum)
  public playScanSweep() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Deep warning thud for critical 1592 statutory exposure
  public playAlert() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const sound = new SoundEngine();
export const soundEngine = sound;
