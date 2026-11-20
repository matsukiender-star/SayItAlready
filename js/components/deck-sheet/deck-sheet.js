/**
 * <deck-sheet>: detalle de un mazo con ejemplos, dificultad y botón «¡Jugar!».
 * Uso: sheet.show(deck)
 * Eventos: play {deck, difficulty} · dialog-dismiss
 */
import { DialogElement } from '../shared/dialog-element.js';
import { bindSegmented } from '../shared/segmented.js';
import { template } from './deck-sheet.template.js';
import { emit } from '../../utils/dom.js';
import { wordText, hasDifficultyTags, filterByDifficulty } from '../../models/deck.js';
import { CONTROL_LABELS } from '../../models/labels.js';
import { getSettings } from '../../services/storage/settings.js';

const EXAMPLE_COUNT = 4;
const DEFAULT_DIFFICULTY = 1;
const ALL_DIFFICULTIES = 2;

export class DeckSheet extends DialogElement {
  #deck = null;
  #difficulty = DEFAULT_DIFFICULTY;
  #selectDifficulty = () => {};

  constructor() {
    super(template);
  }

  get deck() { return this.#deck; }

  setup() {
    this.#selectDifficulty = bindSegmented(this.$('.difficulty-pills'), 'diff', (value) => {
      this.#difficulty = Number(value);
      this.#renderExamples();
    });
    this.$('.modal-start').addEventListener('click', () => {
      if (!this.#deck) return;
      this.$('.modal-start').classList.add('launching');
      emit(this, 'play', { deck: this.#deck, difficulty: this.#difficulty });
    });
  }

  show(deck) {
    this.#deck = deck;
    const background = deck.background || 'var(--brand-gradient)';
    this.$('.sheet').style.setProperty('--deck-bg', background);
    this.$('.modal-icon').textContent = deck.icon ?? '🃏';
    this.$('.modal-name').textContent = deck.name;
    this.$('.modal-desc').textContent = deck.description || '';
    this.$('.modal-count').textContent = `${deck.words?.length ?? 0} palabras`;
    this.$('.modal-start').classList.remove('launching');
    this.#renderMeta();

    const tagged = hasDifficultyTags(deck);
    this.$('.difficulty-wrap').hidden = !tagged;
    this.#difficulty = tagged ? DEFAULT_DIFFICULTY : ALL_DIFFICULTIES;
    this.#selectDifficulty(String(this.#difficulty));
    this.#renderExamples();
    this.open();
  }

  close() {
    super.close();
    this.#deck = null;
  }

  #renderMeta() {
    const s = getSettings();
    this.$('.modal-meta').innerHTML =
      `<span>⏱ ${s.timerDuration} s</span><span>${CONTROL_LABELS[s.controlMode] ?? ''}</span>`;
  }

  #renderExamples() {
    if (!this.#deck) return;
    const pool = hasDifficultyTags(this.#deck)
      ? filterByDifficulty(this.#deck.words, this.#difficulty)
      : this.#deck.words;
    const sample = [...pool].sort(() => Math.random() - 0.5).slice(0, EXAMPLE_COUNT);
    const wrap = this.$('.modal-examples');
    wrap.innerHTML = '';
    sample.forEach((w, i) => {
      const chip = document.createElement('span');
      chip.style.setProperty('--i', i);
      chip.textContent = wordText(w);
      wrap.appendChild(chip);
    });
  }
}

customElements.define('deck-sheet', DeckSheet);
