// Copia la app web a www/ (webDir de Capacitor y de GitHub Pages)
// y genera www/precache.json con todos los archivos para el service worker.
// Uso: node scripts/build-web.mjs
import { cpSync, rmSync, mkdirSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'www');

const ENTRIES = ['index.html', 'game.html', 'manifest.json', 'sw.js', 'favicon.ico',
  'css', 'js', 'packs', 'fonts', 'icons'];

// Fuentes de diseño que no hacen falta en la app
const EXCLUDED = ['og-image.svg', 'icon-maskable.svg'];
// Archivos copiados que no se guardan para uso sin conexión
const NOT_PRECACHED = ['./sw.js', './icons/og-image.png'];

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listFiles(join(dir, e.name)) : [join(dir, e.name)]);
}

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
    filter: (p) => !EXCLUDED.some((name) => p.endsWith(name)),
  });
}

const files = listFiles(out)
  .map((f) => `./${relative(out, f).split('\\').join('/')}`)
  .filter((f) => !NOT_PRECACHED.includes(f));
writeFileSync(resolve(out, 'precache.json'), JSON.stringify(['./', ...files], null, 2));
console.log(`Web copiada a ${out} (${files.length} archivos en precache.json)`);
