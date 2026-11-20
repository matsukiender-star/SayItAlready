/**
 * Enlaces para compartir mazos:
 *  - ?view=edit&add=<base64 comprimido> → abre el editor con el mazo
 *  - #import/<base64 JSON>              → importa el mazo directamente
 */
import { decompressFromBase64 } from '../services/compress.js';

/** Mazo del parámetro `add`, o null si no hay o es inválido. */
export async function readSharedDeck(addParam) {
  if (!addParam) return null;
  try {
    return JSON.parse(await decompressFromBase64(addParam));
  } catch (err) {
    console.warn('Enlace de mazo inválido:', err);
    return null;
  }
}

/** JSON del hash #import/…, o null. */
export function readImportHash() {
  const prefix = '#import/';
  if (!location.hash.startsWith(prefix)) return null;
  try {
    return atob(location.hash.slice(prefix.length));
  } catch (err) {
    console.warn('Enlace de importación inválido:', err);
    return null;
  }
}
