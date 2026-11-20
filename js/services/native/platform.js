/**
 * Detección de la app nativa (Capacitor) y acceso a sus plugins.
 * Los plugins se leen de window.Capacitor.Plugins: no hace falta bundler.
 */

/** true dentro de la app de Android. */
export function isNative() {
  try {
    return !!globalThis.Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

/** Plugin nativo por nombre, o null en la web. */
export function nativePlugin(name) {
  return isNative() ? globalThis.Capacitor?.Plugins?.[name] ?? null : null;
}
