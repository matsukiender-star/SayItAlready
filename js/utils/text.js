/** Utilidades de texto en español. */

/** Minúsculas y sin acentos, para buscar ("Película" → "pelicula"). */
export function normalizeText(text) {
  return String(text ?? '')
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

/** Convierte un nombre en id kebab-case ("Mi Mazo" → "mi-mazo"). */
export function slugify(text) {
  return normalizeText(text).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
