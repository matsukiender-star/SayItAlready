import { loadAllDecks, recordPlay, getPlayHistory, sortDecksByRecency, saveDeck, deleteDeck, toggleFavorite, isFavorite } from '../services/deck-store.js';
import { requestTiltPermission, probeTiltAvailable } from '../services/tilt-detector.js';
import { wordText, hasDifficultyTags, filterByDifficulty } from '../models/deck.js';
import { getSettings, updateSettings } from '../services/settings.js';
import { APP_VERSION } from '../version.js';
import { getInstallPrompt, clearInstallPrompt, isInstalledPWA } from '../services/install.js';
import { compressToBase64 } from '../services/compress.js';
import { qrcodeSVG } from '../vendor/qrcode.js';
import { isNative, vibrate } from '../services/native.js';

const HTP_KEY = 'diloya-htp-seen';

const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: '✨' },
  { id: 'favoritos', label: 'Favoritos', icon: '★' },
  { id: 'clasicos', label: 'Clásicos', icon: '🧩' },
  { id: 'entretenimiento', label: 'Entretenimiento', icon: '🎬' },
  { id: 'cultura-pop', label: 'Cultura pop', icon: '🔥' },
  { id: 'mimica', label: 'Mímica', icon: '🎭' },
  { id: 'mios', label: 'Mis mazos', icon: '🛠️' },
];

const DIFF_LABELS = ['Fácil', 'Normal', 'Difícil'];
const CONTROL_LABELS = { gyro: '📱 Giroscopio', swipe: '👆 Deslizar', touch: '🔘 Botones' };

const ICON_GEAR = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
const ICON_HELP = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`;
const ICON_SEARCH = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`;
const ICON_CLOSE = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`;

const template = document.createElement('template');
template.innerHTML = `
<link rel="stylesheet" href="./css/home-screen.css">
<div class="home">
  <header class="header">
    <div class="brand">
      <img class="brand-logo" src="icons/icon-nobg.svg" alt="" width="56" height="56">
      <div class="brand-text">
        <h1 class="brand-title">¡Dilo <span>Ya!</span></h1>
        <p class="brand-sub">El juego de adivinar con el teléfono en la frente</p>
      </div>
    </div>
    <div class="header-actions">
      <button class="icon-btn help-btn" aria-label="Cómo jugar">${ICON_HELP}</button>
      <button class="icon-btn settings-btn" aria-label="Ajustes">${ICON_GEAR}</button>
    </div>
  </header>

  <button class="hero">
    <span class="hero-dice" aria-hidden="true">🎲</span>
    <span class="hero-text">
      <span class="hero-title">¡Sorpréndeme!</span>
      <span class="hero-sub">Elige un mazo al azar y a jugar</span>
    </span>
    <span class="hero-arrow" aria-hidden="true">→</span>
  </button>

  <label class="search">
    ${ICON_SEARCH}
    <input class="filter-input" type="search" placeholder="Buscar mazos o palabras…" aria-label="Buscar mazos" enterkeyhint="search">
  </label>

  <div class="chips" role="tablist" aria-label="Categorías"></div>

  <div class="deck-list" role="listbox" aria-label="Mazos disponibles"></div>
  <p class="empty-state" hidden>No encontramos mazos con esa búsqueda 🤔</p>

  <footer class="footer">Hecho con 💜 · basado en <span>Say It Already</span> (MIT)</footer>
</div>

<div class="import-backdrop backdrop">
  <div class="import-dialog dialog">
    <button class="edit-close dialog-close" aria-label="Cerrar">${ICON_CLOSE}</button>
    <h2 class="edit-title">Nuevo mazo</h2>

    <div class="edit-tabs segmented">
      <button class="tab-editor active" data-tab="editor">Editor</button>
      <button class="tab-json" data-tab="json">JSON</button>
      <button class="tab-qr" data-tab="qr">Código QR</button>
    </div>

    <div class="edit-pane visible">
      <div class="edit-field-row">
        <div class="edit-field edit-field-icon">
          <label>Ícono</label>
          <input class="edit-icon" type="text" placeholder="🎲" maxlength="4">
        </div>
        <div class="edit-field" style="flex:3">
          <label>Nombre</label>
          <input class="edit-name" type="text" placeholder="Mi mazo">
        </div>
      </div>
      <div class="edit-field">
        <label>Descripción</label>
        <input class="edit-desc" type="text" placeholder="Un mazo divertido sobre…">
      </div>
      <div class="edit-field">
        <label>Colores</label>
        <div class="edit-color-row">
          <input class="edit-color1" type="color" value="#7c5cff" aria-label="Color 1">
          <input class="edit-color2" type="color" value="#ff3d7f" aria-label="Color 2">
          <div class="edit-color-preview"></div>
        </div>
      </div>
      <div class="edit-field">
        <div class="edit-words-header">Palabras</div>
        <div class="edit-words-list"></div>
        <button class="add-word-btn">＋ Agregar palabra</button>
      </div>
    </div>

    <div class="json-pane">
      <textarea class="json-textarea" spellcheck="false" placeholder='{"id":"mi-mazo","name":"Mi mazo","icon":"🎲","words":[{"text":"Ejemplo","tags":["difficulty:0"]}]}'></textarea>
    </div>

    <div class="qr-pane">
      <div class="qr-output"></div>
      <div class="qr-url-row">
        <input class="qr-url" type="text" readonly aria-label="Enlace para compartir">
        <button class="qr-copy" title="Copiar enlace">📋</button>
      </div>
      <div class="qr-error"></div>
    </div>

    <div class="import-error" role="alert"></div>
    <div class="import-actions">
      <button class="import-delete btn btn-danger">Eliminar</button>
      <button class="import-cancel btn btn-ghost">Cancelar</button>
      <button class="import-submit btn btn-primary">Guardar</button>
    </div>
  </div>
