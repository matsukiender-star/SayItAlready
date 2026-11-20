/** Mazos incluidos con la app: packs/index.json + packs/<id>.json. */

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se encontró ${url}`);
  return res.json();
}

export async function loadBuiltInPacks() {
  const ids = await fetchJSON('./packs/index.json').catch(() => []);
  const packs = await Promise.all(
    ids.map((id) => fetchJSON(`./packs/${id}.json`).catch(() => null))
  );
  return packs.filter(Boolean);
}
