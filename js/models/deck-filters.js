/** Búsqueda y orden de mazos. */
import { normalizeText } from '../utils/text.js';
import { deckInCategory } from './categories.js';
import { getFavorites } from '../services/storage/favorites.js';
import { getPlayHistory } from '../services/storage/play-history.js';

/** ¿El mazo contiene el texto buscado (nombre, descripción o palabras)? */
export function deckMatchesQuery(deck, query) {
  const q = normalizeText(query);
  if (!q) return true;
  return normalizeText(JSON.stringify([deck.name, deck.description, deck.words])).includes(q);
}

export function filterDecks(decks, { category = 'todos', query = '' } = {}) {
  return decks.filter((d) => deckInCategory(d, category) && deckMatchesQuery(d, query));
}

/** Favoritos primero, luego los jugados recientemente y después por nombre. */
export function sortDecks(decks) {
  const history = getPlayHistory();
  const favs = getFavorites();
  return [...decks].sort((a, b) => {
    const fav = Number(favs.has(b.id)) - Number(favs.has(a.id));
    if (fav) return fav;
    const aTime = history[a.id] || 0;
    const bTime = history[b.id] || 0;
    if (aTime !== bTime) return bTime - aTime;
    return (a.name || '').localeCompare(b.name || '', 'es');
  });
}
