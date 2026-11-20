import './components/game-screen.js';
import './components/round-summary.js';
import { loadAllDecks } from './services/deck-store.js';
import { getSettings } from './services/settings.js';
import { probeTiltAvailable } from './services/tilt-detector.js';
import { isNative, lockLandscape, unlockOrientation, hideSplash } from './services/native.js';

const app = document.getElementById('app');
const HOME_URL = './index.html';

/* ---- Parámetros de inicio ---- */
const params = new URLSearchParams(location.search);
const deckId = params.get('deck');
const launchDifficulty = Number(params.get('difficulty') ?? 2);
const tiltHint = params.get('tilt') === '1';

/* ---- Configuración (se conserva en "Jugar otra vez") ---- */
const gameConfig = {
  deck: null,
  difficulty: launchDifficulty,
  controlMode: getSettings().controlMode,
  tiltGranted: false,
};

/* ---- Vistas ---- */
function showGame() {
  lockLandscape();
  app.innerHTML = '';
  const game = document.createElement('game-screen');
  game.deck = gameConfig.deck;
  game.duration = getSettings().timerDuration;
  game.controlMode = gameConfig.controlMode;
  game.tiltGranted = gameConfig.tiltGranted;
  game.difficulty = gameConfig.difficulty;
  app.appendChild(game);
}

function showSummary(deck, results) {
  unlockOrientation();
  app.innerHTML = '';
  const summary = document.createElement('round-summary');
  summary.data = { deck, results };
  app.appendChild(summary);
}

function goHome() {
  unlockOrientation();
  location.replace(HOME_URL);
}

/* ---- Eventos ---- */
app.addEventListener('round-end', (e) => {
  const { deck, results } = e.detail;
  history.replaceState({ view: 'results' }, '', location.pathname + location.search);
  showSummary(deck, results);
});

app.addEventListener('start-game', () => {
  history.replaceState({ view: 'game' }, '', location.pathname + location.search);
  showGame();
});

app.addEventListener('go-home', goHome);

app.addEventListener('game-paused', () => {
  history.pushState({ view: 'game-paused' }, '');
});

app.addEventListener('game-resumed', () => {
  if (history.state?.view === 'game-paused') history.back();
});

/* ---- Botón atrás ---- */
window.addEventListener('popstate', () => {
  switch (history.state?.view) {
    case 'game-paused':
      app.querySelector('game-screen')?.showPause();
      break;
    case 'game': {
      const game = app.querySelector('game-screen');
      if (game) game.hidePause();
      else showGame();
      break;
    }
    default:
      goHome();
  }
});

// En Android: "atrás" durante el juego pausa; en pausa o en el resumen vuelve al inicio.
if (isNative()) {
  const capApp = globalThis.Capacitor?.Plugins?.App;
  capApp?.addListener?.('backButton', () => {
    const game = app.querySelector('game-screen');
    if (game && history.state?.view === 'game') game.showPause();
    else goHome();
  });
  // Si la app pasa a segundo plano, se pausa la ronda
  capApp?.addListener?.('pause', () => app.querySelector('game-screen')?.showPause());
}

/* ---- Arranque ---- */
(async () => {
  hideSplash();
  if (!deckId) { goHome(); return; }

  const allDecks = await loadAllDecks();
  const deck = allDecks.find((d) => d.id === deckId || d.name === deckId);
  if (!deck) { goHome(); return; }
  gameConfig.deck = deck;

  if (gameConfig.controlMode === 'gyro') {
    // En la app nativa no hace falta permiso: se comprueba directamente
    gameConfig.tiltGranted = (tiltHint || isNative()) ? await probeTiltAvailable(1500) : false;
    if (!gameConfig.tiltGranted) gameConfig.controlMode = 'touch'; // sin sensor → botones
  }

  history.replaceState({ view: 'game' }, '', location.pathname + location.search);
  showGame();
})();

/* ---- Service worker (solo versión web) ---- */
if ('serviceWorker' in navigator && !isNative()) {
  navigator.serviceWorker.register('./sw.js').catch((err) => {
    console.warn('No se pudo registrar el service worker:', err);
  });
}
