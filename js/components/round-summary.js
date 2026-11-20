import { confetti } from '../services/confetti.js';
import { AudioManager } from '../services/audio-manager.js';

const DIFF_LABELS = ['Fácil', 'Normal', 'Difícil'];

/** Mensaje según la puntuación. */
function verdict(correct, total) {
  if (correct === 0) return { emoji: '😅', text: '¡Calentando motores!' };
  const ratio = total ? correct / total : 0;
  if (correct >= 15 || (correct >= 10 && ratio >= 0.8)) return { emoji: '🏆', text: '¡Eres una leyenda!' };
  if (correct >= 10) return { emoji: '🔥', text: '¡Estás que ardes!' };
  if (correct >= 6) return { emoji: '🎉', text: '¡Muy bien jugado!' };
  if (correct >= 3) return { emoji: '👏', text: '¡Nada mal!' };
  return { emoji: '💪', text: '¡La próxima es la buena!' };
}

const template = document.createElement('template');
template.innerHTML = `
<link rel="stylesheet" href="./css/round-summary.css">
<canvas class="confetti"></canvas>
<div class="summary">
  <div class="summary-head">
    <div class="deck-tag"><span class="deck-icon"></span><span class="deck-name"></span></div>
    <h2 class="verdict"><span class="verdict-emoji"></span> <span class="verdict-text"></span></h2>
  </div>

  <div class="score-card">
    <div class="score-ring">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ff3d7f"/>
            <stop offset="100%" stop-color="#ff9a3d"/>
          </linearGradient>
        </defs>
        <circle class="ring-track" cx="60" cy="60" r="52"/>
        <circle class="ring-value" cx="60" cy="60" r="52"/>
      </svg>
      <div class="score-center">
        <div class="score">0</div>
        <div class="score-label">aciertos</div>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><span class="stat-num stat-correct">0</span><span class="stat-label">✅ Correctas</span></div>
      <div class="stat"><span class="stat-num stat-skipped">0</span><span class="stat-label">⏭ Pasadas</span></div>
      <div class="stat"><span class="stat-num stat-accuracy">0%</span><span class="stat-label">🎯 Precisión</span></div>
    </div>
  </div>

  <div class="actions">
    <button class="btn-replay">🔄 Jugar otra vez</button>
    <button class="btn-home">🃏 Cambiar mazo</button>
  </div>

  <h3 class="list-title">Palabras de la ronda</h3>
  <ul class="results-list"></ul>
</div>
`;

export class RoundSummary extends HTMLElement {
  #results = [];
  #deck = null;
  #audio = new AudioManager();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  set data({ deck, results }) {
    this.#deck = deck;
    this.#results = results;
  }

  #$(sel) { return this.shadowRoot.querySelector(sel); }

  connectedCallback() {
    this.#render();
    this.#$('.btn-home').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('go-home', { bubbles: true, composed: true }));
    });
    this.#$('.btn-replay').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('start-game', {
        bubbles: true,
        composed: true,
        detail: { deck: this.#deck },
      }));
    });
  }

  #render() {
    const correct = this.#results.filter((r) => r.result === 'correct').length;
    const skipped = this.#results.length - correct;
    const total = this.#results.length;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    if (this.#deck?.background) this.style.setProperty('--deck-bg', this.#deck.background);
    this.#$('.deck-icon').textContent = this.#deck?.icon ?? '🃏';
    this.#$('.deck-name').textContent = this.#deck?.name ?? '';
    const v = verdict(correct, total);
    this.#$('.verdict-emoji').textContent = v.emoji;
    this.#$('.verdict-text').textContent = v.text;
    this.#$('.stat-correct').textContent = correct;
    this.#$('.stat-skipped').textContent = skipped;
    this.#$('.stat-accuracy').textContent = `${accuracy}%`;

    // Anillo: proporción de aciertos
    const ring = this.#$('.ring-value');
    const C = 2 * Math.PI * 52;
    ring.style.strokeDasharray = `${C}`;
    ring.style.strokeDashoffset = `${C}`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ring.style.strokeDashoffset = `${C * (1 - (total ? correct / total : 0))}`;
    }));

    this.#countUp(this.#$('.score'), correct);

    const list = this.#$('.results-list');
    list.innerHTML = '';
    this.#results.forEach(({ word, result, difficulty }, i) => {
      const li = document.createElement('li');
      li.className = result === 'correct' ? 'is-correct' : 'is-skipped';
      li.style.setProperty('--i', Math.min(i, 30));
      const text = document.createElement('span');
      text.className = 'word';
      text.textContent = word;
      li.appendChild(text);
      if (difficulty != null && DIFF_LABELS[difficulty]) {
        const badge = document.createElement('span');
        badge.className = `diff-badge diff-${difficulty}`;
        badge.textContent = DIFF_LABELS[difficulty];
        li.appendChild(badge);
      }
      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.textContent = result === 'correct' ? '✓' : '↷';
      li.appendChild(icon);
      list.appendChild(li);
    });
    if (!total) {
      const li = document.createElement('li');
      li.className = 'empty';
      li.textContent = 'No se jugó ninguna palabra.';
      list.appendChild(li);
    }

    if (correct >= 3) {
      setTimeout(() => {
        confetti(this.#$('.confetti'), { count: Math.min(60 + correct * 10, 220) });
        this.#audio.fanfare();
      }, 350);
    }
  }

  #countUp(el, target) {
    const duration = Math.min(400 + target * 60, 1400);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(step);
      else el.classList.add('done');
    };
    requestAnimationFrame(step);
  }
}

customElements.define('round-summary', RoundSummary);
