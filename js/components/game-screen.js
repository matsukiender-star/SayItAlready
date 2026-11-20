import { shuffle, wordText, wordDifficulty, filterByDifficulty } from '../models/deck.js';
import { Timer } from '../services/timer.js';
import { TiltDetector } from '../services/tilt-detector.js';
import { AudioManager } from '../services/audio-manager.js';
import { getSettings } from '../services/settings.js';
import { keepAwake, allowSleep, setImmersive } from '../services/native.js';

const template = document.createElement('template');
template.innerHTML = `
<link rel="stylesheet" href="./css/game-screen.css">
<div class="game">
  <div class="bg"></div>
  <div class="timer-bar"><div class="timer-fill"></div></div>

  <div class="hud">
    <div class="hud-pill timer-pill"><span class="hud-icon">⏱</span><span class="timer-text">60</span></div>
    <div class="hud-deck"><span class="hud-deck-icon"></span><span class="hud-deck-name"></span></div>
    <div class="hud-pill score-pill"><span class="hud-icon">✅</span><span class="score-num">0</span></div>
  </div>

  <div class="stage" aria-live="polite"></div>

  <div class="tap-zones">
    <button class="tap-zone tap-skip"><span>⏭ Pasar</span></button>
    <button class="tap-zone tap-correct"><span>✅ ¡Correcto!</span></button>
  </div>

  <button class="menu-btn" aria-label="Pausa">
    <span></span><span></span>
  </button>

  <div class="flash correct"><span class="flash-text">¡Correcto!</span></div>
  <div class="flash skip"><span class="flash-text">¡Paso!</span></div>
  <div class="particles"></div>

  <div class="pause-overlay">
    <div class="pause-card">
      <div class="pause-title">Pausa</div>
      <p class="pause-sub">Respira, el reloj está detenido.</p>
      <button class="btn-resume">▶ Continuar</button>
      <button class="btn-quit">Salir al inicio</button>
    </div>
  </div>

  <div class="swipe-hint">⟵ Pasar · ¡Correcto! ⟶</div>
  <div class="debug-overlay"></div>

  <div class="countdown-overlay">
    <div class="countdown-hint">
      <span class="countdown-phone">📱</span>
      <span>¡Ponte el teléfono en la frente!</span>
    </div>
    <div class="countdown-ring"></div>
    <span class="countdown-num">3</span>
    <div class="countdown-controls"></div>
  </div>

  <div class="timesup-overlay"><span>¡Tiempo!</span></div>
</div>
`;

const CONTROL_HINTS = {
  gyro: 'Inclina hacia abajo ✅ · hacia arriba ⏭',
  swipe: 'Desliza → ✅ · ← ⏭',
  touch: 'Toca derecha ✅ · izquierda ⏭',
};

