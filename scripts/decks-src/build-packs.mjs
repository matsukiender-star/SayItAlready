import fs from 'node:fs';
import path from 'node:path';
import a from './decks-a.mjs'; import b from './decks-b.mjs'; import c from './decks-c.mjs';
const out = process.argv[2] ?? new URL('../../packs', import.meta.url).pathname;
const decks = [...a, ...b, ...c];
const index = [];
for (const d of decks) {
  const seen = new Set(); const words = [];
  [[d.e,0],[d.n,1],[d.h,2]].forEach(([s,lvl]) => s.split('|').map(x=>x.trim()).filter(Boolean).forEach(t => {
    const k = t.toLocaleLowerCase('es');
    if (seen.has(k)) { console.warn(`dup in ${d.id}: ${t}`); return; }
    seen.add(k); words.push({ text: t, tags: [`difficulty:${lvl}`] });
  }));
  const pack = { id: d.id, name: d.name, description: d.description, icon: d.icon, category: d.category, background: d.background, words };
  fs.writeFileSync(path.join(out, `${d.id}.json`), JSON.stringify(pack, null, 2) + '\n');
  index.push(d.id);
  console.log(d.id.padEnd(18), words.length, [0,1,2].map(l=>words.filter(w=>w.tags[0].endsWith(l)).length).join('/'));
}
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log('total decks', decks.length);
