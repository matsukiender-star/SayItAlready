// Service worker de la versión web (PWA). En la app de Android no se registra.
const CACHE_NAME = 'diloya-v2.0.0';

const PRECACHE_URLS = [
  './',
  './index.html',
  './game.html',
  './manifest.json',
  './css/styles.css',
  './css/home-screen.css',
  './css/game-screen.css',
  './css/round-summary.css',
  './fonts/fonts.css',
  './fonts/fredoka-latin-600-normal.woff2',
  './fonts/fredoka-latin-700-normal.woff2',
  './fonts/inter-latin-400-normal.woff2',
  './fonts/inter-latin-600-normal.woff2',
  './fonts/inter-latin-800-normal.woff2',
  './js/app.js',
  './js/game-app.js',
  './js/components/home-screen.js',
  './js/components/game-screen.js',
  './js/components/round-summary.js',
  './js/models/deck.js',
  './js/services/tilt-detector.js',
  './js/services/audio-manager.js',
  './js/services/timer.js',
  './js/services/deck-store.js',
  './js/services/settings.js',
  './js/services/install.js',
  './js/services/compress.js',
  './js/services/native.js',
  './js/services/confetti.js',
  './js/vendor/qrcode.js',
  './js/version.js',
  './packs/index.json',
  './icons/icon.svg',
  './icons/icon-nobg.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/icon-180.png',
  './favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
    // Los mazos se listan en packs/index.json
    try {
      const ids = await (await fetch('./packs/index.json')).json();
      await cache.addAll(ids.map((id) => `./packs/${id}.json`));
    } catch { /* se cachean al usarse */ }
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

/** Una respuesta redirigida no puede usarse para una navegación: se copia limpia. */
function clean(res) {
  if (!res || !res.redirected) return res;
  return res.blob().then((body) => new Response(body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  }));
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  // Sin caché para la comprobación de versión
  if (url.searchParams.get('cache') === 'off') return;
  // Navegación: quitar parámetros para que game.html?deck=X use la copia en caché
  const request = event.request.mode === 'navigate'
    ? new Request(url.origin + url.pathname)
    : event.request;
  event.respondWith(
    caches.match(request).then((cached) => (cached ? clean(cached) : fetch(event.request).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(request, copy));
      }
      return res;
    })))
  );
});
