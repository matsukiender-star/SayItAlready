/** Bloqueo de orientación: horizontal durante la partida. */
import { nativePlugin } from './platform.js';

export async function lockLandscape() {
  try {
    const plugin = nativePlugin('ScreenOrientation');
    if (plugin) await plugin.lock({ orientation: 'landscape' });
    else await screen.orientation?.lock?.('landscape');
  } catch { /* no soportado */ }
}

export async function unlockOrientation() {
  try {
    const plugin = nativePlugin('ScreenOrientation');
    if (plugin) await plugin.unlock();
    else screen.orientation?.unlock?.();
  } catch { /* no soportado */ }
}
