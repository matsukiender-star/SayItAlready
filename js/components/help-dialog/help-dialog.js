/**
 * <help-dialog>: «Cómo jugar», en páginas.
 * Al abrirse marca la ayuda como vista.
 * Eventos: help-seen · dialog-dismiss
 */
import { DialogElement } from '../shared/dialog-element.js';
import { template } from './help-dialog.template.js';
import { emit } from '../../utils/dom.js';
import { markHelpSeen } from '../../services/storage/help-seen.js';

export class HelpDialog extends DialogElement {
  #page = 0;

  constructor() {
    super(template);
  }

  get #pages() { return [...this.$$('.htp-page')]; }

  setup() {
    const dots = this.$('.htp-dots');
    this.#pages.forEach(() => dots.appendChild(Object.assign(document.createElement('div'), { className: 'htp-dot' })));
    this.$('.htp-prev').addEventListener('click', () => this.#show(this.#page - 1));
    this.$('.htp-next').addEventListener('click', () => this.#show(this.#page + 1));
    this.$('.htp-got-it').addEventListener('click', () => this.dismiss());
  }

  open() {
    this.#show(0);
    super.open();
    markHelpSeen();
    emit(this, 'help-seen');
  }

  #show(index) {
    const pages = this.#pages;
    const last = pages.length - 1;
    this.#page = Math.max(0, Math.min(last, index));
    pages.forEach((p, i) => p.classList.toggle('active', i === this.#page));
    this.$$('.htp-dot').forEach((d, i) => d.classList.toggle('active', i === this.#page));
    this.$('.htp-prev').classList.toggle('hidden', this.#page === 0);
    this.$('.htp-next').classList.toggle('hidden', this.#page === last);
    this.$('.htp-got-it').hidden = this.#page !== last;
    this.$('.dialog').scrollTop = 0;
  }
}

customElements.define('help-dialog', HelpDialog);
