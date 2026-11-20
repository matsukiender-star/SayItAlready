import { html } from '../../utils/dom.js';

export const template = html(`
<link rel="stylesheet" href="./css/shared/reset.css">
<link rel="stylesheet" href="./js/components/round-summary/round-summary.css">
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
`);