</div>

<div class="htp-backdrop backdrop">
  <div class="htp-dialog dialog">
    <button class="htp-close dialog-close" aria-label="Cerrar">${ICON_CLOSE}</button>

    <div class="htp-page active" data-page="0">
      <div class="htp-hero" aria-hidden="true"><span class="htp-phone">📱</span><span class="htp-head">🙂</span></div>
      <h2>Cómo jugar</h2>
      <p class="htp-intro">Un juego de adivinanzas para jugar en grupo.</p>
      <ol class="htp-steps">
        <li><b>Elige un mazo.</b> Películas, animales, mímica… ¡el que tu grupo domine!</li>
        <li><b>Ponte el teléfono en la frente</b> con la pantalla hacia tus amigos. Tú no puedes ver la palabra.</li>
        <li><b>Tus amigos te dan pistas</b> sin decir la palabra: pueden describir, actuar o hacer sonidos.</li>
        <li><b>Inclina hacia abajo</b> si adivinaste ✅ o <b>hacia arriba</b> para pasar ⏭️.</li>
        <li><b>¡Gánale al reloj!</b> Adivina todas las que puedas antes de que se acabe el tiempo.</li>
      </ol>
    </div>

    <div class="htp-page" data-page="1">
      <div class="htp-hero" aria-hidden="true"><span class="htp-tilt">↕️</span></div>
      <h2>Controles</h2>
      <p class="htp-intro">Cámbialos en ⚙️ Ajustes.</p>
      <ol class="htp-steps">
        <li><b>Giroscopio:</b> inclina el teléfono. Al terminar la cuenta 3-2-1 se calibra con tu postura.</li>
        <li><b>Deslizar:</b> desliza a la derecha para acierto y a la izquierda para pasar.</li>
        <li><b>Botones:</b> toca la mitad derecha (acierto) o izquierda (pasar).</li>
        <li><b>Teclado:</b> <kbd>Espacio</kbd> acierto, <kbd>Enter</kbd> pasar, <kbd>Esc</kbd> pausa.</li>
        <li><b>Sensibilidad:</b> si el giroscopio cuenta de más o de menos, ajústala en Ajustes.</li>
      </ol>
    </div>

    <div class="htp-page" data-page="2">
      <div class="htp-hero" aria-hidden="true"><span class="htp-tilt">🛠️</span></div>
      <h2>Crea tus mazos</h2>
      <p class="htp-intro">Haz mazos con chistes locales y compártelos.</p>
      <ol class="htp-steps">
        <li><b>Toca la tarjeta ＋ Crear mazo</b> al final de la lista.</li>
        <li><b>Ponle nombre, ícono y colores</b>, y agrega palabras de dificultad Fácil, Normal o Difícil.</li>
        <li><b>Comparte con QR</b> o copia el JSON para enviarlo por WhatsApp.</li>
        <li><b>Edita o borra</b> tus mazos con el botón ✏️ de su tarjeta.</li>
      </ol>
    </div>

    <div class="htp-nav">
      <button class="htp-nav-btn htp-prev hidden">← Atrás</button>
      <div class="htp-dots">
        <div class="htp-dot active"></div>
        <div class="htp-dot"></div>
        <div class="htp-dot"></div>
      </div>
      <button class="htp-nav-btn htp-next">Siguiente →</button>
    </div>
    <button class="htp-got-it btn btn-primary">¡Entendido!</button>
  </div>
</div>

<div class="modal-backdrop backdrop">
  <div class="modal sheet" role="dialog" aria-modal="true" aria-labelledby="modal-name">
    <div class="modal-card">
      <button class="modal-close dialog-close" aria-label="Cerrar">${ICON_CLOSE}</button>
      <div class="modal-icon"></div>
      <div class="modal-name" id="modal-name"></div>
      <div class="modal-desc"></div>
      <div class="modal-count"></div>
    </div>
    <div class="modal-body">
      <div class="section-label">Algunas palabras</div>
      <div class="modal-examples"></div>
      <div class="difficulty-wrap">
        <div class="section-label">Dificultad</div>
        <div class="difficulty-pills segmented">
          <button data-diff="0">Fácil</button>
          <button data-diff="1" class="selected">Normal</button>
          <button data-diff="2">Difícil</button>
        </div>
      </div>
      <div class="modal-meta"></div>
      <button class="modal-start btn btn-primary btn-xl">¡Jugar!</button>
    </div>
  </div>
</div>

