import { html } from '../../utils/dom.js';
import { ICON_CLOSE } from '../shared/icons.js';
import { APP_VERSION } from '../../version.js';

export const template = html(`
<link rel="stylesheet" href="./css/shared/reset.css">
<link rel="stylesheet" href="./css/shared/dialog.css">
<link rel="stylesheet" href="./css/shared/controls.css">
<link rel="stylesheet" href="./js/components/settings-dialog/settings-dialog.css">
<div class="backdrop">
  <div class="dialog" role="dialog" aria-modal="true" aria-label="Ajustes">
    <button class="dialog-close" aria-label="Cerrar">${ICON_CLOSE}</button>

    <div class="settings-about">
      <img class="about-logo" src="icons/icon-nobg.svg" alt="" width="52" height="52">
      <div>
        <div class="about-text">¡Dilo <span>Ya!</span></div>
        <span class="about-version">v${APP_VERSION}</span>
      </div>
      <div class="about-status">
        <span class="update-check"></span>
        <span class="install-check" hidden></span>
      </div>
    </div>

    <div class="settings-section">
      <h3>Controles</h3>
      <div class="control-grid">
        <label class="control-row control-gyro">
          <input type="radio" name="control-mode" value="gyro">
          <span class="control-emoji">📱</span>
          <span class="label">Giroscopio</span>
          <span class="status gyro-status">…</span>
        </label>
        <label class="control-row control-swipe">
          <input type="radio" name="control-mode" value="swipe">
          <span class="control-emoji">👆</span>
          <span class="label">Deslizar</span>
          <span class="status swipe-status"></span>
        </label>
        <label class="control-row control-touch">
          <input type="radio" name="control-mode" value="touch">
          <span class="control-emoji">🔘</span>
          <span class="label">Botones</span>
          <span class="status"></span>
        </label>
      </div>
    </div>

    <div class="settings-section sensitivity-section">
      <h3>Sensibilidad del giroscopio</h3>
      <div class="sensitivity-pills segmented">
        <button data-sens="baja">Baja</button>
        <button data-sens="media">Media</button>
        <button data-sens="alta">Alta</button>
      </div>
      <p class="hint">Alta = basta con inclinar un poco. Baja = hay que inclinar más.</p>
    </div>

    <div class="settings-section">
      <h3>Duración de la ronda</h3>
      <div class="timer-pills segmented">
        <button data-timer="30">30 s</button>
        <button data-timer="60">60 s</button>
        <button data-timer="90">90 s</button>
        <button data-timer="120">2 min</button>
      </div>
    </div>

    <div class="settings-section">
      <h3>Preferencias</h3>
      <label class="switch-row"><span>🔊 Efectos de sonido</span><input type="checkbox" class="switch" data-setting="soundEnabled"></label>
      <label class="switch-row"><span>📳 Vibración</span><input type="checkbox" class="switch" data-setting="vibrationEnabled"></label>
      <label class="switch-row"><span>🐞 Modo depuración del giroscopio</span><input type="checkbox" class="switch" data-setting="debugOverlay"></label>
    </div>
  </div>
</div>
`);
