/** Mantiene la pantalla encendida durante la partida. */
import { nativePlugin } from './platform.js';

let webLock = null;

export async function keepAwake() {
  try {
    const plugin = nativePlugin('KeepAwake');
    if (plugin) await plugin.keepAwake();
    else if ('wakeLock' in navigator) webLock = await navigator.wakeLock.request('screen');
  } catch { /* denegado o no soportado */ }
}

export async function allowSleep() {
  try {
    const plugin = nativePlugin('KeepAwake');
    if (plugin) await plugin.allowSleep();
    else await webLock?.release();
  } catch { /* nada que liberar */ }
  webLock = null;
}
