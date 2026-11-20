/** Lista editable de palabras (texto + dificultad) del editor de mazos. */
import { DIFFICULTY_LABELS } from '../../models/labels.js';
import { wordText, wordDifficulty } from '../../models/deck.js';

export class WordRows {
  #list;

  /** @param {HTMLElement} list – contenedor de las filas */
  constructor(list) {
    this.#list = list;
  }

  clear() {
    this.#list.innerHTML = '';
  }

  /** Reemplaza las filas con las palabras de un mazo. */
  setWords(words = []) {
    this.clear();
    for (const w of words) this.add(wordText(w), String(wordDifficulty(w)));
  }

  /** Agrega una fila; por defecto con la dificultad de la última fila. */
  add(text = '', difficulty = this.#lastDifficulty()) {
    const row = document.createElement('div');
    row.className = 'edit-word-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Palabra o frase';
    input.value = text;

    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Dificultad');
    DIFFICULTY_LABELS.forEach((label, value) => {
      select.appendChild(new Option(label, String(value), false, String(value) === difficulty));
    });

    const remove = document.createElement('button');
    remove.className = 'remove-word';
    remove.setAttribute('aria-label', 'Quitar');
    remove.textContent = '✕';
    remove.addEventListener('click', () => row.remove());

    row.append(input, select, remove);
    this.#list.appendChild(row);
    return input;
  }

  /** Palabras no vacías en formato de mazo. */
  getWords() {
    return [...this.#list.querySelectorAll('.edit-word-row')]
      .map((row) => ({
        text: row.querySelector('input').value.trim(),
        tags: [`difficulty:${row.querySelector('select').value}`],
      }))
      .filter((w) => w.text);
  }

  #lastDifficulty() {
    return this.#list.querySelector('.edit-word-row:last-child select')?.value ?? '0';
  }
}
