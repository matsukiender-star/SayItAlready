/**
 * Efectos de sonido sintetizados con Web Audio API (sin archivos de audio).
 * Solo suena si los efectos están activados en Ajustes.
 */
import { getSettings } from '../storage/settings.js';

let ctx = null;

function audioContext() {
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Tono corto con envolvente suave (sin clics). */
function tone(frequency, duration = 0.15, type = 'sine', gain = 0.3, delay = 0) {
  if (!getSettings().soundEnabled) return;
  const ac = audioContext();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const vol = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t0);
  vol.gain.setValueAtTime(0.0001, t0);
  vol.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  vol.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(vol).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sounds = {
  /** Llamar en un gesto del usuario para desbloquear el audio. */
  unlock: () => audioContext(),

  correct() {
    tone(659, 0.09, 'triangle', 0.28);       // Mi
    tone(784, 0.09, 'triangle', 0.28, 0.08); // Sol
    tone(1047, 0.18, 'triangle', 0.3, 0.16); // Do
  },

  skip() {
    tone(392, 0.11, 'sine', 0.3);
    tone(294, 0.16, 'sine', 0.3, 0.11);
  },

  tick(final = false) {
    tone(final ? 880 : 587, final ? 0.25 : 0.1, 'square', 0.12);
  },

  warning() {
    for (let i = 0; i < 3; i++) tone(880, 0.07, 'square', 0.16, i * 0.18);
  },

  timesUp() {
    tone(330, 0.22, 'sawtooth', 0.18);
    tone(220, 0.5, 'sawtooth', 0.2, 0.2);
  },

  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', 0.22, i * 0.11));
  },
};
