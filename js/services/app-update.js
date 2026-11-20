/** Actualizaciones de la versión web: compara version.js y limpia la caché. */
import { APP_VERSION } from '../version.js';

/** Devuelve la versión publicada si es distinta de la actual, o null. */
export async function checkRemoteVersion() {
  try {
    const resp = await fetch(`./js/version.js?cache=off&uid=${Date.now()}`);
    if (!resp.ok) return null;
    const remote = (await resp.text()).match(/APP_VERSION\s*=\s*'([^']+)'/)?.[1];
    return remote && remote !== APP_VERSION ? remote : null;
  } catch {
    return null; // sin conexión
  }
}

/** Borra cachés y service workers y recarga. */
export async function applyUpdate() {
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
  const regs = (await navigator.serviceWorker?.getRegistrations()) ?? [];
  await Promise.all(regs.map((r) => r.unregister()));
  location.reload();
}
