/**
 * <deck-card>: tarjeta de un mazo.
 * Eventos: deck-select {deck} · deck-edit {deck} · favorite-change {deck, favorite}
 */
import { html, attachTemplate, emit, restartAnimation } from '../../utils/dom.js';
import { isFavorite, toggleFavorite } from '../../services/storage/favorites.js';
import { feedback } from '../../services/feedback.js';

const template = html(`
<link rel="stylesheet" href="./css/shared/reset.css">
<link rel="stylesheet" href="./js/components/deck-card/deck-card.css">
<div class="card" role="option" tabindex="0">
  <button class="fav"></button>
  <button class="edit" aria-label="Editar mazo" hidden>✏️</button>
  <span class="icon"></span>
  <div class="info">
    <div class="name"></div>
    <div class="count"></div>
  </div>
</div>
`);

const TILT_DEGREES = 14;

export class DeckCard extends HTMLElement {
  #deck = null;
  #bound = false;
  #root = attachTemplate(this, template);

  set deck(deck) {
    this.#deck = deck;
    this.#render();
  }

  get deck() { return this.#deck; }

  connectedCallback() {
    if (this.#bound) return;
    this.#bound = true;
    const card = this.#$('.card');
    card.addEventListener('click', () => emit(this, 'deck-select', { deck: this.#deck }));
    card.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      emit(this, 'deck-select', { deck: this.#deck });
    });
    this.#$('.fav').addEventListener('click', (e) => this.#onFavorite(e));
    this.#$('.edit').addEventListener('click', (e) => {
      e.stopPropagation();
      emit(this, 'deck-edit', { deck: this.#deck });
    });
    card.addEventListener('pointermove', (e) => this.#tilt(e));
    card.addEventListener('pointerleave', () => this.#resetTilt());
  }

  #$(sel) { return this.#root.querySelector(sel); }

  #render() {
    const deck = this.#deck;
    this.#$('.card').style.setProperty('--deck-bg', deck.background || 'var(--brand-gradient)');
    this.#$('.icon').textContent = deck.icon ?? '🃏';
    this.#$('.name').textContent = deck.name;
    this.#$('.count').textContent = `${deck.words?.length ?? 0} palabras`;
    this.#$('.edit').hidden = !deck.custom;
    this.#renderFavorite(isFavorite(deck.id));
  }

  #renderFavorite(fav) {
    const btn = this.#$('.fav');
    btn.classList.toggle('active', fav);
    btn.textContent = fav ? '★' : '☆';
    btn.setAttribute('aria-label', fav ? 'Quitar de favoritos' : 'Agregar a favoritos');
  }

  #onFavorite(e) {
    e.stopPropagation();
    const favorite = toggleFavorite(this.#deck.id);
    feedback.tap();
    this.#renderFavorite(favorite);
    restartAnimation(this.#$('.fav'), 'pop');
    emit(this, 'favorite-change', { deck: this.#deck, favorite });
  }

  /** Inclinación 3D sutil siguiendo el puntero (solo ratón o lápiz). */
  #tilt(e) {
    if (e.pointerType === 'touch') return;
    const card = this.#$('.card');
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--ry', `${x * TILT_DEGREES}deg`);
    card.style.setProperty('--rx', `${-y * TILT_DEGREES}deg`);
    card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
  }

  #resetTilt() {
    const card = this.#$('.card');
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  }
}

customElements.define('deck-card', DeckCard);
