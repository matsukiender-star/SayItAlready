// Pruebas del detector de inclinación: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = new EventTarget();
const { TiltDetector, landscapeTilt } = await import('../js/services/tilt-detector.js');

/** Crea un detector con reloj controlado. */
function setup(opts = {}) {
  const calls = [];
  let t = 0;
  const det = new TiltDetector({
    onCorrect: () => calls.push('correct'),
    onSkip: () => calls.push('skip'),
    now: () => t,
    ...opts,
  });
  const at = (n, ms = 50) => {
    t += ms;
    // Construye beta/gamma para que landscapeTilt devuelva n
    if (n <= 90) det.feed({ beta: 0, gamma: n });
    else det.feed({ beta: 180, gamma: 180 - n });
  };
  return { det, calls, at };
}

test('landscapeTilt desenvuelve gamma alrededor de ±90', () => {
  assert.equal(landscapeTilt(0, 80), 80);
  assert.equal(landscapeTilt(170, 80), 100);
  assert.equal(landscapeTilt(-170, -80), 100);
  assert.equal(landscapeTilt(0, -85), 85);
});

test('neutral → abajo cuenta acierto; neutral → arriba cuenta pasar', () => {
  const { det, calls, at } = setup();
  det.start();
  at(90); at(130);
  assert.deepEqual(calls, ['correct']);
  at(90, 700); at(50);
  assert.deepEqual(calls, ['correct', 'skip']);
});

test('no hay doble conteo sin volver al centro', () => {
  const { det, calls, at } = setup();
  det.start();
  at(90); at(130); at(140); at(125); at(135);
  assert.deepEqual(calls, ['correct']);
});

test('el tiempo muerto evita rebotes rápidos', () => {
  const { det, calls, at } = setup();
  det.start();
  at(90); at(130);
  at(90, 100); at(130, 100); // demasiado rápido
  assert.deepEqual(calls, ['correct']);
  at(90, 700); at(130);
  assert.deepEqual(calls, ['correct', 'correct']);
});

test('la posición inicial inclinada no dispara nada', () => {
  const { det, calls, at } = setup();
  det.start();
  at(135); at(140);
  assert.deepEqual(calls, []);
});

test('la calibración mueve el centro a la postura real', () => {
  const { det, calls, at } = setup();
  for (let i = 0; i < 10; i++) at(105); // usuario con la cabeza algo inclinada
  assert.equal(Math.round(det.calibrate()), 105);
  det.start();
  at(105); at(130); // con centro 90 esto sería acierto; con centro 105 no
  assert.deepEqual(calls, []);
  at(140);
  assert.deepEqual(calls, ['correct']);
});

test('la calibración se limita a un rango razonable', () => {
  const { det, at } = setup();
  for (let i = 0; i < 10; i++) at(10);
  assert.equal(det.calibrate(), 65);
});

test('la sensibilidad alta necesita menos inclinación', () => {
  const alta = setup({ sensitivity: 'alta' });
  const baja = setup({ sensitivity: 'baja' });
  for (const s of [alta, baja]) { s.det.start(); s.at(90); s.at(116); }
  assert.deepEqual(alta.calls, ['correct']);
  assert.deepEqual(baja.calls, []);
});
