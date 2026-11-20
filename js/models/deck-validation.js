/** Valida y normaliza un mazo importado como JSON. Lanza Error con mensaje en español. */

export function parseDeckJSON(raw) {
  let deck;
  try {
    deck = JSON.parse(raw);
  } catch {
    throw new Error('El JSON no es válido');
  }
  return validateDeck(deck);
}

export function validateDeck(deck) {
  if (!deck || typeof deck !== 'object') throw new Error('El mazo debe ser un objeto JSON');
  if (typeof deck.id !== 'string' || !deck.id.trim()) throw new Error('Falta "id" (texto)');
  if (typeof deck.name !== 'string' || !deck.name.trim()) throw new Error('Falta "name" (texto)');
  if (!Array.isArray(deck.words) || deck.words.length === 0) throw new Error('Falta el arreglo "words"');
  for (const w of deck.words) {
    if (typeof w === 'string') continue;
    if (!w || typeof w !== 'object') throw new Error('Cada palabra debe ser texto o {text, tags?}');
    if (typeof w.text !== 'string' || !w.text.trim()) throw new Error('Cada palabra necesita la propiedad "text"');
  }
  return {
    ...deck,
    words: deck.words.map((w) => (typeof w === 'string' ? { text: w } : w)),
    custom: true,
  };
}
