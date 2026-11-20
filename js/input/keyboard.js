/**
 * Teclado durante la partida:
 * Espacio / → / ↓ = acierto · Enter / ← / ↑ = pasar · Esc / P = pausa.
 * Devuelve una función para quitar el listener.
 */
const CORRECT_KEYS = new Set([' ', 'ArrowRight', 'ArrowDown']);
const SKIP_KEYS = new Set(['Enter', 'ArrowLeft', 'ArrowUp']);
const PAUSE_KEYS = new Set(['Escape', 'p', 'P']);

export function bindGameKeys({ onCorrect, onSkip, onPause }) {
  const handler = (e) => {
    if (e.repeat) return;
    const action = PAUSE_KEYS.has(e.key) ? onPause
      : CORRECT_KEYS.has(e.key) ? onCorrect
      : SKIP_KEYS.has(e.key) ? onSkip
      : null;
    if (!action) return;
    e.preventDefault();
    action();
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
