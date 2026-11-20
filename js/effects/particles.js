/** Ráfaga de partículas de celebración (solo transform/opacity). */
import { prefersReducedMotion } from '../utils/dom.js';

const COLORS = ['#1fe0a0', '#ffffff', '#ffd34d', '#7cf3ff', '#ff9a3d'];
const COUNT = 18;
const LIFETIME_MS = 800;

/** Crea partículas dentro de `container` (posicionado en el centro de la ráfaga). */
export function burst(container) {
  if (prefersReducedMotion()) return;
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('i');
    const angle = (Math.PI * 2 * i) / COUNT + Math.random() * 0.4;
    const dist = 120 + Math.random() * 160;
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    p.style.setProperty('--c', COLORS[i % COLORS.length]);
    p.style.setProperty('--s', (0.6 + Math.random() * 0.8).toFixed(2));
    container.appendChild(p);
    setTimeout(() => p.remove(), LIFETIME_MS);
  }
}
