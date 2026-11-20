// Pruebas de la cola de palabras adaptativa: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WordQueue } from '../js/models/word-queue.js';

const w = (text, d) => ({ text, tags: [`difficulty:${d}`] });
const WORDS = [w('a0', 0), w('b1', 1), w('c2', 2), w('d0', 0), w('e1', 1), w('f2', 2), w('g0', 0)];

test('filtra por dificultad máxima', () => {
  const q = new WordQueue(WORDS, 0, { shuffle: false });
  const seen = [];
  while (!q.done) { seen.push(q.current); q.answer('correct'); }
  assert.deepEqual(seen.sort(), ['a0', 'd0', 'g0']);
});

test('tras pasar, la siguiente palabra es más fácil', () => {
  const q = new WordQueue(WORDS, 2, { shuffle: false });
  q.answer('correct'); // a0
  assert.equal(q.current, 'b1');
  q.answer('skipped'); // b1 → buscar dificultad 0
  assert.equal(q.current, 'd0');
});

test('tras dos aciertos seguidos, la siguiente es más difícil', () => {
  const q = new WordQueue(WORDS, 2, { shuffle: false });
  q.answer('correct'); // a0 (0)
  q.answer('correct'); // b1 (1) → buscar dificultad 2
  assert.equal(q.current, 'c2');
});

test('finish() cuenta la palabra en pantalla como pasada', () => {
  const q = new WordQueue(WORDS, 2, { shuffle: false });
  q.answer('correct');
  q.finish();
  assert.deepEqual(q.results.map((r) => r.result), ['correct', 'skipped']);
  assert.equal(q.correctCount, 1);
});

test('acepta palabras como texto plano', () => {
  const q = new WordQueue(['uno', 'dos'], 2, { shuffle: false });
  assert.equal(q.current, 'uno');
  q.answer('correct');
  q.answer('correct');
  assert.equal(q.done, true);
  assert.equal(q.current, null);
});
