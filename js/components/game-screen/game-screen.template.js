import { html } from '../../utils/dom.js';

export const template = html(`
<link rel="stylesheet" href="./css/shared/reset.css">
<link rel="stylesheet" href="./js/components/game-screen/game-screen.css">
<link rel="stylesheet" href="./js/components/game-screen/word-stage.css">
<link rel="stylesheet" href="./js/components/game-screen/game-controls.css">
<link rel="stylesheet" href="./js/components/game-screen/game-overlays.css">
<div class="game">
  <div class="bg"></div>
  <div class="timer-bar"><div class="timer-fill"></div></div>

  <div class="hud">
    <div class="hud-pill timer-pill"><span class="hud-icon">⏱</span><span class="timer-text"></span></div>
    <div class="hud-deck"><span class="hud-deck-icon"></span><span class="hud-deck-name"></span></div>
    <div class="hud-pill score-pill"><span class="hud-icon">✅</span><span class="score-num">0</span></div>
  </div>

  <div class="stage" aria-live="polite"></div>

  <div class="tap-zones">
    <button class="tap-zone tap-skip"><span>⏭ Pasar</span></button>
    <button class="tap-zone tap-correct"><span>✅ ¡Correcto!</span></button>
  </div>

  <button class="menu-btn" aria-label="Pausa"><span></span><span></span></button>

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

  <game-countdown></game-countdown>

  <div class="timesup-overlay"><span>¡Tiempo!</span></div>
</div>
`);
