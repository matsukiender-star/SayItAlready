/**
 * Confeti en canvas, sin dependencias.
 * confetti(canvas, { count }) lanza una ráfaga desde la parte superior.
 */
import { prefersReducedMotion } from '../utils/dom.js';

const COLORS = ['#ff3d7f', '#ff9a3d', '#ffd34d', '#1fe0a0', '#7cf3ff', '#7c5cff', '#ffffff'];

export function confetti(canvas, { count = 140, duration = 3800 } = {}) {
  if (!canvas?.getContext) return;
  if (prefersReducedMotion()) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  };
  resize();
  const W = () => canvas.width;
  const H = () => canvas.height;

  const pieces = Array.from({ length: count }, (_, i) => {
    const fromLeft = i % 2 === 0;
    return {
      x: fromLeft ? W() * 0.1 : W() * 0.9,
      y: H() * 0.35,
      vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 9) * dpr,
      vy: -(9 + Math.random() * 12) * dpr,
      w: (6 + Math.random() * 8) * dpr,
      h: (8 + Math.random() * 10) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
      tilt: Math.random() * Math.PI,
      color: COLORS[i % COLORS.length],
      shape: Math.random() < 0.3 ? 'circle' : 'rect',
    };
  });

  const gravity = 0.32 * dpr;
  const drag = 0.985;
  const start = performance.now();
  let raf;

  const frame = (now) => {
    const t = now - start;
    ctx.clearRect(0, 0, W(), H());
    const fade = t > duration - 800 ? Math.max(0, (duration - t) / 800) : 1;
    for (const p of pieces) {
      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.tilt += 0.08;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.tilt));
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    if (t < duration) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, W(), H());
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
