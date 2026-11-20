// Copia las fuentes de @fontsource a fonts/ (para que la app funcione sin internet).
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'fonts');
mkdirSync(out, { recursive: true });
const fonts = [
  ['fredoka', 'Fredoka', [600, 700]],
  ['inter', 'Inter', [400, 600, 800]],
];
let css = '/* Generado por scripts/copy-fonts.mjs — fuentes con licencia OFL */\n';
for (const [pkg, family, weights] of fonts) {
  for (const w of weights) {
    const file = `${pkg}-latin-${w}-normal.woff2`;
    copyFileSync(resolve(root, 'node_modules/@fontsource', pkg, 'files', file), resolve(out, file));
    css += `@font-face{font-family:'${family}';font-style:normal;font-weight:${w};font-display:swap;src:url('./${file}') format('woff2');}\n`;
  }
}
writeFileSync(resolve(out, 'fonts.css'), css);
console.log('Fuentes copiadas a fonts/');
