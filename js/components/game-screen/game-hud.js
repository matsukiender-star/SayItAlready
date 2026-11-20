/** Marcador de la partida: tiempo restante, barra, aciertos y nombre del mazo. */
import { restartAnimation } from '../../utils/dom.js';

const WARNING_SECONDS = 5;

export class GameHud {
  #root;
  #duration;
  #lastSecond = null;

  /** @param {ShadowRoot} root @param {object} deck @param {number} duration */
  constructor(root, deck, duration) {
    this.#root = root;
    this.#duration = duration;
    this.#$('.hud-deck-icon').textContent = deck.icon ?? '🃏';
    this.#$('.hud-deck-name').textContent = deck.name;
    this.#$('.timer-text').textContent = duration;
  }

  #$(sel) { return this.#root.querySelector(sel); }

  /** Actualiza la barra cada cuadro y el número cada segundo. */
  setRemaining(remaining) {
    this.#$('.timer-fill').style.transform = `scaleX(${remaining / this.#duration})`;
    const second = Math.ceil(remaining);
    if (second === this.#lastSecond) return;
    this.#lastSecond = second;
    this.#$('.timer-text').textContent = second;
    if (second > 0 && second <= WARNING_SECONDS) restartAnimation(this.#$('.timer-pill'), 'beat');
  }

  setScore(score) {
    this.#$('.score-num').textContent = score;
    restartAnimation(this.#$('.score-pill'), 'bump');
  }

  /** Modo «últimos segundos»: barra y reloj en rojo. */
  warn() {
    this.#$('.game').classList.add('warning');
  }
}
