/**
 * Etiquetas de estado del diálogo de ajustes: «Actualizada» / «actualizar»
 * e «Instalada» / «Instalar app». En Android no aplican (siempre instalada).
 */
import { isNative } from '../../services/native/platform.js';
import { checkRemoteVersion, applyUpdate } from '../../services/app-update.js';
import { getInstallPrompt, clearInstallPrompt, isInstalledPWA } from '../../services/install.js';

function pill(text, kind) {
  const el = document.createElement(kind === 'action' ? 'button' : 'span');
  el.className = `status-pill ${kind}`;
  el.textContent = text;
  return el;
}

export async function renderUpdateStatus(container) {
  container.replaceChildren();
  if (isNative()) return; // en Android las actualizaciones llegan con un APK nuevo
  const remote = await checkRemoteVersion();
  if (!remote) {
    container.append(pill('Actualizada', 'ok'));
    return;
  }
  const btn = pill(`v${remote} — actualizar`, 'action');
  btn.addEventListener('click', () => {
    btn.textContent = 'Actualizando…';
    btn.disabled = true;
    applyUpdate();
  }, { once: true });
  container.append(btn);
}

export function renderInstallStatus(container) {
  container.replaceChildren();
  if (isNative() || isInstalledPWA()) {
    container.hidden = false;
    container.append(pill('Instalada', 'ok'));
    return;
  }
  const prompt = getInstallPrompt();
  container.hidden = !prompt;
  if (!prompt) return;
  const btn = pill('Instalar app', 'action');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    try {
      await prompt.prompt();
      if ((await prompt.userChoice).outcome === 'accepted') {
        clearInstallPrompt();
        container.replaceChildren(pill('Instalada', 'ok'));
        return;
      }
    } catch { /* cancelado */ }
    btn.disabled = false;
  });
  container.append(btn);
}
