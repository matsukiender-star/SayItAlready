/** Utilidades de color. */

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return '#' + [channel(0), channel(8), channel(4)]
    .map((x) => Math.round(x * 255).toString(16).padStart(2, '0'))
    .join('');
}

/** Color vivo al azar en formato #rrggbb. */
export function randomVividColor() {
  const h = Math.floor(Math.random() * 360);
  const s = 60 + Math.floor(Math.random() * 25);
  const l = 42 + Math.floor(Math.random() * 14);
  return hslToHex(h, s, l);
}

export function gradient(c1, c2) {
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

/** Extrae los dos primeros colores #rrggbb de un degradado CSS. */
export function gradientColors(background) {
  const match = String(background ?? '').match(/#[0-9a-fA-F]{6}/g);
  return match && match.length >= 2 ? [match[0], match[1]] : null;
}
