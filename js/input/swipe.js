/** Gesto de deslizar horizontal: derecha = acierto, izquierda = pasar. */

const MIN_DX = 60;          // recorrido horizontal mínimo (px)
const MAX_DY_RATIO = 0.7;   // máximo vertical/horizontal para contar como horizontal

/**
 * @param {HTMLElement} el
 * @param {{onRight: function, onLeft: function, enabled?: () => boolean}} handlers
 */
export function bindSwipe(el, { onRight, onLeft, enabled = () => true }) {
  let startX = 0;
  let startY = 0;
  el.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    startX = t.clientX;
    startY = t.clientY;
  }, { passive: true });
  el.addEventListener('touchend', (e) => {
    if (!enabled()) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = Math.abs(t.clientY - startY);
    if (Math.abs(dx) < MIN_DX || dy / Math.abs(dx) > MAX_DY_RATIO) return;
    if (dx > 0) onRight();
    else onLeft();
  }, { passive: true });
}
