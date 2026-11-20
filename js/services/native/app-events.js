/** Eventos de la app de Android: botón atrás y paso a segundo plano. */
import { nativePlugin } from './platform.js';

/**
 * @param {(info: {canGoBack: boolean}) => void} handler
 */
export function onBackButton(handler) {
  nativePlugin('App')?.addListener('backButton', handler);
}

export function onAppPause(handler) {
  nativePlugin('App')?.addListener('pause', handler);
}

export function exitApp() {
  nativePlugin('App')?.exitApp();
}
