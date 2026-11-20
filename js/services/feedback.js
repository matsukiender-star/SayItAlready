/**
 * Respuesta del juego a cada evento: sonido + vibración.
 * Respeta los interruptores de Ajustes.
 */
import { sounds } from './audio/sounds.js';
import { vibrate } from './native/haptics.js';
import { getSettings } from './storage/settings.js';

function buzz(pattern) {
  if (getSettings().vibrationEnabled) vibrate(pattern);
}

export const feedback = {
  unlock: () => sounds.unlock(),
  correct() { sounds.correct(); buzz(90); },
  skip() { sounds.skip(); buzz([40, 50, 40]); },
  tick(final = false) { sounds.tick(final); buzz(final ? 180 : 60); },
  warning() { sounds.warning(); buzz([90, 70, 90, 70, 90]); },
  timesUp() { sounds.timesUp(); buzz(500); },
  fanfare() { sounds.fanfare(); },
  tap() { buzz(20); },
};
