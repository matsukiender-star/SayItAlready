import { html } from '../../utils/dom.js';
import { ICON_GEAR, ICON_HELP, ICON_SEARCH } from '../shared/icons.js';

export const template = html(`
<link rel="stylesheet" href="./css/shared/reset.css">
<link rel="stylesheet" href="./js/components/home-screen/home-screen.css">
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
    <input class="filter-input" type="search" placeholder="Buscar mazos o palabras…"
      aria-label="Buscar mazos" enterkeyhint="search">
  </label>

  <category-chips></category-chips>

  <div class="deck-list" role="listbox" aria-label="Mazos disponibles"></div>
  <p class="empty-state" hidden>No encontramos mazos con esa búsqueda 🤔</p>

  <footer class="footer">Hecho con 💜 · basado en Say It Already (MIT)</footer>
</div>

<deck-sheet></deck-sheet>
<settings-dialog></settings-dialog>
<help-dialog></help-dialog>
<deck-editor></deck-editor>
`);

/** Tarjeta «¿Primera vez?» que abre la ayuda. */
export const helpCardTemplate = html(`
<button class="deck-card-htp">
  <span class="htp-icon">👋</span>
  <span class="htp-label"><b>¿Primera vez?</b> Aprende a jugar en 30 segundos</span>
  <span class="htp-go">→</span>
</button>
`);

/** Tarjeta «＋ Crear mazo». */
export const addCardTemplate = html(`
<button class="deck-card-add">
  <span class="add-icon">＋</span>
  <span class="add-label">Crear mazo</span>
</button>
`);
