const CACHE_NAME = 'wimhof-v4';
const ASSETS = [
  '/wim-hof-breathing/',
  '/wim-hof-breathing/index.html',
  '/wim-hof-breathing/manifest.json',
  '/wim-hof-breathing/icons/icon-192.png',
  '/wim-hof-breathing/icons/icon-512.png'
];

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first strategy — always try network, fall back to cache
  // This ensures updates are picked up immediately
  e.respondWith(
    fetch(e.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      return response;
    }).catch(() => caches.match(e.request))
  );
});
