/** Barra de estado y pantalla de carga nativas (solo Android). */
import { nativePlugin } from './platform.js';

export async function setImmersive(on) {
  const statusBar = nativePlugin('StatusBar');
  if (!statusBar) return;
  try {
    if (on) await statusBar.hide();
    else await statusBar.show();
  } catch { /* nada */ }
}

export function hideSplash() {
  nativePlugin('SplashScreen')?.hide().catch(() => {});
}
