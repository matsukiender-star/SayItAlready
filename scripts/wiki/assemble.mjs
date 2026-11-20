// Arma la wiki en una carpeta: docs/wiki/ + documentos de la raíz del repo.
// Uso: node scripts/wiki/assemble.mjs <carpeta-destino>
import { cpSync, copyFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const out = resolve(process.argv[2] ?? 'wiki-out');

// Documentos del repo que también son páginas de la wiki
const ROOT_PAGES = {
  'ARCHITECTURE.md': 'Arquitectura.md',
  'CONTRIBUTING.md': 'Contribuir.md',
  'PRIVACY.md': 'Privacidad.md',
};

// La lista de mazos siempre se regenera desde packs/
execFileSync(process.execPath, [resolve(root, 'scripts/wiki/build-decks-page.mjs')], { stdio: 'inherit' });

mkdirSync(out, { recursive: true });
cpSync(resolve(root, 'docs/wiki'), out, { recursive: true });
for (const [source, page] of Object.entries(ROOT_PAGES)) {
  copyFileSync(resolve(root, source), resolve(out, page));
}
console.log(`Wiki armada en ${out}`);
