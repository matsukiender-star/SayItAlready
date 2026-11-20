/** Utilidades del DOM. */

/** Vuelve a disparar una animación CSS quitando y poniendo la clase. */
export function restartAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth; // fuerza reflow
  el.classList.add(className);
}

export function prefersReducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Crea el shadow root de un componente a partir de su plantilla.
 * importNode actualiza al instante los componentes hijos ya definidos.
 */
export function attachTemplate(host, template) {
  const root = host.attachShadow({ mode: 'open' });
  root.appendChild(document.importNode(template.content, true));
  return root;
}

/** Crea un <template> desde HTML. */
export function html(markup) {
  const template = document.createElement('template');
  template.innerHTML = markup;
  return template;
}

/** Dispara un evento que cruza el Shadow DOM. */
export function emit(el, name, detail) {
  el.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }));
}
