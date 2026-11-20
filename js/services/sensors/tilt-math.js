/**
 * Cálculos de inclinación del teléfono en horizontal.
 *
 * Con el teléfono en la frente, gamma salta en ±90° justo en la posición
 * neutral. Se "desenvuelve" con beta: cuando |beta| > 90, gamma cruzó la
 * singularidad. El resultado es continuo y ~90 significa neutral.
 */

/** Grados de inclinación necesarios según la sensibilidad. */
export const SENSITIVITY_DEGREES = { baja: 38, media: 30, alta: 23 };

/** Límites razonables para la posición neutral calibrada. */
export const CENTER_RANGE = { min: 65, max: 115 };

/**
 * Ángulo normalizado: ~90 = vertical en la frente, mayor = cabeza hacia
 * abajo (acierto), menor = cabeza hacia atrás (pasar).
 */
export function landscapeTilt(beta, gamma) {
  let g = gamma;
  if (Math.abs(beta) > 90) {
    g = g >= 0 ? -(180 - g) : 180 + g;
  }
  return Math.abs(g);
}

/** Promedio de lecturas, limitado a CENTER_RANGE. */
export function calibratedCenter(readings, fallback = 90) {
  if (!readings.length) return fallback;
  const avg = readings.reduce((a, b) => a + b, 0) / readings.length;
  return Math.min(CENTER_RANGE.max, Math.max(CENTER_RANGE.min, avg));
}
