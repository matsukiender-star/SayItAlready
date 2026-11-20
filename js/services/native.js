/**
 * Capa delgada sobre los plugins de Capacitor (app de Android).
 * En la web cada función usa la API del navegador equivalente.
 * Los plugins se leen de window.Capacitor.Plugins, así no hace falta bundler.
 */

const cap = () => globalThis.Capacitor;
const plugin = (name) => cap()?.Plugins?.[name];

/** true dentro de la app nativa (Android). */
export function isNative() {
  try { return !!cap()?.isNativePlatform?.(); } catch { return false; }
}

/** Bloquea la pantalla en horizontal (modo de juego). */
export async function lockLandscape() {
  const so = plugin('ScreenOrientation');
  try {
    if (isNative() && so) await so.lock({ orientation: 'landscape' });
    else await screen.orientation?.lock?.('landscape');
  } catch { /* no soportado */ }
}

/** Libera la orientación. */
export async function unlockOrientation() {
  const so = plugin('ScreenOrientation');
  try {
    if (isNative() && so) await so.unlock();
    else screen.orientation?.unlock?.();
  } catch { /* no soportado */ }
}

/** Vibración: Haptics en Android, navigator.vibrate en la web. */
export function vibrate(pattern) {
  const haptics = plugin('Haptics');
  if (isNative() && haptics) {
    const total = Array.isArray(pattern)
      ? pattern.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0)
      : pattern;
    haptics.vibrate({ duration: Math.max(20, Math.round(total)) }).catch(() => {});
    return;
  }
  try { navigator.vibrate?.(pattern); } catch { /* sin vibración */ }
}

let wakeLock = null;

/** Mantiene la pantalla encendida durante la partida. */
export async function keepAwake() {
  const ka = plugin('KeepAwake');
  try {
    if (isNative() && ka) { await ka.keepAwake(); return; }
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
  } catch { /* denegado o no soportado */ }
}

export async function allowSleep() {
  const ka = plugin('KeepAwake');
  try {
    if (isNative() && ka) { await ka.allowSleep(); return; }
    await wakeLock?.release();
  } catch { /* nada */ }
  wakeLock = null;
}

/** Oculta/muestra la barra de estado de Android. */
export async function setImmersive(on) {
  const sb = plugin('StatusBar');
  if (!isNative() || !sb) return;
  try { on ? await sb.hide() : await sb.show(); } catch { /* nada */ }
}

/**
 * Botón "atrás" de Android: navega en el historial y, si ya no hay a dónde
 * volver, sale de la app.
 */
export function bindBackButton({ isRoot } = {}) {
  const app = plugin('App');
  if (!isNative() || !app) return;
  app.addListener('backButton', ({ canGoBack }) => {
    if (isRoot?.() || !canGoBack) app.exitApp();
    else history.back();
  });
}

/** Oculta la pantalla de inicio nativa en cuanto la web está lista. */
export function hideSplash() {
  plugin('SplashScreen')?.hide?.().catch?.(() => {});
}
