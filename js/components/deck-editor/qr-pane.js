/** Pestaña «Código QR» del editor: genera el QR y el enlace para compartir. */
import { qrcodeSVG } from '../../vendor/qrcode.js';
import { deckShareUrl } from '../../services/share.js';

export class QrPane {
  #root;

  /** @param {ShadowRoot} root */
  constructor(root) {
    this.#root = root;
    this.#$('.qr-copy').addEventListener('click', () => this.#copy());
  }

  #$(sel) { return this.#root.querySelector(sel); }

  clear() {
    this.#$('.qr-output').innerHTML = '';
    this.#$('.qr-url').value = '';
    this.#$('.qr-error').textContent = '';
  }

  async render(deck) {
    this.clear();
    try {
      if (!deck.name) throw new Error('Primero ponle un nombre');
      if (!deck.words.length) throw new Error('Primero agrega algunas palabras');
      const url = await deckShareUrl(deck);
      this.#$('.qr-url').value = url;
      this.#$('.qr-output').innerHTML = qrcodeSVG(url);
    } catch (err) {
      this.#$('.qr-error').textContent = err.message === 'data too large for QR code'
        ? 'El mazo tiene demasiadas palabras para un código QR'
        : err.message || 'No se pudo generar el código QR';
    }
  }

  async #copy() {
    const url = this.#$('.qr-url').value;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      const btn = this.#$('.qr-copy');
      btn.textContent = '✓';
      setTimeout(() => (btn.textContent = '📋'), 1500);
    } catch { /* sin portapapeles */ }
  }
}
