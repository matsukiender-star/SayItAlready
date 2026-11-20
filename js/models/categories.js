/** Categorías de mazos para los filtros de la pantalla de inicio. */
import { isFavorite } from '../services/storage/favorites.js';

export const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: '✨' },
  { id: 'favoritos', label: 'Favoritos', icon: '★' },
  { id: 'clasicos', label: 'Clásicos', icon: '🧩' },
  { id: 'entretenimiento', label: 'Entretenimiento', icon: '🎬' },
  { id: 'cultura-pop', label: 'Cultura pop', icon: '🔥' },
  { id: 'mimica', label: 'Mímica', icon: '🎭' },
  { id: 'mios', label: 'Mis mazos', icon: '🛠️' },
];

export function deckInCategory(deck, categoryId) {
  switch (categoryId) {
    case 'todos': return true;
    case 'favoritos': return isFavorite(deck.id);
    case 'mios': return !!deck.custom;
    default: return deck.category === categoryId;
  }
}
