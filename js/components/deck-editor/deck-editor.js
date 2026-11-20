/**
 * <deck-editor>: crear, editar, importar y compartir mazos propios.
 * Uso: editor.create() · editor.edit(deck) · editor.prefill(deck)
 * Eventos: decks-changed · dialog-dismiss
 */
import { DialogElement } from '../shared/dialog-element.js';
import { bindSegmented } from '../shared/segmented.js';
import { template } from './deck-editor.template.js';
import { DeckForm } from './deck-form.js';
import { QrPane } from './qr-pane.js';
import { emit } from '../../utils/dom.js';
import { parseDeckJSON } from '../../models/deck-validation.js';
import { saveDeck, deleteDeck } from '../../services/storage/deck-store.js';

export class DeckEditor extends DialogElement {
  #form;
  #qr;
  #tab = 'editor';
  #selectTab = () => {};
  #editing = null; // mazo existente que se edita

  constructor() {
    super(template);
  }

  setup() {
    this.#form = new DeckForm(this.root);
    this.#qr = new QrPane(this.root);
    this.#selectTab = bindSegmented(this.$('.edit-tabs'), 'tab', (tab) => this.#switchTab(tab));
    this.$('.import-cancel').addEventListener('click', () => this.dismiss());
    this.$('.import-submit').addEventListener('click', () => this.#save());
    this.$('.import-delete').addEventListener('click', () => this.#delete());
  }

  /** Mazo nuevo vacío. */
  create() {
    this.#prepare(null, 'Nuevo mazo');
    this.open();
    this.#form.focus();
  }

  /** Editar un mazo propio existente. */
  edit(deck) {
    this.#prepare(deck, 'Editar mazo');
    this.#form.fill(deck, { keepId: true });
    this.open();
  }

  /** Mazo nuevo con datos recibidos (p. ej. desde un QR). */
  prefill(deck) {
    this.#prepare(null, 'Nuevo mazo');
    this.#form.fill(deck);
    this.open();
  }

  #prepare(deck, title) {
    this.#editing = deck;
    this.#form.reset();
    this.#qr.clear();
    this.$('.json-textarea').value = '';
    this.$('.import-error').textContent = '';
    this.$('.edit-title').textContent = title;
    this.$('.import-delete').hidden = !deck;
    this.#selectTab('editor');
    this.#showPane('editor');
  }

  #switchTab(tab) {
    if (this.#tab === 'json' && tab !== 'json') {
      try {
        this.#form.fill(JSON.parse(this.$('.json-textarea').value), { keepId: !!this.#editing });
      } catch { /* JSON inválido: el formulario se queda como estaba */ }
    }
    if (tab === 'json') this.$('.json-textarea').value = JSON.stringify(this.#form.read(), null, 2);
    if (tab === 'qr') this.#qr.render(this.#form.read());
    this.#showPane(tab);
  }

  #showPane(tab) {
    this.#tab = tab;
    this.$$('[data-pane]').forEach((p) => p.classList.toggle('visible', p.dataset.pane === tab));
  }

  async #save() {
    const errorEl = this.$('.import-error');
    errorEl.textContent = '';
    try {
      const deck = this.#tab === 'json'
        ? parseDeckJSON(this.$('.json-textarea').value.trim())
        : this.#form.read();
      if (!deck.name) throw new Error('El nombre es obligatorio');
      if (!deck.words.length) throw new Error('Agrega al menos una palabra');
      await saveDeck(deck);
      emit(this, 'decks-changed');
      this.dismiss();
    } catch (err) {
      errorEl.textContent = err.message;
    }
  }

  async #delete() {
    if (!this.#editing || !confirm(`¿Eliminar el mazo "${this.#editing.name}"?`)) return;
    await deleteDeck(this.#editing.id);
    emit(this, 'decks-changed');
    this.dismiss();
  }
}

customElements.define('deck-editor', DeckEditor);
