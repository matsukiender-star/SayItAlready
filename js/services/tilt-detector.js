/**
 * Detecta la inclinación del teléfono con DeviceOrientationEvent (giroscopio).
 *
 * Horizontal (modo de juego): se usa gamma, que salta en ±90° justo donde
 * queda el teléfono en la frente. Se "desenvuelve" usando beta: cuando
 * |beta| > 90, gamma cruzó la singularidad. El valor resultante se normaliza
 * para que ~90 sea la posición neutral en ambas orientaciones horizontales.
 *
 * Mejoras de ¡Dilo Ya!:
 *  - Calibración: la posición neutral real se toma al terminar la cuenta 3-2-1.
 *  - Sensibilidad configurable (grados de inclinación necesarios).
 *  - Histéresis + tiempo muerto para evitar dobles conteos.
 */

/** Grados de inclinación necesarios según la sensibilidad. */
export const SENSITIVITY_DEGREES = { baja: 38, media: 30, alta: 23 };

const COOLDOWN_MS = 600;
const NEUTRAL_RATIO = 0.55; // fracción del umbral que cuenta como "volver al centro"

/**
 * Pide permiso para DeviceOrientationEvent (solo iOS 13+).
 * Debe llamarse desde un gesto del usuario.
 */
export async function requestTiltPermission() {
  if (typeof DeviceOrientationEvent === 'undefined') return false;
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const perm = await DeviceOrientationEvent.requestPermission();
      return perm === 'granted';
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Comprueba si el dispositivo realmente envía datos de orientación.
 * Algunos dispositivos dan permiso pero nunca emiten eventos.
 */
export function probeTiltAvailable(timeoutMs = 1500) {
  return new Promise((resolve) => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      resolve(false);
      return;
    }
    let resolved = false;
    const handler = (e) => {
      if (e.beta != null && !resolved) {
        resolved = true;
        window.removeEventListener('deviceorientation', handler);
        resolve(true);
      }
    };
    window.addEventListener('deviceorientation', handler);
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        window.removeEventListener('deviceorientation', handler);
        resolve(false);
      }
    }, timeoutMs);
  });
}

/**
 * Ángulo normalizado en horizontal: ~90 = teléfono vertical en la frente,
 * mayor = cabeza hacia abajo (acierto), menor = cabeza hacia arriba (pasar).
 */
export function landscapeTilt(beta, gamma) {
  let g = gamma;
  if (Math.abs(beta) > 90) {
    g = g >= 0 ? -(180 - g) : (180 + g);
  }
  return Math.abs(g);
}

export class TiltDetector {
  #onCorrect;
  #onSkip;
  #onDebug;
  #active = false;
  #listening = false;
  #handler;
  #state = 'fired'; // empieza "disparado" para que la posición inicial no cuente
  #center = 90;
  #threshold = SENSITIVITY_DEGREES.media;
  #lastFire = -Infinity;
  #recent = []; // últimas lecturas para calibrar
  #now;

  /**
   * @param {object} opts
   * @param {function} opts.onCorrect – cabeza hacia abajo (mirar al suelo)
   * @param {function} opts.onSkip    – cabeza hacia atrás (mirar al cielo)
   * @param {function} [opts.onDebug] – recibe datos de depuración en cada evento
   * @param {'baja'|'media'|'alta'} [opts.sensitivity]
   * @param {function} [opts.now] – reloj (para pruebas)
   */
  constructor({ onCorrect, onSkip, onDebug, sensitivity = 'media', now } = {}) {
    this.#onCorrect = onCorrect;
    this.#onSkip = onSkip;
    this.#onDebug = onDebug;
    this.#threshold = SENSITIVITY_DEGREES[sensitivity] ?? SENSITIVITY_DEGREES.media;
    this.#now = now ?? (() => performance.now());
    this.#handler = (e) => this.feed(e);
  }

  /** Escucha el giroscopio sin contar gestos (para calibrar durante la cuenta). */
  listen() {
    if (this.#listening) return;
    this.#listening = true;
    window.addEventListener('deviceorientation', this.#handler);
  }

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

  /** Centro neutral calibrado (grados). */
  get center() { return this.#center; }

  /**
   * Toma como posición neutral el promedio de las lecturas recientes.
   * Si el teléfono está en una posición absurda (p. ej. sobre la mesa),
   * se limita a un rango razonable.
   */
  calibrate() {
    if (this.#recent.length === 0) return this.#center;
    const avg = this.#recent.reduce((a, b) => a + b, 0) / this.#recent.length;
    this.#center = Math.min(115, Math.max(65, avg));
    return this.#center;
  }

  /** Procesa un evento de orientación (público para pruebas). */
  feed(e) {
    if (e.beta == null || e.gamma == null) return;
    const n = landscapeTilt(e.beta, e.gamma);
    this.#recent.push(n);
    if (this.#recent.length > 12) this.#recent.shift();
    if (!this.#active) return;

    const delta = n - this.#center;
    const inNeutral = Math.abs(delta) <= this.#threshold * NEUTRAL_RATIO;
    const tiltDown = delta > this.#threshold;  // cabeza hacia abajo → acierto
    const tiltUp = delta < -this.#threshold;   // cabeza hacia atrás → pasar
    const cooling = this.#now() - this.#lastFire < COOLDOWN_MS;

    if (this.#state === 'fired') {
      if (inNeutral && !cooling) this.#state = 'neutral';
    } else if (tiltDown || tiltUp) {
      this.#state = 'fired';
      this.#lastFire = this.#now();
      if (tiltDown) this.#onCorrect?.();
      else this.#onSkip?.();
    }

    this.#onDebug?.({
      beta: e.beta.toFixed(1),
      gamma: e.gamma.toFixed(1),
      angle: globalThis.screen?.orientation?.angle ?? '?',
      state: this.#state,
      tiltUp,
      tiltDown,
      inNeutral,
      extra: `n:${n.toFixed(1)} centro:${this.#center.toFixed(1)} Δ:${delta.toFixed(1)} umbral:${this.#threshold}`,
    });
  }
}
