// Regla del proyecto: ningún archivo de código propio pasa de 800 líneas.
// Uso: node scripts/check-file-size.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname, join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_LINES = 800;
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['js', 'css', 'scripts', 'tests', 'android/app/src/main/java', '.github/workflows'];
const EXTENSIONS = new Set(['.js', '.mjs', '.css', '.html', '.java', '.yml']);
const IGNORED = ['js/vendor/']; // código de terceros

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
}

const files = [
  ...DIRS.flatMap((d) => walk(resolve(root, d))),
  resolve(root, 'index.html'),
  resolve(root, 'game.html'),
  resolve(root, 'sw.js'),
].filter((f) => EXTENSIONS.has(extname(f)));

const tooLong = files
  .map((f) => ({ file: relative(root, f), lines: readFileSync(f, 'utf8').split('\n').length }))
  .filter(({ file, lines }) => lines > MAX_LINES && !IGNORED.some((p) => file.startsWith(p)));

if (tooLong.length) {
  console.error(`✖ Archivos con más de ${MAX_LINES} líneas:`);
  for (const { file, lines } of tooLong) console.error(`  ${file}: ${lines}`);
  process.exit(1);
}
console.log(`✔ ${files.length} archivos, ninguno pasa de ${MAX_LINES} líneas.`);
