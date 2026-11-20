// Valida los mazos de packs/: esquema, ids, duplicados, dificultades e índice.
// Uso: node scripts/validate-packs.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packsDir = resolve(root, 'packs');
const CATEGORIES = new Set(['clasicos', 'entretenimiento', 'cultura-pop', 'mimica']);
const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);

const files = readdirSync(packsDir).filter((f) => f.endsWith('.json') && f !== 'index.json');
let index = [];
try {
  index = JSON.parse(readFileSync(resolve(packsDir, 'index.json'), 'utf8'));
  if (!Array.isArray(index)) throw new Error('debe ser un arreglo');
} catch (e) {
  err('index.json', `inválido (${e.message})`);
}

const ids = files.map((f) => f.replace(/\.json$/, ''));
for (const id of index) if (!ids.includes(id)) err('index.json', `"${id}" no tiene archivo`);
for (const id of ids) if (!index.includes(id)) err('index.json', `falta "${id}"`);
if (new Set(index).size !== index.length) err('index.json', 'ids repetidos');

let totalWords = 0;
for (const file of files) {
  let deck;
  try {
    deck = JSON.parse(readFileSync(resolve(packsDir, file), 'utf8'));
  } catch (e) {
    err(file, `JSON inválido (${e.message})`);
    continue;
  }
  const id = file.replace(/\.json$/, '');
  if (deck.id !== id) err(file, `id "${deck.id}" no coincide con el archivo`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(deck.id ?? '')) err(file, 'id debe ser kebab-case');
  for (const key of ['name', 'description', 'icon', 'background']) {
    if (typeof deck[key] !== 'string' || !deck[key].trim()) err(file, `falta "${key}"`);
  }
  if (!CATEGORIES.has(deck.category)) err(file, `categoría desconocida "${deck.category}"`);
  if (!/gradient\(/.test(deck.background ?? '')) err(file, 'background debe ser un degradado CSS');
  if (!Array.isArray(deck.words) || deck.words.length < 20) {
    err(file, 'necesita al menos 20 palabras');
    continue;
  }
  const seen = new Set();
  const perLevel = [0, 0, 0];
  for (const w of deck.words) {
    if (typeof w?.text !== 'string' || !w.text.trim()) { err(file, 'palabra sin "text"'); continue; }
    if (w.text !== w.text.trim()) err(file, `espacios sobrantes en "${w.text}"`);
    if (/[�“”]/.test(w.text)) err(file, `caracteres extraños en "${w.text}"`);
    const key = w.text.toLocaleLowerCase('es');
    if (seen.has(key)) err(file, `palabra repetida "${w.text}"`);
    seen.add(key);
    const tags = (w.tags ?? []).filter((t) => t.startsWith('difficulty:'));
    if (tags.length !== 1 || !/^difficulty:[012]$/.test(tags[0])) {
      err(file, `"${w.text}" necesita un tag difficulty:0|1|2`);
    } else {
      perLevel[Number(tags[0].at(-1))]++;
    }
  }
  if (perLevel.some((n) => n < 8)) err(file, `pocas palabras por dificultad (${perLevel.join('/')})`);
  totalWords += deck.words.length;
}

if (errors.length) {
  console.error(`✖ ${errors.length} problema(s):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`✔ ${files.length} mazos válidos, ${totalWords} palabras.`);
