import { html } from '../../utils/dom.js';
import { ICON_CLOSE } from '../shared/icons.js';

export const template = html(`
<link rel="stylesheet" href="./css/shared/reset.css">
<link rel="stylesheet" href="./css/shared/dialog.css">
<link rel="stylesheet" href="./css/shared/controls.css">
<link rel="stylesheet" href="./js/components/deck-sheet/deck-sheet.css">
<div class="backdrop">
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-name">
    <div class="modal-card">
      <button class="dialog-close" aria-label="Cerrar">${ICON_CLOSE}</button>
      <div class="modal-icon"></div>
      <div class="modal-name" id="sheet-name"></div>
      <div class="modal-desc"></div>
      <div class="modal-count"></div>
    </div>
    <div class="modal-body">
      <div class="section-label">Algunas palabras</div>
      <div class="modal-examples"></div>
      <div class="difficulty-wrap">
        <div class="section-label">Dificultad</div>
        <div class="difficulty-pills segmented">
          <button data-diff="0">Fácil</button>
          <button data-diff="1">Normal</button>
          <button data-diff="2">Difícil</button>
        </div>
      </div>
      <div class="modal-meta"></div>
      <button class="modal-start btn btn-primary btn-xl">¡Jugar!</button>
    </div>
  </div>
</div>
`);
