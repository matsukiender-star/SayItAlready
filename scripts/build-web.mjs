// Copia los archivos de la app web a www/ (webDir de Capacitor).
// Uso: node scripts/build-web.mjs
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'www');

const ENTRIES = [
  'index.html',
  'game.html',
  'manifest.json',
  'sw.js',
  'favicon.ico',
  'css',
  'js',
  'packs',
  'fonts',
  'icons',
];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const entry of ENTRIES) {
  const src = resolve(root, entry);
  if (!existsSync(src)) {
    console.error(`Falta ${entry}`);
    process.exit(1);
  }
  cpSync(src, resolve(out, entry), {
    recursive: true,
    // Las fuentes SVG de los íconos y el og-image no hacen falta dentro del APK
    filter: (p) => !p.endsWith('og-image.svg') && !p.endsWith('icon-maskable.svg'),
  });
}
console.log(`Web copiada a ${out}`);
