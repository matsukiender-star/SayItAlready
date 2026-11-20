import { html } from '../../utils/dom.js';
import { ICON_CLOSE } from '../shared/icons.js';

export const template = html(`
<link rel="stylesheet" href="./css/shared/reset.css">
<link rel="stylesheet" href="./css/shared/dialog.css">
<link rel="stylesheet" href="./css/shared/controls.css">
<link rel="stylesheet" href="./js/components/deck-editor/deck-editor.css">
<div class="backdrop">
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="edit-title">
    <button class="dialog-close" aria-label="Cerrar">${ICON_CLOSE}</button>
    <h2 class="edit-title" id="edit-title">Nuevo mazo</h2>

    <div class="edit-tabs segmented">
      <button data-tab="editor">Editor</button>
      <button data-tab="json">JSON</button>
      <button data-tab="qr">Código QR</button>
    </div>

    <div class="edit-pane" data-pane="editor">
      <div class="edit-field-row">
        <div class="edit-field edit-field-icon">
          <label for="f-icon">Ícono</label>
          <input id="f-icon" class="edit-icon" type="text" placeholder="🎲" maxlength="4">
        </div>
        <div class="edit-field" style="flex:3">
          <label for="f-name">Nombre</label>
          <input id="f-name" class="edit-name" type="text" placeholder="Mi mazo">
        </div>
      </div>
      <div class="edit-field">
        <label for="f-desc">Descripción</label>
        <input id="f-desc" class="edit-desc" type="text" placeholder="Un mazo divertido sobre…">
      </div>
      <div class="edit-field">
        <label>Colores</label>
        <div class="edit-color-row">
          <input class="edit-color1" type="color" aria-label="Color 1">
          <input class="edit-color2" type="color" aria-label="Color 2">
          <div class="edit-color-preview"></div>
        </div>
      </div>
      <div class="edit-field">
        <div class="edit-words-header">Palabras</div>
        <div class="edit-words-list"></div>
        <button class="add-word-btn">＋ Agregar palabra</button>
      </div>
    </div>

    <div class="json-pane" data-pane="json">
      <textarea class="json-textarea" spellcheck="false" aria-label="Mazo en JSON"
        placeholder='{"id":"mi-mazo","name":"Mi mazo","icon":"🎲","words":[{"text":"Ejemplo","tags":["difficulty:0"]}]}'></textarea>
    </div>

    <div class="qr-pane" data-pane="qr">
      <div class="qr-output"></div>
      <div class="qr-url-row">
        <input class="qr-url" type="text" readonly aria-label="Enlace para compartir">
        <button class="qr-copy" title="Copiar enlace">📋</button>
      </div>
      <div class="qr-error"></div>
    </div>

    <div class="import-error" role="alert"></div>
    <div class="import-actions">
      <button class="import-delete btn btn-danger" hidden>Eliminar</button>
      <button class="import-cancel btn btn-ghost">Cancelar</button>
      <button class="import-submit btn btn-primary">Guardar</button>
    </div>
  </div>
</div>
`);
