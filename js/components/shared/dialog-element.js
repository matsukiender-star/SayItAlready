/**
 * Base para los diálogos (<deck-sheet>, <settings-dialog>, …).
 *
 * La plantilla debe tener `.backdrop` y, opcionalmente, `.dialog-close`.
 *  - open() / close(): abren o cierran sin avisar (los usa el router).
 *  - dismiss(): cierre hecho por el usuario; emite `dialog-dismiss` para que
 *    el router retroceda en el historial.
 * Las subclases implementan setup() (se llama una vez al conectarse).
 */
import { attachTemplate, emit } from '../../utils/dom.js';

export class DialogElement extends HTMLElement {
  #ready = false;

  constructor(template) {
    super();
    this.root = attachTemplate(this, template);
  }

  connectedCallback() {
    if (this.#ready) return;
    this.#ready = true;
    const backdrop = this.$('.backdrop');
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) this.dismiss(); });
    this.root.querySelectorAll('.dialog-close').forEach((btn) =>
      btn.addEventListener('click', () => this.dismiss()));
    this.setup?.();
  }

  $(selector) { return this.root.querySelector(selector); }
  $$(selector) { return this.root.querySelectorAll(selector); }

  get isOpen() { return this.$('.backdrop').classList.contains('open'); }

  open() { this.$('.backdrop').classList.add('open'); }

  close() { this.$('.backdrop').classList.remove('open'); }

  dismiss() {
    if (!this.isOpen) return;
    this.close();
    emit(this, 'dialog-dismiss');
  }
}
