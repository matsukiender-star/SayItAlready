/**
 * <settings-dialog>: controles, sensibilidad, duración y preferencias.
 * Los cambios se guardan al instante en services/storage/settings.js.
 * Evento: dialog-dismiss
 */
import { DialogElement } from '../shared/dialog-element.js';
import { bindSegmented } from '../shared/segmented.js';
import { template } from './settings-dialog.template.js';
import { renderUpdateStatus, renderInstallStatus } from './app-status.js';
import { getSettings, updateSettings } from '../../services/storage/settings.js';
import { isTiltUsable } from '../../services/sensors/tilt-permission.js';

const hasTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export class SettingsDialog extends DialogElement {
  constructor() {
    super(template);
  }

  setup() {
    const s = getSettings();
    for (const radio of this.$$('input[name="control-mode"]')) {
      radio.checked = radio.value === s.controlMode;
      radio.addEventListener('change', () => {
        if (radio.checked) this.#setControlMode(radio.value);
      });
    }
    for (const box of this.$$('input[data-setting]')) {
      box.checked = !!s[box.dataset.setting];
      box.addEventListener('change', () => updateSettings({ [box.dataset.setting]: box.checked }));
    }
    bindSegmented(this.$('.timer-pills'), 'timer', (v) => updateSettings({ timerDuration: Number(v) }))(String(s.timerDuration));
    bindSegmented(this.$('.sensitivity-pills'), 'sens', (v) => updateSettings({ tiltSensitivity: v }))(s.tiltSensitivity);
    this.#syncSensitivity();
  }

  open() {
    super.open();
    this.#checkControls();
    renderUpdateStatus(this.$('.update-check'));
    renderInstallStatus(this.$('.install-check'));
  }

  #setControlMode(mode) {
    updateSettings({ controlMode: mode });
    this.$(`input[value="${mode}"]`).checked = true;
    this.#syncSensitivity();
  }

  /** La sensibilidad solo importa con el giroscopio. */
  #syncSensitivity() {
    this.$('.sensitivity-section').classList.toggle('dimmed', getSettings().controlMode !== 'gyro');
  }

  /** Desactiva los controles que el dispositivo no soporta. */
  async #checkControls() {
    this.#setAvailable('swipe', hasTouch(), this.$('.swipe-status'));
    const gyroStatus = this.$('.gyro-status');
    gyroStatus.textContent = 'Buscando…';
    this.#setAvailable('gyro', await isTiltUsable(1500), gyroStatus);
  }

  #setAvailable(mode, available, statusEl) {
    const radio = this.$(`input[value="${mode}"]`);
    radio.disabled = !available;
    this.$(`.control-${mode}`).classList.toggle('disabled', !available);
    statusEl.textContent = available ? '' : 'No disponible';
    if (!available && getSettings().controlMode === mode) this.#setControlMode('touch');
  }
}

customElements.define('settings-dialog', SettingsDialog);
