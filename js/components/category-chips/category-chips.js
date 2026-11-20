/**
 * <category-chips>: filtros de categoría.
 * Uso: chips.update(decks) · chips.value
 * Evento: category-change {category}
 */
import { html, attachTemplate, emit } from '../../utils/dom.js';
import { CATEGORIES, deckInCategory } from '../../models/categories.js';

const template = html(`
<link rel="stylesheet" href="./css/shared/reset.css">
<link rel="stylesheet" href="./js/components/category-chips/category-chips.css">
<div class="chips" role="tablist" aria-label="Categorías"></div>
`);

export class CategoryChips extends HTMLElement {
  #root = attachTemplate(this, template);
  #value = 'todos';

  get value() { return this.#value; }

  /** Dibuja solo las categorías que tienen mazos (más la seleccionada). */
  update(decks) {
    const wrap = this.#root.querySelector('.chips');
    wrap.innerHTML = '';
    for (const c of CATEGORIES) {
      const hasDecks = decks.some((d) => deckInCategory(d, c.id));
      if (!hasDecks && c.id !== 'todos' && c.id !== this.#value) continue;
      wrap.appendChild(this.#chip(c));
    }
  }

  #chip(category) {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.setAttribute('role', 'tab');
    btn.dataset.cat = category.id;
    btn.setAttribute('aria-selected', String(category.id === this.#value));
    btn.innerHTML = `<span aria-hidden="true">${category.icon}</span> ${category.label}`;
    btn.addEventListener('click', () => this.#select(btn));
    return btn;
  }

  #select(btn) {
    this.#value = btn.dataset.cat;
    this.#root.querySelectorAll('.chip')
      .forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
    btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    emit(this, 'category-change', { category: this.#value });
  }
}

customElements.define('category-chips', CategoryChips);
