/**
 * <round-summary>: resultado de la ronda (puntuación, estadísticas y palabras).
 * Propiedad: data = {deck, results}
 * Eventos: start-game {deck} · go-home
 */
import { template } from './round-summary.template.js';
import { renderResults } from './results-list.js';
import { attachTemplate, emit } from '../../utils/dom.js';
import { countUp } from '../../utils/count-up.js';
import { verdict } from '../../models/verdict.js';
import { confetti } from '../../effects/confetti.js';
import { feedback } from '../../services/feedback.js';

const RING_RADIUS = 52;
const CONFETTI_MIN_SCORE = 3;
const CONFETTI_DELAY_MS = 350;

export class RoundSummary extends HTMLElement {
  #root = attachTemplate(this, template);
  #deck = null;
  #results = [];

  set data({ deck, results }) {
    this.#deck = deck;
    this.#results = results;
  }

  #$(sel) { return this.#root.querySelector(sel); }

  connectedCallback() {
    this.#render();
    this.#$('.btn-home').addEventListener('click', () => emit(this, 'go-home'));
    this.#$('.btn-replay').addEventListener('click', () => emit(this, 'start-game', { deck: this.#deck }));
  }

  #render() {
    const total = this.#results.length;
    const correct = this.#results.filter((r) => r.result === 'correct').length;
    const ratio = total ? correct / total : 0;

    this.#renderHeader(correct, total);
    this.#$('.stat-correct').textContent = correct;
    this.#$('.stat-skipped').textContent = total - correct;
    this.#$('.stat-accuracy').textContent = `${Math.round(ratio * 100)}%`;
    this.#animateRing(ratio);
    countUp(this.#$('.score'), correct, { onDone: () => this.#$('.score').classList.add('done') });
    renderResults(this.#$('.results-list'), this.#results);

    if (correct >= CONFETTI_MIN_SCORE) {
      setTimeout(() => {
        confetti(this.#$('.confetti'), { count: Math.min(60 + correct * 10, 220) });
        feedback.fanfare();
      }, CONFETTI_DELAY_MS);
    }
  }

  #renderHeader(correct, total) {
    if (this.#deck?.background) this.style.setProperty('--deck-bg', this.#deck.background);
    this.#$('.deck-icon').textContent = this.#deck?.icon ?? '🃏';
    this.#$('.deck-name').textContent = this.#deck?.name ?? '';
    const v = verdict(correct, total);
    this.#$('.verdict-emoji').textContent = v.emoji;
    this.#$('.verdict-text').textContent = v.text;
  }

  /** El anillo se llena con la proporción de aciertos. */
  #animateRing(ratio) {
    const ring = this.#$('.ring-value');
    const circumference = 2 * Math.PI * RING_RADIUS;
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${circumference}`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ring.style.strokeDashoffset = `${circumference * (1 - ratio)}`;
    }));
  }
}

customElements.define('round-summary', RoundSummary);
