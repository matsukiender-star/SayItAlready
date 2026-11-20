/**
 * Arranque de la partida (game.html?deck=…&difficulty=…&tilt=…).
 * Alterna entre <game-screen> y <round-summary>.
 */
import './components/game-screen/game-screen.js';
import './components/round-summary/round-summary.js';
import { findDeck } from './services/storage/deck-store.js';
import { getSettings } from './services/storage/settings.js';
import { probeTiltAvailable } from './services/sensors/tilt-permission.js';
import { isNative } from './services/native/platform.js';
import { lockLandscape, unlockOrientation } from './services/native/orientation.js';
import { onBackButton, onAppPause } from './services/native/app-events.js';
import { hideSplash } from './services/native/system-ui.js';
import { registerServiceWorker } from './services/service-worker.js';

const app = document.getElementById('app');
const HOME_URL = './index.html';
const params = new URLSearchParams(location.search);

/** Configuración de la partida (se reutiliza en «Jugar otra vez»). */
const config = {
  deck: null,
  difficulty: Number(params.get('difficulty') ?? 2),
  controlMode: getSettings().controlMode,
};

/* ---- Vistas ---- */
function currentGame() {
  return app.querySelector('game-screen');
}

function showGame() {
  lockLandscape();
  const game = document.createElement('game-screen');
  Object.assign(game, {
    deck: config.deck,
    duration: getSettings().timerDuration,
    controlMode: config.controlMode,
    difficulty: config.difficulty,
  });
  app.replaceChildren(game);
}

function showSummary(deck, results) {
  unlockOrientation();
  const summary = document.createElement('round-summary');
  summary.data = { deck, results };
  app.replaceChildren(summary);
}

function goHome() {
  unlockOrientation();
  location.replace(HOME_URL);
}

function setState(view) {
  history.replaceState({ view }, '', location.pathname + location.search);
}

/* ---- Eventos ---- */
app.addEventListener('round-end', (e) => {
  setState('results');
  showSummary(e.detail.deck, e.detail.results);
});

app.addEventListener('start-game', () => {
  setState('game');
  showGame();
});

app.addEventListener('go-home', goHome);
app.addEventListener('game-paused', () => history.pushState({ view: 'game-paused' }, ''));
app.addEventListener('game-resumed', () => {
  if (history.state?.view === 'game-paused') history.back();
});

/* ---- Botón atrás (navegador) ---- */
window.addEventListener('popstate', () => {
  const view = history.state?.view;
  if (view === 'game-paused') currentGame()?.showPause();
  else if (view === 'game') currentGame() ? currentGame().hidePause() : showGame();
  else goHome();
});

/* ---- Android: atrás pausa la ronda; en pausa o en el resumen vuelve al inicio ---- */
onBackButton(() => {
  if (currentGame() && history.state?.view === 'game') currentGame().showPause();
  else goHome();
});
onAppPause(() => currentGame()?.showPause());

/* ---- Arranque ---- */
async function boot() {
  hideSplash();
  config.deck = params.get('deck') ? await findDeck(params.get('deck')) : null;
  if (!config.deck) {
    goHome();
    return;
  }
  if (config.controlMode === 'gyro') {
    // En Android no hay permiso que pedir; en la web, el inicio ya lo pidió (tilt=1)
    const canProbe = params.get('tilt') === '1' || isNative();
    const available = canProbe && (await probeTiltAvailable(1500));
    if (!available) config.controlMode = 'touch'; // sin sensor → botones
  }
  setState('game');
  showGame();
}

boot();
registerServiceWorker();
