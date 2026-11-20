// Service worker de la versión web (PWA). En la app de Android no se registra.
// La lista de archivos a guardar (precache.json) la genera scripts/build-web.mjs.
const CACHE_NAME = 'diloya-v2.0.0';
const FALLBACK_URLS = ['./', './index.html', './game.html'];

async function precacheList() {
  try {
    const res = await fetch('./precache.json', { cache: 'no-store' });
    return res.ok ? await res.json() : FALLBACK_URLS;
  } catch {
    return FALLBACK_URLS;
  }
}

/** Una respuesta redirigida no sirve para una navegación: se copia limpia. */
async function clean(res) {
  if (!res.redirected) return res;
  const body = await res.blob();
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

async function cacheFirst(event, request) {
  const cached = await caches.match(request);
  if (cached) return clean(cached);
  const res = await fetch(event.request);
  if (res.ok) {
    const copy = res.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }
  return res;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    precacheList().then((urls) => caches.open(CACHE_NAME).then((cache) => cache.addAll(urls)))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.searchParams.get('cache') === 'off') return; // comprobación de versión
  // Navegación: sin parámetros, para que game.html?deck=X use la copia en caché
  const request = event.request.mode === 'navigate'
    ? new Request(url.origin + url.pathname)
    : event.request;
  event.respondWith(cacheFirst(event, request));
});
