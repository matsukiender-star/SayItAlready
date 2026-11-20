/** Anima un número desde 0 hasta `target` con desaceleración. */
export function countUp(el, target, { onDone } = {}) {
  const duration = Math.min(400 + target * 60, 1400);
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased);
    if (t < 1) requestAnimationFrame(step);
    else onDone?.();
  };
  requestAnimationFrame(step);
}
