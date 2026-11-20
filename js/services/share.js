/** Enlaces para compartir mazos (el mazo va comprimido dentro del enlace). */
import { compressToBase64 } from './compress.js';
import { isNative } from './native/platform.js';

/** Versión web publicada, usada para los enlaces creados desde la app nativa. */
const WEB_URL = 'https://matsukiender-star.github.io/SayItAlready/';

export async function deckShareUrl(deck) {
  const compressed = await compressToBase64(JSON.stringify(deck));
  const base = isNative() ? WEB_URL : location.origin + location.pathname;
  return `${base}?view=edit&add=${compressed}`;
}
