/**
 * Cola de palabras de una ronda con dificultad adaptativa:
 *  - si se pasó la última palabra, la siguiente intenta ser más fácil;
 *  - si se acertaron las dos últimas, la siguiente intenta ser más difícil.
 */
import { shuffle, wordText, wordDifficulty, filterByDifficulty } from './deck.js';

export class WordQueue {
  #words;
  #index = 0;
  #maxDifficulty;
  #results = []; // { word, difficulty, result: 'correct' | 'skipped' }

  /**
   * @param {Array} words – palabras del mazo
   * @param {number} maxDifficulty – 0 fácil, 1 normal, 2 difícil
   * @param {object} [opts]
   * @param {boolean} [opts.shuffle=true]
   */
  constructor(words, maxDifficulty, { shuffle: doShuffle = true } = {}) {
    const pool = filterByDifficulty([...words], maxDifficulty);
    this.#words = doShuffle ? shuffle(pool) : pool;
    this.#maxDifficulty = maxDifficulty;
  }

  get done() { return this.#index >= this.#words.length; }
  get current() { return this.done ? null : wordText(this.#words[this.#index]); }
  get results() { return [...this.#results]; }
  get correctCount() { return this.#results.filter((r) => r.result === 'correct').length; }

  /** Registra el resultado de la palabra actual y avanza. */
  answer(result) {
    if (this.done) return;
    const w = this.#words[this.#index];
    this.#results.push({ word: wordText(w), difficulty: wordDifficulty(w), result });
    this.#advance();
  }

  /** Cierra la ronda: la palabra en pantalla cuenta como pasada. */
  finish() {
    if (!this.done) this.answer('skipped');
  }

  #preferredDirection() {
    const last = this.#results.at(-1);
    const prev = this.#results.at(-2);
    if (last?.result === 'skipped') return -1;
    if (last?.result === 'correct' && prev?.result === 'correct') return 1;
    return 0;
  }

  #advance() {
    const dir = this.#preferredDirection();
    const next = this.#index + 1;
    if (dir !== 0 && next < this.#words.length) {
      const cur = wordDifficulty(this.#words[this.#index]);
      const target = Math.max(0, Math.min(this.#maxDifficulty, cur + dir));
      const found = this.#words.findIndex((w, i) => i >= next && wordDifficulty(w) === target);
      if (found > next) {
        [this.#words[next], this.#words[found]] = [this.#words[found], this.#words[next]];
      }
    }
    this.#index = next;
  }
}
