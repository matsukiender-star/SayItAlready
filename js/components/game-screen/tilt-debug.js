/** Texto del panel de depuración del giroscopio (Ajustes → modo depuración). */
export function formatTiltDebug({ e, angle, delta, center, threshold, state }) {
  return [
    `ángulo:${angle.toFixed(1)} centro:${center.toFixed(1)} Δ:${delta.toFixed(1)} umbral:${threshold}`,
    `β:${e.beta.toFixed(1)} γ:${e.gamma.toFixed(1)} pantalla:${globalThis.screen?.orientation?.angle ?? '?'}`,
    `estado:${state}`,
  ].join('\n');
}
