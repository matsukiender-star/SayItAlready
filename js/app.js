/**
 * Arranque de la pantalla de inicio (index.html).
 * El router refleja los diálogos en la URL para que «atrás» los cierre.
 */
import './components/home-screen/home-screen.js';
import './services/install.js';
import { pushView, replaceView, getViewParams, isMainView } from './router/url-state.js';
import { readSharedDeck, readImportHash } from './router/deep-links.js';
import { startGame, gameUrl } from './router/start-game.js';
import { registerServiceWorker } from './services/service-worker.js';
import { onBackButton, exitApp } from './services/native/app-events.js';
import { hideSplash } from './services/native/system-ui.js';
import { unlockOrientation } from './services/native/orientation.js';

const app = document.getElementById('app');

/** Cómo abrir cada vista sobre la pantalla de inicio. */
const VIEW_OPENERS = {
  settings: (home) => home.openSettings(),
  help: (home) => home.openHelp(),
  edit: (home, p) => home.openEditor(p.deck),
  deck: (home, p) => home.openDeckById(p.deck),
};

/* ---- Vistas ---- */
function currentHome() {
  return app.querySelector('home-screen');
}

/** Monta la pantalla de inicio; `onReady` corre cuando cargan los mazos. */
function showHome(onReady) {
  const home = document.createElement('home-screen');
  app.replaceChildren(home);
  if (onReady) home.addEventListener('decks-loaded', () => onReady(home), { once: true });
  return home;
}

/** Abre la vista de la URL, o cierra los diálogos si es la principal. */
function applyView(params) {
  const opener = VIEW_OPENERS[params.view];
  const home = currentHome();
  if (!opener) {
    if (home) home.closeDialogs();
    else showHome();
  } else if (home) {
    opener(home, params);
  } else {
    showHome((h) => opener(h, params));
  }
}

/* ---- Eventos de la pantalla de inicio ---- */
app.addEventListener('deck-preview-open', (e) => pushView({ view: 'deck', deck: e.detail.deckId }));
app.addEventListener('settings-open', () => pushView({ view: 'settings' }));
app.addEventListener('help-open', () => pushView({ view: 'help' }));
app.addEventListener('edit-deck-open', (e) => {
  pushView(e.detail?.deckId ? { view: 'edit', deck: e.detail.deckId } : { view: 'edit' });
});
app.addEventListener('dialog-dismiss', () => history.back());
app.addEventListener('play', (e) => startGame(e.detail));

window.addEventListener('popstate', () => applyView(getViewParams()));

/* ---- Android ---- */
onBackButton(({ canGoBack }) => {
  if (isMainView() || !canGoBack) exitApp();
  else history.back();
});

/* ---- Arranque ---- */
async function boot() {
  const params = getViewParams();
  if ((params.view === 'game' || params.view === 'game-paused') && params.deck) {
    location.replace(gameUrl(params.deck)); // enlaces antiguos
    return;
  }

  // La vista principal queda debajo, así «atrás» cierra el diálogo sin salir.
  replaceView({ view: 'main' });
  let home;
  const shared = params.view === 'edit' ? await readSharedDeck(params.add) : null;
  if (shared) {
    pushView({ view: 'edit' });
    home = showHome((h) => h.openEditorWithDeck(shared));
  } else if (VIEW_OPENERS[params.view]) {
    const { view, deck } = params;
    pushView(deck ? { view, deck } : { view });
    home = showHome((h) => VIEW_OPENERS[view](h, params));
  } else {
    home = showHome();
  }

  const importJson = readImportHash();
  if (importJson) {
    home.addEventListener('decks-loaded', () => {
      home.importFromJSON(importJson).catch((err) => console.warn('No se pudo importar:', err));
    }, { once: true });
  }
}

boot();
hideSplash();
unlockOrientation();
registerServiceWorker();
