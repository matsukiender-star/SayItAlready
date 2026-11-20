/** Escenario de la palabra: tarjeta animada, destellos y partículas. */
import { restartAnimation } from '../../utils/dom.js';
import { burst } from '../../effects/particles.js';

const EXIT_FALLBACK_MS = 600;

/** Escala de letra según el largo del texto. */
function fontScale(text) {
  const len = text.length;
  if (len > 40) return '0.5';
  if (len > 26) return '0.62';
  if (len > 16) return '0.78';
  return '1';
}

export class WordStage {
  #root;

  /** @param {ShadowRoot} root */
  constructor(root) {
    this.#root = root;
  }

  #$(sel) { return this.#root.querySelector(sel); }

  /**
   * Muestra `text` en una tarjeta nueva y saca la anterior.
   * @param {string|null} text – null solo retira la tarjeta actual
   * @param {'exit-correct'|'exit-skip'|'exit-fade'} exit – animación de salida
   */
  show(text, exit = 'exit-fade') {
    const stage = this.#$('.stage');
    const old = stage.querySelector('.word-card:not(.leaving)');
    if (old) {
      old.classList.add('leaving', exit);
      old.addEventListener('animationend', () => old.remove(), { once: true });
      setTimeout(() => old.remove(), EXIT_FALLBACK_MS);
    }
    if (text == null) return;
    const card = document.createElement('div');
    card.className = 'word-card enter';
    const word = document.createElement('div');
    word.className = 'word';
    word.textContent = text;
    word.style.setProperty('--size', fontScale(text));
    card.appendChild(word);
    stage.appendChild(card);
  }

  /** Destello a pantalla completa ('correct' | 'skip'). */
  flash(type) {
    restartAnimation(this.#$(`.flash.${type}`), 'show');
    if (type === 'correct') burst(this.#$('.particles'));
  }
}
