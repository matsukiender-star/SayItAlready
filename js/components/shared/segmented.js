/**
 * Control segmentado: un grupo de botones con data-<key>, uno seleccionado.
 * @param {HTMLElement} group
 * @param {string} key – nombre del data-atributo (p. ej. "diff" → data-diff)
 * @param {(value: string) => void} onChange
 * @returns {(value: string) => void} función para seleccionar un valor
 */
export function bindSegmented(group, key, onChange) {
  const select = (value) => {
    group.querySelectorAll('button').forEach((b) =>
      b.classList.toggle('selected', b.dataset[key] === value));
  };
  group.addEventListener('click', (e) => {
    const btn = e.target.closest(`button[data-${key}]`);
    if (!btn) return;
    select(btn.dataset[key]);
    onChange(btn.dataset[key]);
  });
  return select;
}
