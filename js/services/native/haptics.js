/** Vibración: plugin Haptics en Android, navigator.vibrate en la web. */
import { nativePlugin } from './platform.js';

/** @param {number|number[]} pattern – ms, o [vibrar, pausa, vibrar…] */
export function vibrate(pattern) {
  const haptics = nativePlugin('Haptics');
  if (haptics) {
    const pulses = Array.isArray(pattern) ? pattern.filter((_, i) => i % 2 === 0) : [pattern];
    const total = pulses.reduce((a, b) => a + b, 0);
    haptics.vibrate({ duration: Math.max(20, Math.round(total)) }).catch(() => {});
    return;
  }
  try {
    navigator.vibrate?.(pattern);
  } catch { /* sin vibración */ }
}
