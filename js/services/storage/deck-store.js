/** Punto único para obtener y guardar mazos (incluidos + propios). */
import { loadBuiltInPacks } from './built-in-packs.js';
import { getCustomDecks, saveCustomDeck, deleteCustomDeck } from './custom-decks-db.js';

export async function loadAllDecks() {
  const [builtIn, custom] = await Promise.all([
    loadBuiltInPacks(),
    getCustomDecks().catch(() => []),
  ]);
  return [...builtIn, ...custom];
}

export async function findDeck(idOrName) {
  const decks = await loadAllDecks();
  return decks.find((d) => d.id === idOrName || d.name === idOrName) ?? null;
}

export const saveDeck = saveCustomDeck;
export const deleteDeck = deleteCustomDeck;
