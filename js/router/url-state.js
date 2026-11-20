/**
 * Estado de la pantalla de inicio en la URL (?view=deck&deck=animales).
 * Así el botón «atrás» del teléfono cierra los diálogos.
 */

function buildQuery(params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) sp.set(k, v);
  }
  return `?${sp}`;
}

export function pushView(params) {
  history.pushState(params, '', buildQuery(params));
}

export function replaceView(params) {
  history.replaceState(params, '', buildQuery(params));
}

export function getViewParams() {
  return Object.fromEntries(new URLSearchParams(location.search));
}

/** true en la vista principal sin diálogos abiertos. */
export function isMainView() {
  const view = history.state?.view ?? getViewParams().view;
  return !view || view === 'main';
}
