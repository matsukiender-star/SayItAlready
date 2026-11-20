/** Permiso y disponibilidad del sensor de orientación. */
import { isNative } from '../native/platform.js';

/**
 * Pide permiso para DeviceOrientationEvent (solo iOS 13+ en la web).
 * Debe llamarse desde un gesto del usuario.
 */
export async function requestTiltPermission() {
  if (typeof DeviceOrientationEvent === 'undefined') return false;
  if (isNative()) return true; // el WebView de Android no pide permiso
  if (typeof DeviceOrientationEvent.requestPermission !== 'function') return true;
  try {
    return (await DeviceOrientationEvent.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

/**
 * Comprueba que el dispositivo realmente envía lecturas.
 * Algunos dan permiso pero nunca emiten eventos.
 */
export function probeTiltAvailable(timeoutMs = 1500) {
  return new Promise((resolve) => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      resolve(false);
      return;
    }
    const finish = (ok) => {
      window.removeEventListener('deviceorientation', handler);
      clearTimeout(timer);
      resolve(ok);
    };
    const handler = (e) => { if (e.beta != null) finish(true); };
    const timer = setTimeout(() => finish(false), timeoutMs);
    window.addEventListener('deviceorientation', handler);
  });
}

/** Permiso + comprobación en un solo paso. */
export async function isTiltUsable(timeoutMs) {
  return (await requestTiltPermission()) && probeTiltAvailable(timeoutMs);
}
