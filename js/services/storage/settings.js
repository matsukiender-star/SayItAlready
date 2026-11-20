/** Ajustes del usuario (localStorage). */
import { readJSON, writeJSON } from './local-store.js';

const SETTINGS_KEY = 'diloya-settings';

const DEFAULTS = {
  soundEnabled: true,
  vibrationEnabled: true,
  controlMode: 'gyro',      // 'gyro' | 'touch' | 'swipe'
  timerDuration: 60,        // segundos: 30 | 60 | 90 | 120
  tiltSensitivity: 'media', // 'baja' | 'media' | 'alta'
  debugOverlay: false,
};

let cache = null;

export function getSettings() {
  cache ??= { ...DEFAULTS, ...readJSON(SETTINGS_KEY, {}) };
  return cache;
}

export function updateSettings(partial) {
  Object.assign(getSettings(), partial);
  writeJSON(SETTINGS_KEY, cache);
}
