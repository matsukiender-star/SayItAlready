/** Mazos favoritos (localStorage). */
import { readJSON, writeJSON } from './local-store.js';

const FAVORITES_KEY = 'diloya-favorites';

export function getFavorites() {
  return new Set(readJSON(FAVORITES_KEY, []));
}

export function isFavorite(deckId) {
  return getFavorites().has(deckId);
}

/** Marca o desmarca un favorito. Devuelve el nuevo estado. */
export function toggleFavorite(deckId) {
  const favs = getFavorites();
  if (favs.has(deckId)) favs.delete(deckId);
  else favs.add(deckId);
  writeJSON(FAVORITES_KEY, [...favs]);
  return favs.has(deckId);
}
