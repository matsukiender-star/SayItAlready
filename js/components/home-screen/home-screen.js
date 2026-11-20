/**
 * <home-screen>: pantalla de inicio. Muestra los mazos y coordina los diálogos.
 *
 * API para el router: openDeckById, openSettings, openHelp, openEditor,
 * openEditorWithDeck, importFromJSON, closeDialogs.
 * Eventos (hacia el router): decks-loaded · deck-preview-open · settings-open ·
 * help-open · edit-deck-open · play · dialog-dismiss
 */
import '../deck-card/deck-card.js';
import '../category-chips/category-chips.js';
import '../deck-sheet/deck-sheet.js';
import '../settings-dialog/settings-dialog.js';
import '../help-dialog/help-dialog.js';
import '../deck-editor/deck-editor.js';
import { template, helpCardTemplate, addCardTemplate } from './home-screen.template.js';
import { attachTemplate, emit, restartAnimation } from '../../utils/dom.js';
import { filterDecks, sortDecks } from '../../models/deck-filters.js';
import { parseDeckJSON } from '../../models/deck-validation.js';
import { loadAllDecks, saveDeck } from '../../services/storage/deck-store.js';
import { hasSeenHelp } from '../../services/storage/help-seen.js';
import { feedback } from '../../services/feedback.js';

const DICE_ROLL_MS = 420;

export class HomeScreen extends HTMLElement {
  #root = attachTemplate(this, template);
  #decks = [];
  #ready = false;

  connectedCallback() {
    if (this.#ready) return;
    this.#ready = true;
    this.#bindHeader();
    this.#bindList();
    this.#reloadDecks().then(() => emit(this, 'decks-loaded'));
  }

  #$(sel) { return this.#root.querySelector(sel); }

  get #sheet() { return this.#$('deck-sheet'); }
  get #settings() { return this.#$('settings-dialog'); }
  get #help() { return this.#$('help-dialog'); }
  get #editor() { return this.#$('deck-editor'); }
  get #chips() { return this.#$('category-chips'); }
  get #query() { return this.#$('.filter-input').value; }

  /* ---- Datos ---- */
  async #reloadDecks() {
    this.#decks = sortDecks(await loadAllDecks());
    this.#chips.update(this.#decks);
    this.#render();
  }

  #visibleDecks() {
    return filterDecks(this.#decks, { category: this.#chips.value, query: this.#query });
  }

  /* ---- Render ---- */
  #render() {
    const list = this.#$('.deck-list');
    const decks = this.#visibleDecks();
    const items = [];
    if (!hasSeenHelp() && !this.#query) items.push(this.#helpCard());
    for (const deck of decks) {
      const card = document.createElement('deck-card');
      card.deck = deck;
      items.push(card);
    }
    if (['todos', 'mios'].includes(this.#chips.value)) items.push(this.#addCard());
    items.forEach((el, i) => el.style.setProperty('--i', i));
    list.replaceChildren(...items);
    this.#$('.empty-state').hidden = decks.length > 0;
  }

  #helpCard() {
    const card = helpCardTemplate.content.firstElementChild.cloneNode(true);
    card.addEventListener('click', () => this.#userOpen(this.#help, 'help-open'));
    return card;
  }

  #addCard() {
    const card = addCardTemplate.content.firstElementChild.cloneNode(true);
    card.addEventListener('click', () => this.#openNewDeck());
    return card;
  }

  /* ---- Eventos ---- */
  #bindHeader() {
    this.#$('.settings-btn').addEventListener('click', () => this.#userOpen(this.#settings, 'settings-open'));
    this.#$('.help-btn').addEventListener('click', () => this.#userOpen(this.#help, 'help-open'));
    this.#$('.hero').addEventListener('click', () => this.#surpriseMe());
    this.#$('.filter-input').addEventListener('input', () => this.#render());
  }

  #bindList() {
    this.#root.addEventListener('category-change', () => this.#render());
    this.#root.addEventListener('deck-select', (e) => this.#openDeck(e.detail.deck));
    this.#root.addEventListener('deck-edit', (e) => {
      this.#editor.edit(e.detail.deck);
      emit(this, 'edit-deck-open', { deckId: e.detail.deck.id });
    });
    this.#root.addEventListener('favorite-change', () => {
      this.#decks = sortDecks(this.#decks);
      this.#chips.update(this.#decks);
      if (this.#chips.value === 'favoritos') setTimeout(() => this.#render(), 350);
    });
    this.#root.addEventListener('decks-changed', () => this.#reloadDecks());
    this.#root.addEventListener('help-seen', () => this.#render());
  }

  /** Abre un diálogo por acción del usuario y avisa al router. */
  #userOpen(dialog, eventName) {
    dialog.open();
    emit(this, eventName);
  }

  #openDeck(deck) {
    this.#sheet.show(deck);
    emit(this, 'deck-preview-open', { deckId: deck.id });
  }

  #openNewDeck() {
    this.#editor.create();
    emit(this, 'edit-deck-open', { deckId: null });
  }

  #surpriseMe() {
    const pool = this.#visibleDecks().filter((d) => d.words?.length);
    const decks = pool.length ? pool : this.#decks;
    if (!decks.length) return;
    restartAnimation(this.#$('.hero'), 'rolling');
    feedback.tap();
    const deck = decks[Math.floor(Math.random() * decks.length)];
    setTimeout(() => this.#openDeck(deck), DICE_ROLL_MS);
  }

  /* ---- API pública para el router ---- */
  openDeckById(id) {
    const deck = this.#decks.find((d) => d.id === id || d.name === id);
    if (deck) this.#sheet.show(deck);
  }

  openSettings() { this.#settings.open(); }

  openHelp() { this.#help.open(); }

  openEditor(deckId) {
    const deck = deckId && this.#decks.find((d) => d.id === deckId);
    if (deck?.custom) this.#editor.edit(deck);
    else this.#editor.create();
  }

  openEditorWithDeck(deck) { this.#editor.prefill(deck); }

  async importFromJSON(json) {
    await saveDeck(parseDeckJSON(json));
    await this.#reloadDecks();
  }

  closeDialogs() {
    for (const dialog of [this.#sheet, this.#settings, this.#help, this.#editor]) dialog.close();
  }
}

customElements.define('home-screen', HomeScreen);
