/** Campos del editor (ícono, nombre, descripción, colores, palabras) ⇄ objeto mazo. */
import { WordRows } from './word-rows.js';
import { randomVividColor, gradient, gradientColors } from '../../utils/color.js';
import { slugify } from '../../utils/text.js';

export class DeckForm {
  #root;
  #words;
  #editingId = null;

  /** @param {ShadowRoot} root */
  constructor(root) {
    this.#root = root;
    this.#words = new WordRows(this.#$('.edit-words-list'));
    this.#$('.edit-color1').addEventListener('input', () => this.#updatePreview());
    this.#$('.edit-color2').addEventListener('input', () => this.#updatePreview());
    this.#$('.add-word-btn').addEventListener('click', () => this.#words.add().focus());
  }

  #$(sel) { return this.#root.querySelector(sel); }

  /** Deja el formulario vacío para un mazo nuevo. */
  reset() {
    this.#editingId = null;
    for (const sel of ['.edit-icon', '.edit-name', '.edit-desc']) this.#$(sel).value = '';
    this.#$('.edit-color1').value = randomVividColor();
    this.#$('.edit-color2').value = randomVividColor();
    this.#words.clear();
    this.#updatePreview();
  }

  /** Llena el formulario; si keepId, se guardará sobre el mismo mazo. */
  fill(deck, { keepId = false } = {}) {
    if (keepId) this.#editingId = deck.id;
    this.#$('.edit-icon').value = deck.icon || '';
    this.#$('.edit-name').value = deck.name || '';
    this.#$('.edit-desc').value = deck.description || '';
    const colors = gradientColors(deck.background);
    if (colors) {
      this.#$('.edit-color1').value = colors[0];
      this.#$('.edit-color2').value = colors[1];
    }
    this.#words.setWords(deck.words);
    this.#updatePreview();
  }

  /** Mazo con los valores actuales del formulario. */
  read() {
    const name = this.#$('.edit-name').value.trim();
    const random = Math.floor(Math.random() * 9000 + 1000);
    return {
      id: this.#editingId ?? `${slugify(name) || 'mazo'}-${random}`,
      name,
      icon: this.#$('.edit-icon').value.trim() || undefined,
      description: this.#$('.edit-desc').value.trim() || undefined,
      background: gradient(this.#$('.edit-color1').value, this.#$('.edit-color2').value),
      words: this.#words.getWords(),
      custom: true,
    };
  }

  focus() {
    this.#$('.edit-name').focus();
  }

  #updatePreview() {
    this.#$('.edit-color-preview').style.background =
      gradient(this.#$('.edit-color1').value, this.#$('.edit-color2').value);
  }
}
