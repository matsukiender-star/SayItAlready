/** Historial de mazos jugados: { deckId: timestamp } (localStorage). */
import { readJSON, writeJSON } from './local-store.js';

const HISTORY_KEY = 'diloya-play-history';

export function getPlayHistory() {
  return readJSON(HISTORY_KEY, {});
}

export function recordPlay(deckId) {
  writeJSON(HISTORY_KEY, { ...getPlayHistory(), [deckId]: Date.now() });
}

export function hasPlayedAny() {
  return Object.keys(getPlayHistory()).length > 0;
}
