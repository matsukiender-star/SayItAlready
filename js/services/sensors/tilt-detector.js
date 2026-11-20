/**
 * Convierte las lecturas del giroscopio en gestos de acierto / pasar.
 *
 *  - Calibración: la posición neutral se toma de las últimas lecturas.
 *  - Sensibilidad: grados necesarios para contar un gesto.
 *  - Histéresis + tiempo muerto: hay que volver al centro y esperar
 *    COOLDOWN_MS para contar otro gesto (evita dobles conteos).
 */
import { SENSITIVITY_DEGREES, landscapeTilt, calibratedCenter } from './tilt-math.js';

const COOLDOWN_MS = 600;
const NEUTRAL_RATIO = 0.55; // fracción del umbral que cuenta como "centro"
const MAX_READINGS = 12;

export class TiltDetector {
  #onCorrect;
  #onSkip;
  #onDebug;
  #now;
  #handler = (e) => this.feed(e);
  #active = false;
  #listening = false;
  #state = 'fired'; // empieza "disparado": la posición inicial no cuenta
  #center = 90;
  #threshold;
  #lastFire = -Infinity;
  #readings = [];

  /**
   * @param {object} opts
   * @param {function} opts.onCorrect – cabeza hacia abajo
   * @param {function} opts.onSkip    – cabeza hacia atrás
   * @param {function} [opts.onDebug] – datos de cada lectura
   * @param {'baja'|'media'|'alta'} [opts.sensitivity]
   * @param {function} [opts.now]     – reloj inyectable (pruebas)
   */
  constructor({ onCorrect, onSkip, onDebug, sensitivity = 'media', now } = {}) {
    this.#onCorrect = onCorrect;
    this.#onSkip = onSkip;
    this.#onDebug = onDebug;
    this.#threshold = SENSITIVITY_DEGREES[sensitivity] ?? SENSITIVITY_DEGREES.media;
    this.#now = now ?? (() => performance.now());
  }

  get center() { return this.#center; }

  /** Lee el sensor sin contar gestos (para calibrar). */
  listen() {
    if (this.#listening) return;
    this.#listening = true;
    window.addEventListener('deviceorientation', this.#handler);
  }

  /** Empieza a contar gestos. */
  start() {
    if (this.#active) return;
    this.#active = true;
    this.#state = 'fired';
    this.listen();
  }

  stop() {
    this.#active = false;
    this.#listening = false;
    window.removeEventListener('deviceorientation', this.#handler);
  }

  /** Fija la posición neutral con las lecturas recientes. */
  calibrate() {
    this.#center = calibratedCenter(this.#readings, this.#center);
    return this.#center;
  }

  /** Procesa una lectura (público para las pruebas). */
  feed(e) {
    if (e.beta == null || e.gamma == null) return;
    const angle = landscapeTilt(e.beta, e.gamma);
    this.#readings.push(angle);
    if (this.#readings.length > MAX_READINGS) this.#readings.shift();
    if (!this.#active) return;

    const delta = angle - this.#center;
    const inNeutral = Math.abs(delta) <= this.#threshold * NEUTRAL_RATIO;
    const tiltDown = delta > this.#threshold;
    const tiltUp = delta < -this.#threshold;

    if (this.#state === 'fired') {
      const cooling = this.#now() - this.#lastFire < COOLDOWN_MS;
      if (inNeutral && !cooling) this.#state = 'neutral';
    } else if (tiltDown || tiltUp) {
      this.#state = 'fired';
      this.#lastFire = this.#now();
      if (tiltDown) this.#onCorrect?.();
      else this.#onSkip?.();
    }

    this.#onDebug?.({ e, angle, delta, center: this.#center, threshold: this.#threshold, state: this.#state });
  }
}
