/** Lista de palabras de la ronda con su dificultad y resultado. */
import { DIFFICULTY_LABELS } from '../../models/labels.js';

const MAX_STAGGER = 30;

function resultRow({ word, result, difficulty }, index) {
  const li = document.createElement('li');
  li.className = result === 'correct' ? 'is-correct' : 'is-skipped';
  li.style.setProperty('--i', Math.min(index, MAX_STAGGER));

  const text = document.createElement('span');
  text.className = 'word';
  text.textContent = word;
  li.appendChild(text);

  if (DIFFICULTY_LABELS[difficulty]) {
    const badge = document.createElement('span');
    badge.className = `diff-badge diff-${difficulty}`;
    badge.textContent = DIFFICULTY_LABELS[difficulty];
    li.appendChild(badge);
  }

  const icon = document.createElement('span');
  icon.className = 'icon';
  icon.textContent = result === 'correct' ? '✓' : '↷';
  li.appendChild(icon);
  return li;
}

export function renderResults(list, results) {
  const rows = results.map(resultRow);
  if (!rows.length) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No se jugó ninguna palabra.';
    rows.push(empty);
  }
  list.replaceChildren(...rows);
}