export class GameScreen extends HTMLElement {
  #deck = null;
  #words = [];
  #index = 0;
  #results = []; // { word, difficulty, result: 'correct' | 'skipped' }
  #timer = null;
  #tilt = null;
  #audio = new AudioManager();
  #duration = 60;
  #controlMode = 'touch'; // 'gyro' | 'touch' | 'swipe'
  #paused = false;
  #ended = false;
  #started = false;
  #difficulty = 2;
  #swipeStartX = 0;
  #swipeStartY = 0;
  #onKey = (e) => this.#handleKey(e);

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  set deck(d) { this.#deck = d; }
  get deck() { return this.#deck; }
  set duration(val) { this.#duration = val; }
  set tiltGranted(val) { if (val) this.#controlMode = 'gyro'; }
  set difficulty(val) { this.#difficulty = val; }
  set controlMode(val) {
    // Sin giroscopio disponible se pasa a botones
    this.#controlMode = val;
  }

  #$(sel) { return this.shadowRoot.querySelector(sel); }

  connectedCallback() {
    if (!this.#deck) return;
    this.#audio.unlock();
    const game = this.#$('.game');
    if (this.#deck.background) game.style.setProperty('--deck-bg', this.#deck.background);
    this.#$('.hud-deck-icon').textContent = this.#deck.icon ?? '🃏';
    this.#$('.hud-deck-name').textContent = this.#deck.name;
    this.#$('.timer-text').textContent = this.#duration;
    this.#$('.countdown-controls').textContent = CONTROL_HINTS[this.#controlMode] ?? '';

    this.#words = shuffle(filterByDifficulty([...this.#deck.words], this.#difficulty));
    this.#index = 0;
    this.#results = [];
    this.#ended = false;

    if (this.#controlMode === 'gyro') this.#createTilt();
    this.#tilt?.listen(); // empieza a leer para calibrar durante la cuenta
    this.#bindControls();
    window.addEventListener('keydown', this.#onKey);

    this.#runCountdown().then(() => {
      if (this.#ended || !this.isConnected) return;
      this.#started = true;
      this.#showWord('enter');
      this.#startTimer();
      if (this.#tilt) {
        this.#tilt.calibrate();
        this.#tilt.start();
      }
    });
    keepAwake();
    setImmersive(true);
  }

  disconnectedCallback() {
    this.#timer?.stop();
    this.#tilt?.stop();
    window.removeEventListener('keydown', this.#onKey);
    allowSleep();
    setImmersive(false);
  }

  /* ---- Cuenta regresiva 3-2-1 ---- */
  #runCountdown() {
    const overlay = this.#$('.countdown-overlay');
    const numEl = overlay.querySelector('.countdown-num');
    const ring = overlay.querySelector('.countdown-ring');
    overlay.classList.remove('hidden');
    let count = 3;
    const show = (text, final = false) => {
      numEl.textContent = text;
      for (const el of [numEl, ring]) {
        el.classList.remove('tick');
        void el.offsetWidth;
        el.classList.add('tick');
      }
      numEl.classList.toggle('go', final);
      this.#audio.tick(final);
    };
    show(count);
    return new Promise((resolve) => {
      const step = () => {
        if (!this.isConnected) return;
        if (this.#paused) { setTimeout(step, 200); return; }
        count--;
        if (count > 0) {
          show(count);
          setTimeout(step, 900);
        } else if (count === 0) {
          show('¡Ya!', true);
          setTimeout(step, 650);
        } else {
          overlay.classList.add('hidden');
          resolve();
        }
      };
      setTimeout(step, 900);
    });
  }

  /* ---- Reloj ---- */
  #startTimer() {
    const fill = this.#$('.timer-fill');
    const timerText = this.#$('.timer-text');
    const pill = this.#$('.timer-pill');
    let lastSecond = this.#duration;
    this.#timer = new Timer({
      duration: this.#duration,
      warningAt: 5,
      onTick: (remaining) => {
        fill.style.transform = `scaleX(${remaining / this.#duration})`;
        const s = Math.ceil(remaining);
        if (s !== lastSecond) {
          lastSecond = s;
          timerText.textContent = s;
          if (s <= 5 && s > 0) {
            pill.classList.remove('beat');
            void pill.offsetWidth;
            pill.classList.add('beat');
          }
        }
      },
      onWarning: () => {
        this.#$('.game').classList.add('warning');
        this.#audio.warning();
      },
      onDone: () => this.#endRound(),
    });
    this.#timer.start();
  }

  /* ---- Giroscopio ---- */
  #createTilt() {
    const debugEl = this.#$('.debug-overlay');
    const showDebug = getSettings().debugOverlay;
    if (showDebug) debugEl.classList.add('visible');
    this.#tilt = new TiltDetector({
      sensitivity: getSettings().tiltSensitivity,
      onCorrect: () => this.#handleCorrect(),
      onSkip: () => this.#handleSkip(),
      onDebug: showDebug ? (d) => {
        debugEl.textContent =
          `${d.extra}\nβ:${d.beta} γ:${d.gamma} ángulo:${d.angle}\n` +
          `estado:${d.state} arriba:${d.tiltUp} abajo:${d.tiltDown} neutral:${d.inNeutral}`;
      } : undefined,
    });
  }

  #bindControls() {
    if (this.#controlMode === 'touch') this.#$('.tap-zones').classList.add('visible');
    if (this.#controlMode === 'swipe') {
      this.#$('.swipe-hint').classList.add('visible');
      this.#bindSwipe();
    }
    this.#$('.tap-correct').addEventListener('click', () => this.#handleCorrect());
    this.#$('.tap-skip').addEventListener('click', () => this.#handleSkip());
    this.#$('.menu-btn').addEventListener('click', () => this.#togglePause());
    this.#$('.btn-resume').addEventListener('click', () => this.#togglePause());
    this.#$('.btn-quit').addEventListener('click', () => this.#quit());
  }

  #handleKey(e) {
    if (e.repeat || this.#ended) return;
    if (e.key === 'Escape' || e.key === 'p') { e.preventDefault(); this.#togglePause(); return; }
    if (this.#paused) return;
    if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); this.#handleCorrect(); }
    else if (e.key === 'Enter' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); this.#handleSkip(); }
  }

  /* ---- Deslizar ---- */
  #bindSwipe() {
    const el = this.#$('.game');
    const MIN_DX = 60;
    const MAX_DY_RATIO = 0.7;
    el.addEventListener('touchstart', (e) => {
      if (this.#paused) return;
      const t = e.changedTouches[0];
      this.#swipeStartX = t.clientX;
      this.#swipeStartY = t.clientY;
    }, { passive: true });
    el.addEventListener('touchend', (e) => {
      if (this.#paused) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - this.#swipeStartX;
      const dy = Math.abs(t.clientY - this.#swipeStartY);
      if (Math.abs(dx) < MIN_DX || dy / Math.abs(dx) > MAX_DY_RATIO) return;
      if (dx > 0) this.#handleCorrect();
      else this.#handleSkip();
    }, { passive: true });
  }

  #togglePause() {
    if (this.#ended) return;
    this.#paused = !this.#paused;
    const pauseOverlay = this.#$('.pause-overlay');
    if (this.#paused) {
      this.#timer?.stop();
      this.#tilt?.stop();
      pauseOverlay.classList.add('visible');
      this.#$('.game').classList.add('paused');
      this.dispatchEvent(new CustomEvent('game-paused', { bubbles: true, composed: true }));
    } else {
      if (this.#started) {
        this.#timer?.start();
        this.#tilt?.start();
      } else {
        this.#tilt?.listen();
      }
      pauseOverlay.classList.remove('visible');
      this.#$('.game').classList.remove('paused');
      this.dispatchEvent(new CustomEvent('game-resumed', { bubbles: true, composed: true }));
    }
  }

  #quit() {
    this.#ended = true;
    this.#timer?.stop();
    this.#tilt?.stop();
    this.dispatchEvent(new CustomEvent('go-home', { bubbles: true, composed: true }));
  }

  showPause() { if (!this.#paused) this.#togglePause(); }
  hidePause() { if (this.#paused) this.#togglePause(); }

  /* ---- Lógica de palabras ---- */

  /** Elige la siguiente palabra según el desempeño reciente. */
  #pickNext() {
    if (this.#index >= this.#words.length - 1) {
      this.#index = this.#words.length;
      return;
    }
    const len = this.#results.length;
    const last = len > 0 ? this.#results[len - 1] : null;
    const prev = len > 1 ? this.#results[len - 2] : null;

    let preferredDir = 0;
    if (last?.result === 'skipped') preferredDir = -1; // pasó → más fácil
    if (last?.result === 'correct' && prev?.result === 'correct') preferredDir = 1; // dos aciertos → más difícil

    if (preferredDir === 0) {
      this.#index++;
      return;
    }
    const curDiff = wordDifficulty(this.#words[this.#index]);
    const targetDiff = Math.max(0, Math.min(this.#difficulty, curDiff + preferredDir));
    let best = -1;
    for (let i = this.#index + 1; i < this.#words.length; i++) {
      if (wordDifficulty(this.#words[i]) === targetDiff) { best = i; break; }
    }
    if (best !== -1 && best !== this.#index + 1) {
      [this.#words[this.#index + 1], this.#words[best]] = [this.#words[best], this.#words[this.#index + 1]];
    }
    this.#index++;
  }

  /** Muestra la palabra actual en una tarjeta nueva y saca la anterior. */
  #showWord(enter = 'enter', exitClass = null) {
    const stage = this.#$('.stage');
    const old = stage.querySelector('.word-card:not(.leaving)');
    if (old) {
      old.classList.add('leaving', exitClass ?? 'exit-fade');
      old.addEventListener('animationend', () => old.remove(), { once: true });
      setTimeout(() => old.remove(), 600);
    }
    if (this.#index >= this.#words.length) {
      this.#endRound();
      return;
    }
    const text = wordText(this.#words[this.#index]);
    const card = document.createElement('div');
    card.className = `word-card ${enter}`;
    const word = document.createElement('div');
    word.className = 'word';
    word.textContent = text;
    // Tamaño de letra según el largo de la palabra
    const len = text.length;
    word.style.setProperty('--size', len > 40 ? '0.5' : len > 26 ? '0.62' : len > 16 ? '0.78' : '1');
    card.appendChild(word);
    stage.appendChild(card);
  }

  #record(result) {
    const w = this.#words[this.#index];
    this.#results.push({ word: wordText(w), difficulty: wordDifficulty(w), result });
  }

  #handleCorrect() {
    if (!this.#started || this.#paused || this.#ended || this.#index >= this.#words.length) return;
    this.#record('correct');
    this.#audio.correct();
    this.#flashFeedback('correct');
    this.#burst();
    this.#bumpScore();
    this.#pickNext();
    this.#showWord('enter', 'exit-correct');
  }

  #handleSkip() {
    if (!this.#started || this.#paused || this.#ended || this.#index >= this.#words.length) return;
    this.#record('skipped');
    this.#audio.skip();
    this.#flashFeedback('skip');
    this.#pickNext();
    this.#showWord('enter', 'exit-skip');
  }

  #bumpScore() {
    const pill = this.#$('.score-pill');
    this.#$('.score-num').textContent = this.#results.filter((r) => r.result === 'correct').length;
    pill.classList.remove('bump');
    void pill.offsetWidth;
    pill.classList.add('bump');
  }

  #flashFeedback(type) {
    const el = this.#$(`.flash.${type}`);
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  /** Partículas de celebración (solo transform/opacity). */
  #burst() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const wrap = this.#$('.particles');
    const colors = ['#1fe0a0', '#ffffff', '#ffd34d', '#7cf3ff', '#ff9a3d'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('i');
      const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.4;
      const dist = 120 + Math.random() * 160;
      p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      p.style.setProperty('--c', colors[i % colors.length]);
      p.style.setProperty('--s', (0.6 + Math.random() * 0.8).toFixed(2));
      wrap.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }
  }

  #endRound() {
    if (this.#ended) return;
    this.#ended = true;
    this.#timer?.stop();
    this.#tilt?.stop();
    // La palabra que estaba en pantalla al acabarse el tiempo cuenta como pasada
    if (this.#index < this.#words.length) this.#record('skipped');
    this.#audio.timesUp();
    this.#$('.timesup-overlay').classList.add('visible');
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('round-end', {
        bubbles: true,
        composed: true,
        detail: { deck: this.#deck, results: this.#results },
      }));
    }, 1100);
  }
}

customElements.define('game-screen', GameScreen);
