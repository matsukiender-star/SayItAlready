/** Registro del service worker (solo en la versión web, nunca en el APK). */
import { isNative } from './native/platform.js';

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || isNative()) return;
  navigator.serviceWorker.register('./sw.js').catch((err) => {
    console.warn('No se pudo registrar el service worker:', err);
  });
}
