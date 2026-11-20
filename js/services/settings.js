const SETTINGS_KEY = 'diloya-settings';

const DEFAULTS = {
  soundEnabled: true,
  vibrationEnabled: true,
  controlMode: 'gyro',     // 'gyro' | 'touch' | 'swipe'
  timerDuration: 60,       // segundos: 30 | 60 | 90 | 120
  tiltSensitivity: 'media', // 'baja' | 'media' | 'alta'
  debugOverlay: false,
};

let cache = null;

export function getSettings() {
  if (cache) return cache;
  try {
    cache = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
  } catch {
    cache = { ...DEFAULTS };
  }
  return cache;
}

export function updateSettings(partial) {
  const s = getSettings();
  Object.assign(s, partial);
  cache = s;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* sin almacenamiento */ }
}
