// Genera docs/wiki/Mazos.md con la lista de mazos incluidos.
// Uso: node scripts/wiki/build-decks-page.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CATEGORIES = [
  ['clasicos', '🧩 Clásicos'],
  ['entretenimiento', '🎬 Entretenimiento'],
  ['cultura-pop', '🔥 Cultura pop'],
  ['mimica', '🎭 Mímica'],
];
const EXAMPLES = 4;

const ids = JSON.parse(readFileSync(resolve(root, 'packs/index.json'), 'utf8'));
const decks = ids.map((id) => JSON.parse(readFileSync(resolve(root, `packs/${id}.json`), 'utf8')));
const level = (w) => Number(w.tags[0].split(':')[1]);
const count = (deck, l) => deck.words.filter((w) => level(w) === l).length;
const examples = (deck, l) => deck.words.filter((w) => level(w) === l).slice(0, EXAMPLES).map((w) => w.text).join(', ');
const total = decks.reduce((n, d) => n + d.words.length, 0);

let md = `# Mazos

¡Dilo Ya! incluye **${decks.length} mazos** con **${total.toLocaleString('es-MX')} palabras**. Cada palabra es fácil, normal o difícil; ver [Cómo jugar](Como-jugar#dificultad).

> Esta página se genera con \`node scripts/wiki/build-decks-page.mjs\` a partir de \`packs/\`. Para proponer palabras o un mazo nuevo, abre un [issue](https://github.com/matsukiender-star/SayItAlready/issues/new/choose) con la plantilla «Mazo nuevo o palabras».
`;

for (const [id, label] of CATEGORIES) {
  const inCat = decks.filter((d) => d.category === id);
  md += `\n## ${label}\n\n| Mazo | Palabras (F/N/D) | Ejemplos fáciles | Ejemplos difíciles |\n| --- | --- | --- | --- |\n`;
  for (const d of inCat) {
    md += `| ${d.icon} **${d.name}**<br>${d.description} | ${d.words.length} (${count(d, 0)}/${count(d, 1)}/${count(d, 2)}) | ${examples(d, 0)} | ${examples(d, 2)} |\n`;
  }
}

md += `\n## Mazos propios\n\nPuedes crear los tuyos desde la app. Ver [Crear y compartir mazos](Crear-y-compartir-mazos).\n`;
writeFileSync(resolve(root, 'docs/wiki/Mazos.md'), md);
console.log(`docs/wiki/Mazos.md: ${decks.length} mazos, ${total} palabras`);
