/**
 * <game-screen>: una ronda de juego.
 * Propiedades: deck, duration, controlMode ('gyro'|'touch'|'swipe'), difficulty.
 * Eventos: round-end {deck, results} · go-home · game-paused · game-resumed
 * API: showPause(), hidePause()
 */
import '../game-countdown/game-countdown.js';
import { template } from './game-screen.template.js';
import { GameHud } from './game-hud.js';
import { WordStage } from './word-stage.js';
import { formatTiltDebug } from './tilt-debug.js';
import { attachTemplate, emit } from '../../utils/dom.js';
import { WordQueue } from '../../models/word-queue.js';
import { CONTROL_HINTS } from '../../models/labels.js';
import { Timer } from '../../services/timer.js';
import { TiltDetector } from '../../services/sensors/tilt-detector.js';
import { feedback } from '../../services/feedback.js';
import { getSettings } from '../../services/storage/settings.js';
import { keepAwake, allowSleep } from '../../services/native/wake-lock.js';
import { setImmersive } from '../../services/native/system-ui.js';
import { bindSwipe } from '../../input/swipe.js';
import { bindGameKeys } from '../../input/keyboard.js';

const WARNING_SECONDS = 5;
const TIMES_UP_MS = 1100;

export class GameScreen extends HTMLElement {
  deck = null;
  duration = 60;
  controlMode = 'touch';
  difficulty = 2;

  #root = attachTemplate(this, template);
  #queue = null;
  #hud = null;
  #stage = new WordStage(this.#root);
  #timer = null;
  #tilt = null;
  #unbindKeys = () => {};
  #state = 'countdown'; // 'countdown' | 'playing' | 'ended'
  #paused = false;

  #$(sel) { return this.#root.querySelector(sel); }

  connectedCallback() {
    if (!this.deck) return;
    feedback.unlock();
    this.#$('.game').style.setProperty('--deck-bg', this.deck.background || 'var(--brand-gradient-3)');
    this.#queue = new WordQueue(this.deck.words, this.difficulty);
    this.#hud = new GameHud(this.#root, this.deck, this.duration);
    if (this.controlMode === 'gyro') this.#createTilt();
    this.#tilt?.listen(); // calibra mientras corre la cuenta
    this.#bindControls();
    keepAwake();
    setImmersive(true);
    this.#$('game-countdown').run(CONTROL_HINTS[this.controlMode]).then(() => this.#beginRound());
  }

  disconnectedCallback() {
    this.#timer?.stop();
    this.#tilt?.stop();
    this.#unbindKeys();
    allowSleep();
    setImmersive(false);
  }

  showPause() { if (!this.#paused) this.#togglePause(); }
  hidePause() { if (this.#paused) this.#togglePause(); }

  /* ---- Ronda ---- */
  #beginRound() {
    if (this.#state === 'ended' || !this.isConnected) return;
    this.#state = 'playing';
    this.#stage.show(this.#queue.current);
    this.#timer = new Timer({
      duration: this.duration,
      warningAt: WARNING_SECONDS,
      onTick: (remaining) => this.#hud.setRemaining(remaining),
      onWarning: () => { this.#hud.warn(); feedback.warning(); },
      onDone: () => this.#endRound(),
    });
    this.#timer.start();
    this.#tilt?.calibrate();
    this.#tilt?.start();
  }

  #answer(result) {
    if (this.#state !== 'playing' || this.#paused || this.#queue.done) return;
    this.#queue.answer(result);
    const correct = result === 'correct';
    feedback[correct ? 'correct' : 'skip']();
    this.#stage.flash(correct ? 'correct' : 'skip');
    if (correct) this.#hud.setScore(this.#queue.correctCount);
    this.#stage.show(this.#queue.current, correct ? 'exit-correct' : 'exit-skip');
    if (this.#queue.done) this.#endRound();
  }

  #endRound() {
    if (this.#state === 'ended') return;
    this.#state = 'ended';
    this.#timer?.stop();
    this.#tilt?.stop();
    this.#queue.finish();
    feedback.timesUp();
    this.#$('.timesup-overlay').classList.add('visible');
    setTimeout(() => emit(this, 'round-end', { deck: this.deck, results: this.#queue.results }), TIMES_UP_MS);
  }

  /* ---- Controles ---- */
  #createTilt() {
    const settings = getSettings();
    const debugEl = this.#$('.debug-overlay');
    debugEl.classList.toggle('visible', settings.debugOverlay);
    this.#tilt = new TiltDetector({
      sensitivity: settings.tiltSensitivity,
      onCorrect: () => this.#answer('correct'),
      onSkip: () => this.#answer('skipped'),
      onDebug: settings.debugOverlay ? (d) => { debugEl.textContent = formatTiltDebug(d); } : undefined,
    });
  }

  #bindControls() {
    const correct = () => this.#answer('correct');
    const skip = () => this.#answer('skipped');
    if (this.controlMode === 'touch') this.#$('.tap-zones').classList.add('visible');
    if (this.controlMode === 'swipe') {
      this.#$('.swipe-hint').classList.add('visible');
      bindSwipe(this.#$('.game'), { onRight: correct, onLeft: skip, enabled: () => !this.#paused });
    }
    this.#$('.tap-correct').addEventListener('click', correct);
    this.#$('.tap-skip').addEventListener('click', skip);
    this.#$('.menu-btn').addEventListener('click', () => this.#togglePause());
    this.#$('.btn-resume').addEventListener('click', () => this.#togglePause());
    this.#$('.btn-quit').addEventListener('click', () => this.#quit());
    this.#unbindKeys = bindGameKeys({ onCorrect: correct, onSkip: skip, onPause: () => this.#togglePause() });
  }

  /* ---- Pausa ---- */
  #togglePause() {
    if (this.#state === 'ended') return;
    this.#paused = !this.#paused;
    this.#$('game-countdown').paused = this.#paused;
    this.#$('.pause-overlay').classList.toggle('visible', this.#paused);
    if (this.#paused) {
      this.#timer?.stop();
      this.#tilt?.stop();
      emit(this, 'game-paused');
      return;
    }
    if (this.#state === 'playing') {
      this.#timer?.start();
      this.#tilt?.start();
    } else {
      this.#tilt?.listen();
    }
    emit(this, 'game-resumed');
  }

  #quit() {
    this.#state = 'ended';
    this.#timer?.stop();
    this.#tilt?.stop();
    emit(this, 'go-home');
  }
}

customElements.define('game-screen', GameScreen);