<div class="settings-backdrop backdrop">
  <div class="settings-dialog dialog">
    <button class="settings-close dialog-close" aria-label="Cerrar">${ICON_CLOSE}</button>

    <div class="settings-about">
      <img class="about-logo" src="icons/icon-nobg.svg" alt="" width="52" height="52">
      <div>
        <div class="about-text">¡Dilo <span>Ya!</span></div>
        <span class="about-version">v${APP_VERSION}</span>
      </div>
      <div class="about-status">
        <span class="update-check"></span>
        <span class="install-check" style="display:none"></span>
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
          <span class="status swipe-status">…</span>
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
      <label class="switch-row"><span>🔊 Efectos de sonido</span><input type="checkbox" class="chk-sound switch" checked></label>
      <label class="switch-row"><span>📳 Vibración</span><input type="checkbox" class="chk-vibration switch" checked></label>
      <label class="switch-row"><span>🐞 Modo depuración del giroscopio</span><input type="checkbox" class="chk-debug switch"></label>
    </div>
  </div>
</div>
`;

export class HomeScreen extends HTMLElement {
  #selectedDeck = null;
  #selectedDifficulty = 1;
  #decks = [];
  #category = 'todos';
  #editingDeck = null; // mazo en edición (null = nuevo)

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.#loadDecks();
    this.#bindModal();
    this.#bindFilter();
    this.#bindSettings();
    this.#bindImport();
    this.#bindHowToPlay();
    this.#bindHero();
  }

  async #loadDecks() {
    this.#decks = sortDecksByRecency(await loadAllDecks());
    this.#renderChips();
    this.#renderDecks();
    this.dispatchEvent(new Event('decks-loaded', { bubbles: true, composed: true }));
  }

  #$(sel) { return this.shadowRoot.querySelector(sel); }

  #filterValue() { return this.#$('.filter-input').value; }

  /* ---- Categorías ---- */
  #deckMatchesCategory(deck, cat) {
    switch (cat) {
      case 'todos': return true;
      case 'favoritos': return isFavorite(deck.id);
      case 'mios': return !!deck.custom;
      default: return deck.category === cat;
    }
  }

  #renderChips() {
    const wrap = this.#$('.chips');
    wrap.innerHTML = '';
    for (const c of CATEGORIES) {
      const count = this.#decks.filter((d) => this.#deckMatchesCategory(d, c.id)).length;
      if (count === 0 && c.id !== 'todos' && c.id !== this.#category) continue;
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.setAttribute('role', 'tab');
      btn.dataset.cat = c.id;
      btn.setAttribute('aria-selected', String(c.id === this.#category));
      btn.innerHTML = `<span aria-hidden="true">${c.icon}</span> ${c.label}`;
      btn.addEventListener('click', () => {
        this.#category = c.id;
        wrap.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        this.#renderDecks(this.#filterValue());
      });
      wrap.appendChild(btn);
    }
  }

  #visibleDecks(filter = '') {
    const q = filter.trim().toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '');
    return this.#decks.filter((d) => {
      if (!this.#deckMatchesCategory(d, this.#category)) return false;
      if (!q) return true;
      const hay = JSON.stringify([d.name, d.description, d.words]).toLocaleLowerCase('es')
        .normalize('NFD').replace(/\p{Diacritic}/gu, '');
      return hay.includes(q);
    });
  }

  /* ---- Lista de mazos ---- */
  #renderDecks(filter = '') {
    const list = this.#$('.deck-list');
    list.innerHTML = '';
    const filtered = this.#visibleDecks(filter);

    const htpSeen = this.#htpSeen();
    let i = 0;
    if (!htpSeen && !filter) {
      const htpCard = this.#createHtpCard();
      htpCard.style.setProperty('--i', i++);
      list.appendChild(htpCard);
    }

    for (const deck of filtered) {
      list.appendChild(this.#createDeckCard(deck, i++));
    }

    if (this.#category === 'todos' || this.#category === 'mios') {
      const addCard = document.createElement('button');
      addCard.className = 'deck-card-add';
      addCard.style.setProperty('--i', i++);
      addCard.innerHTML = `<span class="add-icon">＋</span><span class="add-label">Crear mazo</span>`;
      addCard.addEventListener('click', () => this.#openImportDialog());
      list.appendChild(addCard);
    }

    this.#$('.empty-state').hidden = filtered.length > 0;
  }

  #createDeckCard(deck, i) {
    const card = document.createElement('div');
    card.className = 'deck-card';
    card.setAttribute('role', 'option');
    card.tabIndex = 0;
    card.style.setProperty('--i', i);
    if (deck.background) card.style.setProperty('--deck-bg', deck.background);

    const fav = isFavorite(deck.id);
    const favBtn = document.createElement('button');
    favBtn.className = `deck-fav ${fav ? 'active' : ''}`;
    favBtn.dataset.deckId = deck.id;
    favBtn.setAttribute('aria-label', fav ? 'Quitar de favoritos' : 'Agregar a favoritos');
    favBtn.textContent = fav ? '★' : '☆';
    card.appendChild(favBtn);

    if (deck.custom) {
      const editBtn = document.createElement('button');
      editBtn.className = 'deck-edit';
      editBtn.setAttribute('aria-label', 'Editar mazo');
      editBtn.textContent = '✏️';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.#openEditDialog(deck);
        this.dispatchEvent(new CustomEvent('edit-deck-open', { bubbles: true, composed: true, detail: { deckId: deck.id } }));
      });
      card.appendChild(editBtn);
    }

    const iconSpan = document.createElement('span');
    iconSpan.className = 'deck-icon';
    iconSpan.textContent = deck.icon ?? '🃏';
    card.appendChild(iconSpan);

    const info = document.createElement('div');
    info.className = 'deck-info';
    const nameDiv = document.createElement('div');
    nameDiv.className = 'deck-name';
    nameDiv.textContent = deck.name;
    const countDiv = document.createElement('div');
    countDiv.className = 'deck-count';
    countDiv.textContent = `${deck.words?.length ?? 0} palabras`;
    info.append(nameDiv, countDiv);
    card.appendChild(info);

    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const now = toggleFavorite(deck.id);
      vibrate(20);
      favBtn.classList.toggle('active', now);
      favBtn.textContent = now ? '★' : '☆';
      favBtn.classList.remove('pop');
      void favBtn.offsetWidth;
      favBtn.classList.add('pop');
      this.#decks = sortDecksByRecency(this.#decks);
      this.#renderChips();
      if (this.#category === 'favoritos') {
        setTimeout(() => this.#renderDecks(this.#filterValue()), 350);
      }
    });

    const open = () => {
      this.#openModal(deck);
      this.dispatchEvent(new CustomEvent('deck-preview-open', { bubbles: true, composed: true, detail: { deckId: deck.id } }));
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });

    // Inclinación 3D sutil siguiendo el puntero (solo ratón / lápiz)
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${x * 14}deg`);
      card.style.setProperty('--rx', `${-y * 14}deg`);
      card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
    return card;
  }

  #htpSeen() {
    try {
      return localStorage.getItem(HTP_KEY) === '1' || Object.keys(getPlayHistory()).length > 0;
    } catch { return false; }
  }

  #markHtpSeen() {
    try {
      if (localStorage.getItem(HTP_KEY) !== '1') {
        localStorage.setItem(HTP_KEY, '1');
        this.#renderDecks(this.#filterValue());
      }
    } catch { /* sin almacenamiento */ }
  }

  #createHtpCard() {
    const card = document.createElement('button');
    card.className = 'deck-card-htp';
    card.innerHTML = `<span class="htp-icon">👋</span><span class="htp-label"><b>¿Primera vez?</b> Aprende a jugar en 30 segundos</span><span class="htp-go">→</span>`;
    card.addEventListener('click', () => this.#openHowToPlay());
    return card;
  }

  /* ---- Sorpréndeme ---- */
  #bindHero() {
    this.#$('.hero').addEventListener('click', () => {
      const pool = this.#visibleDecks(this.#filterValue()).filter((d) => d.words?.length);
      const list = pool.length ? pool : this.#decks;
      if (!list.length) return;
      const hero = this.#$('.hero');
      hero.classList.remove('rolling');
      void hero.offsetWidth;
      hero.classList.add('rolling');
      vibrate(30);
      const deck = list[Math.floor(Math.random() * list.length)];
      setTimeout(() => {
        this.#openModal(deck);
        this.dispatchEvent(new CustomEvent('deck-preview-open', { bubbles: true, composed: true, detail: { deckId: deck.id } }));
      }, 420);
    });
  }

  /* ---- Cómo jugar ---- */
  #openHowToPlay() {
    this._htpShowPage?.();
    this.#$('.htp-backdrop').classList.add('open');
    this.dispatchEvent(new CustomEvent('help-open', { bubbles: true, composed: true }));
  }

  #closeHowToPlay() {
    this.#$('.htp-backdrop').classList.remove('open');
    this.#markHtpSeen();
    history.back();
  }

  #bindHowToPlay() {
    const backdrop = this.#$('.htp-backdrop');
    this.#$('.help-btn').addEventListener('click', () => this.#openHowToPlay());
    this.#$('.htp-close').addEventListener('click', () => this.#closeHowToPlay());
    this.#$('.htp-got-it').addEventListener('click', () => this.#closeHowToPlay());
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.#closeHowToPlay();
    });

    const pages = this.shadowRoot.querySelectorAll('.htp-page');
    const dots = this.shadowRoot.querySelectorAll('.htp-dot');
    const prev = this.#$('.htp-prev');
    const next = this.#$('.htp-next');
    const gotIt = this.#$('.htp-got-it');
    let current = 0;
    const total = pages.length;

    const showPage = (i) => {
      current = i;
      pages.forEach((p, idx) => p.classList.toggle('active', idx === i));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
      prev.classList.toggle('hidden', i === 0);
      next.classList.toggle('hidden', i === total - 1);
      gotIt.style.display = i === total - 1 ? '' : 'none';
      this.#$('.htp-dialog').scrollTop = 0;
    };

    prev.addEventListener('click', () => { if (current > 0) showPage(current - 1); });
    next.addEventListener('click', () => { if (current < total - 1) showPage(current + 1); });

    this._htpShowPage = () => showPage(0);
  }

  #bindFilter() {
    const input = this.#$('.filter-input');
    input.addEventListener('input', () => this.#renderDecks(input.value));
  }

  /* ---- Editor de mazos ---- */
  #bindImport() {
    const backdrop = this.#$('.import-backdrop');
    const errorEl = this.#$('.import-error');

    this.#$('.edit-close').addEventListener('click', () => this.#closeEditDialog());
    this.#$('.import-cancel').addEventListener('click', () => this.#closeEditDialog());
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.#closeEditDialog();
    });

    const tabs = this.#$('.edit-tabs');
    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-tab]');
      if (!btn) return;
      const mode = btn.dataset.tab;
      tabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
      this.#$('.edit-pane').classList.toggle('visible', mode === 'editor');
      this.#$('.json-pane').classList.toggle('visible', mode === 'json');
      this.#$('.qr-pane').classList.toggle('visible', mode === 'qr');
      if (mode === 'json') {
        this.#$('.json-textarea').value = JSON.stringify(this.#buildDeckFromEditor(), null, 2);
      } else if (mode === 'qr') {
        this.#generateQR();
      } else {
        try {
          this.#populateEditor(JSON.parse(this.#$('.json-textarea').value));
        } catch { /* JSON inválido: se deja el editor como está */ }
      }
    });

    this.#$('.qr-copy').addEventListener('click', () => {
      const url = this.#$('.qr-url').value;
      if (url) navigator.clipboard?.writeText(url).then(() => {
        const btn = this.#$('.qr-copy');
        btn.textContent = '✓';
        setTimeout(() => (btn.textContent = '📋'), 1500);
      });
    });

    const color1 = this.#$('.edit-color1');
    const color2 = this.#$('.edit-color2');
    color1.addEventListener('input', () => this.#updateColorPreview());
    color2.addEventListener('input', () => this.#updateColorPreview());

    this.#$('.add-word-btn').addEventListener('click', () => {
      const list = this.#$('.edit-words-list');
      const lastSelect = list.querySelector('.edit-word-row:last-child select');
      this.#addWordRow('', lastSelect ? lastSelect.value : '0');
      list.querySelector('.edit-word-row:last-child input')?.focus();
    });

    this.#$('.import-submit').addEventListener('click', async () => {
      errorEl.textContent = '';
      try {
        const isJson = this.#$('.json-pane').classList.contains('visible');
        if (isJson) {
          await this.#importDeckJSON(this.#$('.json-textarea').value.trim());
        } else {
          await this.#saveFromEditor();
        }
        this.#closeEditDialog();
      } catch (err) {
        errorEl.textContent = err.message;
      }
    });

    this.#$('.import-delete').addEventListener('click', async () => {
      if (!this.#editingDeck) return;
      if (!confirm(`¿Eliminar el mazo "${this.#editingDeck.name}"?`)) return;
      await deleteDeck(this.#editingDeck.id);
      await this.#reloadDecks();
      this.#closeEditDialog();
    });
  }

  async #reloadDecks() {
    this.#decks = sortDecksByRecency(await loadAllDecks());
    this.#renderChips();
    this.#renderDecks(this.#filterValue());
  }

  #closeEditDialog() {
    this.#$('.import-backdrop').classList.remove('open');
    this.#editingDeck = null;
    history.back();
  }

  async #generateQR() {
    const output = this.#$('.qr-output');
    const urlEl = this.#$('.qr-url');
    const errEl = this.#$('.qr-error');
    output.innerHTML = '';
    urlEl.value = '';
    errEl.textContent = '';
    try {
      const deck = this.#buildDeckFromEditor();
      if (!deck.name) throw new Error('Primero ponle un nombre');
      if (!deck.words.length) throw new Error('Primero agrega algunas palabras');
      const compressed = await compressToBase64(JSON.stringify(deck));
      const base = isNative() ? 'https://matsukiender-star.github.io/SayItAlready/' : location.origin + location.pathname;
      const url = `${base}?view=edit&add=${compressed}`;
      urlEl.value = url;
      output.innerHTML = qrcodeSVG(url);
    } catch (err) {
      errEl.textContent = err.message === 'data too large for QR code'
        ? 'El mazo tiene demasiadas palabras para un código QR'
        : (err.message || 'No se pudo generar el código QR');
    }
  }

  #openImportDialog() {
    this.#editingDeck = null;
    this.#resetEditor();
    this.#$('.edit-title').textContent = 'Nuevo mazo';
    this.#$('.import-delete').classList.remove('visible');
    this.#$('.import-backdrop').classList.add('open');
    this.#$('.edit-name').focus();
    this.dispatchEvent(new CustomEvent('edit-deck-open', { bubbles: true, composed: true, detail: { deckId: null } }));
  }

  #openEditDialog(deck) {
    this.#editingDeck = deck;
    this.#resetEditor();
    this.#populateEditor(deck);
    this.#$('.json-textarea').value = JSON.stringify(deck, null, 2);
    this.#$('.edit-title').textContent = 'Editar mazo';
    this.#$('.import-delete').classList.add('visible');
    this.#$('.import-backdrop').classList.add('open');
  }

  static #randomColor() {
    const h = Math.floor(Math.random() * 360);
    const s = 60 + Math.floor(Math.random() * 25);
    const l = 42 + Math.floor(Math.random() * 14);
    const hsl2hex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = (n) => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return '#' + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
    };
    return hsl2hex(h, s, l);
  }

  #updateColorPreview() {
    const c1 = this.#$('.edit-color1').value;
    const c2 = this.#$('.edit-color2').value;
    this.#$('.edit-color-preview').style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
  }

  #resetEditor() {
    this.#$('.import-error').textContent = '';
    this.#$('.edit-icon').value = '';
    this.#$('.edit-name').value = '';
    this.#$('.edit-desc').value = '';
    this.#$('.edit-color1').value = HomeScreen.#randomColor();
    this.#$('.edit-color2').value = HomeScreen.#randomColor();
    this.#updateColorPreview();
    this.#$('.edit-words-list').innerHTML = '';
    this.#$('.json-textarea').value = '';
    const tabs = this.#$('.edit-tabs');
    tabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.tab === 'editor'));
    this.#$('.edit-pane').classList.add('visible');
    this.#$('.json-pane').classList.remove('visible');
    this.#$('.qr-pane').classList.remove('visible');
    this.#$('.qr-output').innerHTML = '';
    this.#$('.qr-url').value = '';
    this.#$('.qr-error').textContent = '';
  }

  #populateEditor(deck) {
    this.#$('.edit-icon').value = deck.icon || '';
    this.#$('.edit-name').value = deck.name || '';
    this.#$('.edit-desc').value = deck.description || '';
    const bgMatch = (deck.background || '').match(/#[0-9a-fA-F]{6}/g);
    if (bgMatch && bgMatch.length >= 2) {
      this.#$('.edit-color1').value = bgMatch[0];
      this.#$('.edit-color2').value = bgMatch[1];
    }
    this.#updateColorPreview();
    this.#$('.edit-words-list').innerHTML = '';
    for (const w of deck.words ?? []) {
      const text = typeof w === 'string' ? w : (w.text || '');
      const diff = typeof w === 'object' && w.tags ? (w.tags.find((t) => t.startsWith('difficulty:')) || '') : '';
      this.#addWordRow(text, diff ? diff.split(':')[1] : '0');
    }
  }

  #addWordRow(text = '', difficulty = '0') {
    const list = this.#$('.edit-words-list');
    const row = document.createElement('div');
    row.className = 'edit-word-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Palabra o frase';
    input.value = text;
    const select = document.createElement('select');
    DIFF_LABELS.forEach((label, val) => {
      const opt = document.createElement('option');
      opt.value = String(val);
      opt.textContent = label;
      if (String(val) === difficulty) opt.selected = true;
      select.appendChild(opt);
    });
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-word';
    removeBtn.setAttribute('aria-label', 'Quitar');
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => row.remove());
    row.append(input, select, removeBtn);
    list.appendChild(row);
  }

  #buildDeckFromEditor() {
    const name = this.#$('.edit-name').value.trim();
    const slug = name.toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mazo';
    const id = this.#editingDeck?.id || `${slug}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const icon = this.#$('.edit-icon').value.trim() || undefined;
    const description = this.#$('.edit-desc').value.trim() || undefined;
    const background = `linear-gradient(135deg, ${this.#$('.edit-color1').value}, ${this.#$('.edit-color2').value})`;
    const words = [];
    for (const row of this.shadowRoot.querySelectorAll('.edit-words-list .edit-word-row')) {
      const text = row.querySelector('input').value.trim();
      if (!text) continue;
      words.push({ text, tags: [`difficulty:${row.querySelector('select').value}`] });
    }
    return { id, name, icon, description, background, words, custom: true };
  }

  async #saveFromEditor() {
    const deck = this.#buildDeckFromEditor();
    if (!deck.name) throw new Error('El nombre es obligatorio');
    if (deck.words.length === 0) throw new Error('Agrega al menos una palabra');
    await saveDeck(deck);
    await this.#reloadDecks();
  }

  /** Valida e importa un mazo desde JSON. */
  async #importDeckJSON(raw) {
    let deck;
    try { deck = JSON.parse(raw); } catch { throw new Error('El JSON no es válido'); }
    if (!deck || typeof deck !== 'object') throw new Error('El mazo debe ser un objeto JSON');
    if (typeof deck.id !== 'string' || !deck.id.trim()) throw new Error('Falta "id" (texto)');
    if (typeof deck.name !== 'string' || !deck.name.trim()) throw new Error('Falta "name" (texto)');
    if (!Array.isArray(deck.words) || deck.words.length === 0) throw new Error('Falta el arreglo "words"');
    for (const w of deck.words) {
      if (typeof w === 'string') continue;
      if (!w || typeof w !== 'object') throw new Error('Cada palabra debe ser texto o {text, tags?}');
      if (typeof w.text !== 'string' || !w.text.trim()) throw new Error('Cada palabra necesita la propiedad "text"');
    }
    deck.words = deck.words.map((w) => (typeof w === 'string' ? { text: w } : w));
    deck.custom = true;
    await saveDeck(deck);
    await this.#reloadDecks();
  }

  /* ---- Ajustes ---- */
  #bindSettings() {
    const backdrop = this.#$('.settings-backdrop');
    const chkSound = this.#$('.chk-sound');
    const chkVibration = this.#$('.chk-vibration');
    const chkDebug = this.#$('.chk-debug');
    const radios = {
      gyro: this.#$('input[value="gyro"]'),
      touch: this.#$('input[value="touch"]'),
      swipe: this.#$('input[value="swipe"]'),
    };

    const settings = getSettings();
    chkSound.checked = settings.soundEnabled;
    chkVibration.checked = settings.vibrationEnabled;
    chkDebug.checked = settings.debugOverlay;
    (radios[settings.controlMode] ?? radios.gyro).checked = true;

    this.#$('.settings-btn').addEventListener('click', () => {
      this.#openSettingsUI();
      this.dispatchEvent(new Event('settings-open', { bubbles: true, composed: true }));
    });
    const close = () => {
      backdrop.classList.remove('open');
      history.back();
    };
    this.#$('.settings-close').addEventListener('click', close);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

    for (const [mode, radio] of Object.entries(radios)) {
      radio.addEventListener('change', () => {
        if (!radio.checked) return;
        updateSettings({ controlMode: mode });
        this.#syncSensitivityVisibility();
      });
    }
    chkSound.addEventListener('change', () => updateSettings({ soundEnabled: chkSound.checked }));
    chkVibration.addEventListener('change', () => updateSettings({ vibrationEnabled: chkVibration.checked }));
    chkDebug.addEventListener('change', () => updateSettings({ debugOverlay: chkDebug.checked }));

    this.#bindSegmented('.timer-pills', 'timer', String(settings.timerDuration || 60),
      (v) => updateSettings({ timerDuration: parseInt(v, 10) }));
    this.#bindSegmented('.sensitivity-pills', 'sens', settings.tiltSensitivity || 'media',
      (v) => updateSettings({ tiltSensitivity: v }));
    this.#syncSensitivityVisibility();
  }

  #bindSegmented(sel, key, initial, onChange) {
    const group = this.#$(sel);
    group.querySelectorAll('button').forEach((b) => b.classList.toggle('selected', b.dataset[key] === initial));
    group.addEventListener('click', (e) => {
      const btn = e.target.closest(`button[data-${key}]`);
      if (!btn) return;
      group.querySelectorAll('button').forEach((b) => b.classList.toggle('selected', b === btn));
      onChange(btn.dataset[key]);
    });
  }

  #syncSensitivityVisibility() {
    this.#$('.sensitivity-section').classList.toggle('dimmed', getSettings().controlMode !== 'gyro');
  }

  async #openSettingsUI() {
    const backdrop = this.#$('.settings-backdrop');
    const radioGyro = this.#$('input[value="gyro"]');
    const radioTouch = this.#$('input[value="touch"]');
    const radioSwipe = this.#$('input[value="swipe"]');
    const gyroRow = this.#$('.control-gyro');
    const swipeRow = this.#$('.control-swipe');
    backdrop.classList.add('open');

    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.#$('.swipe-status').textContent = touchSupported ? '' : 'No disponible';
    radioSwipe.disabled = !touchSupported;
    swipeRow.classList.toggle('disabled', !touchSupported);
    if (!touchSupported && getSettings().controlMode === 'swipe') {
      radioTouch.checked = true;
      updateSettings({ controlMode: 'touch' });
    }

    const gyroAvailable = await this.#probeGyro();
    radioGyro.disabled = !gyroAvailable;
    gyroRow.classList.toggle('disabled', !gyroAvailable);
    if (!gyroAvailable && getSettings().controlMode === 'gyro') {
      radioTouch.checked = true;
      updateSettings({ controlMode: 'touch' });
    }
    this.#syncSensitivityVisibility();

    this.#checkForUpdate();
    this.#updateInstallStatus();
  }

  async #checkForUpdate() {
    const el = this.#$('.update-check');
    el.textContent = '';
    if (isNative()) return; // en Android las actualizaciones llegan con un APK nuevo
    try {
      const resp = await fetch(`./js/version.js?cache=off&uid=${Date.now()}`);
      if (!resp.ok) return;
      const match = (await resp.text()).match(/APP_VERSION\s*=\s*'([^']+)'/);
      if (!match) return;
      const remote = match[1];
      if (remote !== APP_VERSION) {
        const pill = document.createElement('button');
        pill.className = 'status-pill action';
        pill.textContent = `v${remote} — actualizar`;
        pill.addEventListener('click', async () => {
          pill.textContent = 'Actualizando…';
          pill.disabled = true;
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
          const regs = await navigator.serviceWorker?.getRegistrations() ?? [];
          await Promise.all(regs.map((r) => r.unregister()));
          location.reload();
        }, { once: true });
        el.appendChild(pill);
      } else {
        el.innerHTML = '<span class="status-pill ok">Actualizada</span>';
      }
    } catch { /* sin conexión */ }
  }

  #updateInstallStatus() {
    const el = this.#$('.install-check');
    el.innerHTML = '';
    if (isNative() || isInstalledPWA()) {
      el.style.display = '';
      el.innerHTML = '<span class="status-pill ok">Instalada</span>';
      return;
    }
    const prompt = getInstallPrompt();
    if (!prompt) { el.style.display = 'none'; return; }
    el.style.display = '';
    const pill = document.createElement('button');
    pill.className = 'status-pill action';
    pill.textContent = 'Instalar app';
    pill.addEventListener('click', async () => {
      pill.textContent = 'Instalando…';
      pill.disabled = true;
      try {
        await prompt.prompt();
        const result = await prompt.userChoice;
        if (result.outcome === 'accepted') {
          clearInstallPrompt();
          el.innerHTML = '<span class="status-pill ok">Instalada</span>';
          return;
        }
      } catch { /* cancelado */ }
      pill.textContent = 'Instalar app';
      pill.disabled = false;
    }, { once: true });
    el.appendChild(pill);
  }

  async #probeGyro() {
    const el = this.#$('.gyro-status');
    el.textContent = 'Buscando…';
    const permGranted = isNative() || await requestTiltPermission();
    if (!permGranted) { el.textContent = 'Sin permiso'; return false; }
    const available = await probeTiltAvailable(1500);
    el.textContent = available ? '' : 'No disponible';
    return available;
  }

  /* ---- Hoja del mazo ---- */
  #bindModal() {
    const backdrop = this.#$('.modal-backdrop');
    const close = () => { this.#closeModal(); history.back(); };
    this.#$('.modal-close').addEventListener('click', close);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    this.#$('.modal-start').addEventListener('click', () => this.#startGame());
    const pills = this.#$('.difficulty-pills');
    pills.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-diff]');
      if (!btn) return;
      this.#selectedDifficulty = parseInt(btn.dataset.diff, 10);
      pills.querySelectorAll('button').forEach((b) => b.classList.toggle('selected', b === btn));
      this.#updateExamples();
    });
  }

  #openModal(deck) {
    this.#selectedDeck = deck;
    this.#selectedDifficulty = 1;
    this.#$('.modal-icon').textContent = deck.icon ?? '🃏';
    this.#$('.modal-name').textContent = deck.name;
    this.#$('.modal-desc').textContent = deck.description || '';
    this.#$('.modal-count').textContent = `${deck.words?.length ?? 0} palabras`;
    this.#$('.modal-card').style.setProperty('--deck-bg', deck.background || 'var(--brand-gradient)');
    this.#$('.modal').style.setProperty('--deck-bg', deck.background || 'var(--brand-gradient)');
    const s = getSettings();
    this.#$('.modal-meta').innerHTML =
      `<span>⏱ ${s.timerDuration} s</span><span>${CONTROL_LABELS[s.controlMode] ?? ''}</span>`;
    const wrap = this.#$('.difficulty-wrap');
    if (hasDifficultyTags(deck)) {
      wrap.hidden = false;
      this.#$('.difficulty-pills').querySelectorAll('button')
        .forEach((b) => b.classList.toggle('selected', b.dataset.diff === '1'));
    } else {
      wrap.hidden = true;
      this.#selectedDifficulty = 2;
    }
    this.#updateExamples();
    this.#$('.modal-backdrop').classList.add('open');
  }

  #closeModal() {
    this.#selectedDeck = null;
    this.#$('.modal-backdrop').classList.remove('open');
  }

  #updateExamples() {
    if (!this.#selectedDeck) return;
    const examples = this.#$('.modal-examples');
    const pool = hasDifficultyTags(this.#selectedDeck)
      ? filterByDifficulty(this.#selectedDeck.words, this.#selectedDifficulty)
      : this.#selectedDeck.words;
    const sample = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
    examples.innerHTML = '';
    sample.forEach((w, i) => {
      const span = document.createElement('span');
      span.style.setProperty('--i', i);
      span.textContent = wordText(w);
      examples.appendChild(span);
    });
  }

  /* ---- API pública para el router ---- */
  openDeckById(id) {
    const deck = this.#decks?.find((d) => d.id === id || d.name === id);
    if (deck) this.#openModal(deck);
  }

  openSettings() {
    this.#openSettingsUI();
  }

  openHelp() {
    this._htpShowPage?.();
    this.#$('.htp-backdrop').classList.add('open');
    this.#markHtpSeen();
  }

  openEditor(deckId) {
    const deck = deckId ? this.#decks?.find((d) => d.id === deckId) : null;
    if (deck?.custom) this.#openEditDialog(deck);
    else this.#openImportDialog();
  }

  openEditorWithDeck(deckData) {
    this.#openImportDialog();
    this.#populateEditor(deckData);
    this.#$('.json-textarea').value = JSON.stringify(deckData, null, 2);
  }

  async importFromJSON(json) {
    return this.#importDeckJSON(json);
  }

  closeDialogs() {
    this.#closeModal();
    this.#editingDeck = null;
    for (const sel of ['.settings-backdrop', '.import-backdrop', '.htp-backdrop']) {
      this.#$(sel)?.classList.remove('open');
    }
  }

  async #startGame() {
    if (!this.#selectedDeck) return;
    const btn = this.#$('.modal-start');
    btn.classList.add('launching');
    recordPlay(this.#selectedDeck.id);
    const controlMode = getSettings().controlMode;
    let tiltAvailable = false;
    if (controlMode === 'gyro') {
      const permGranted = isNative() || await requestTiltPermission();
      tiltAvailable = permGranted ? await probeTiltAvailable(1500) : false;
    }
    const params = new URLSearchParams({
      deck: this.#selectedDeck.id,
      difficulty: String(this.#selectedDifficulty),
      tilt: tiltAvailable ? '1' : '0',
    });
    location.href = `game.html?${params}`;
  }
}

customElements.define('home-screen', HomeScreen);
