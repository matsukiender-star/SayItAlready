/**
 * <game-countdown>: cuenta 3-2-1-¡Ya! a pantalla completa.
 * Uso: await countdown.run(hintText) · countdown.paused = true/false
 */
import { html, attachTemplate, restartAnimation } from '../../utils/dom.js';
import { feedback } from '../../services/feedback.js';

const STEP_MS = 900;
const GO_MS = 650;
const PAUSE_POLL_MS = 200;

const template = html(`
<link rel="stylesheet" href="./css/shared/reset.css">
<link rel="stylesheet" href="./js/components/game-countdown/game-countdown.css">
<div class="countdown-overlay">
  <div class="countdown-hint">
    <span class="countdown-phone">📱</span>
    <span>¡Ponte el teléfono en la frente!</span>
  </div>
  <div class="countdown-ring"></div>
  <span class="countdown-num"></span>
  <div class="countdown-controls"></div>
</div>
`);

export class GameCountdown extends HTMLElement {
  #root = attachTemplate(this, template);
  paused = false;

  #$(sel) { return this.#root.querySelector(sel); }

  /** Muestra la cuenta y se resuelve al terminar. */
  run(hint = '') {
    this.#$('.countdown-controls').textContent = hint;
    this.#$('.countdown-overlay').classList.remove('hidden');
    const steps = ['3', '2', '1', '¡Ya!'];
    let i = 0;
    return new Promise((resolve) => {
      const next = () => {
        if (!this.isConnected) return;
        if (this.paused) { setTimeout(next, PAUSE_POLL_MS); return; }
        if (i === steps.length) {
          this.#$('.countdown-overlay').classList.add('hidden');
          resolve();
          return;
        }
        const final = i === steps.length - 1;
        this.#show(steps[i++], final);
        setTimeout(next, final ? GO_MS : STEP_MS);
      };
      next();
    });
  }

  #show(text, final) {
    const num = this.#$('.countdown-num');
    num.textContent = text;
    num.classList.toggle('go', final);
    restartAnimation(num, 'tick');
    restartAnimation(this.#$('.countdown-ring'), 'tick');
    feedback.tick(final);
  }
}

customElements.define('game-countdown', GameCountdown);
