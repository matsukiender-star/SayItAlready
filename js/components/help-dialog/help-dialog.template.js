import { html } from '../../utils/dom.js';
import { ICON_CLOSE } from '../shared/icons.js';

export const template = html(`
<link rel="stylesheet" href="./css/shared/reset.css">
<link rel="stylesheet" href="./css/shared/dialog.css">
<link rel="stylesheet" href="./css/shared/controls.css">
<link rel="stylesheet" href="./js/components/help-dialog/help-dialog.css">
<div class="backdrop">
  <div class="dialog" role="dialog" aria-modal="true" aria-label="Cómo jugar">
    <button class="dialog-close" aria-label="Cerrar">${ICON_CLOSE}</button>

    <section class="htp-page">
      <div class="htp-hero" aria-hidden="true"><span class="htp-phone">📱</span><span>🙂</span></div>
      <h2>Cómo jugar</h2>
      <p class="htp-intro">Un juego de adivinanzas para jugar en grupo.</p>
      <ol class="htp-steps">
        <li><b>Elige un mazo.</b> Películas, animales, mímica… ¡el que tu grupo domine!</li>
        <li><b>Ponte el teléfono en la frente</b> con la pantalla hacia tus amigos. Tú no puedes ver la palabra.</li>
        <li><b>Tus amigos te dan pistas</b> sin decir la palabra: pueden describir, actuar o hacer sonidos.</li>
        <li><b>Inclina hacia abajo</b> si adivinaste ✅ o <b>hacia arriba</b> para pasar ⏭️.</li>
        <li><b>¡Gánale al reloj!</b> Adivina todas las que puedas antes de que se acabe el tiempo.</li>
      </ol>
    </section>

    <section class="htp-page">
      <div class="htp-hero" aria-hidden="true"><span class="htp-tilt">↕️</span></div>
      <h2>Controles</h2>
      <p class="htp-intro">Cámbialos en ⚙️ Ajustes.</p>
      <ol class="htp-steps">
        <li><b>Giroscopio:</b> inclina el teléfono. Al terminar la cuenta 3-2-1 se calibra con tu postura.</li>
        <li><b>Deslizar:</b> desliza a la derecha para acierto y a la izquierda para pasar.</li>
        <li><b>Botones:</b> toca la mitad derecha (acierto) o izquierda (pasar).</li>
        <li><b>Teclado:</b> <kbd>Espacio</kbd> acierto, <kbd>Enter</kbd> pasar, <kbd>Esc</kbd> pausa.</li>
        <li><b>Sensibilidad:</b> si el giroscopio cuenta de más o de menos, ajústala en Ajustes.</li>
      </ol>
    </section>

    <section class="htp-page">
      <div class="htp-hero" aria-hidden="true"><span class="htp-tilt">🛠️</span></div>
      <h2>Crea tus mazos</h2>
      <p class="htp-intro">Haz mazos con chistes locales y compártelos.</p>
      <ol class="htp-steps">
        <li><b>Toca la tarjeta ＋ Crear mazo</b> al final de la lista.</li>
        <li><b>Ponle nombre, ícono y colores</b>, y agrega palabras de dificultad Fácil, Normal o Difícil.</li>
        <li><b>Comparte con QR</b> o copia el JSON para enviarlo por WhatsApp.</li>
        <li><b>Edita o borra</b> tus mazos con el botón ✏️ de su tarjeta.</li>
      </ol>
    </section>

    <div class="htp-nav">
      <button class="htp-nav-btn htp-prev">← Atrás</button>
      <div class="htp-dots"></div>
      <button class="htp-nav-btn htp-next">Siguiente →</button>
    </div>
    <button class="htp-got-it btn btn-primary">¡Entendido!</button>
  </div>
</div>
`);
