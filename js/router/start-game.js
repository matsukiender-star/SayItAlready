/** Pasa de la pantalla de inicio a la partida (game.html). */
import { recordPlay } from '../services/storage/play-history.js';
import { getSettings } from '../services/storage/settings.js';
import { isTiltUsable } from '../services/sensors/tilt-permission.js';

/** Debe llamarse desde un gesto del usuario (permiso del giroscopio en iOS). */
export async function startGame({ deck, difficulty }) {
  recordPlay(deck.id);
  const tilt = getSettings().controlMode === 'gyro' && (await isTiltUsable(1500));
  const params = new URLSearchParams({
    deck: deck.id,
    difficulty: String(difficulty),
    tilt: tilt ? '1' : '0',
  });
  location.href = `game.html?${params}`;
}

export function gameUrl(deckId) {
  return `game.html?${new URLSearchParams({ deck: deckId })}`;
}
