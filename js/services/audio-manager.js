/**
 * Efectos de sonido (Web Audio API, sin archivos de audio) y vibración.
 */
import { getSettings } from './settings.js';
import { vibrate } from './native.js';

export class AudioManager {
  #ctx = null;

  #ensureContext() {
    if (!this.#ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.#ctx = new Ctx();
    }
    if (this.#ctx.state === 'suspended') {
      this.#ctx.resume();
    }
    return this.#ctx;
  }

  /** Tono corto con envolvente suave. */
  #playTone(frequency, duration = 0.15, type = 'sine', gain = 0.3, delay = 0) {
    if (!getSettings().soundEnabled) return;
    const ctx = this.#ensureContext();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t0);
    vol.gain.setValueAtTime(0.0001, t0);
    vol.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    vol.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(vol).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  #vibrate(pattern) {
    if (!getSettings().vibrationEnabled) return;
    vibrate(pattern);
  }

  /** Acierto: arpegio ascendente brillante + vibración corta. */
  correct() {
    this.#playTone(659, 0.09, 'triangle', 0.28);        // E5
    this.#playTone(784, 0.09, 'triangle', 0.28, 0.08);  // G5
    this.#playTone(1047, 0.18, 'triangle', 0.3, 0.16);  // C6
    this.#vibrate(90);
  }

  /** Pasar: dos tonos descendentes + doble vibración. */
  skip() {
    this.#playTone(392, 0.11, 'sine', 0.3);
    this.#playTone(294, 0.16, 'sine', 0.3, 0.11);
    this.#vibrate([40, 50, 40]);
  }

  /** Cuenta regresiva 3-2-1. */
  tick(final = false) {
    this.#playTone(final ? 880 : 587, final ? 0.25 : 0.1, 'square', 0.12);
    this.#vibrate(final ? 180 : 60);
  }

  /** Últimos segundos. */
  warning() {
    for (let i = 0; i < 3; i++) this.#playTone(880, 0.07, 'square', 0.16, i * 0.18);
    this.#vibrate([90, 70, 90, 70, 90]);
  }

  /** Se acabó el tiempo. */
  timesUp() {
    this.#playTone(330, 0.22, 'sawtooth', 0.18);
    this.#playTone(220, 0.5, 'sawtooth', 0.2, 0.2);
    this.#vibrate(500);
  }

  /** Fanfarria del resumen. */
  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => this.#playTone(f, 0.16, 'triangle', 0.22, i * 0.11));
  }

  /** Llamar en un gesto del usuario para desbloquear el audio. */
  unlock() {
    this.#ensureContext();
  }
}
