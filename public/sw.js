const CACHE_NAME = 'offline-ai-shell-v2';
const APP_PREFIX = '/OFFLINE-AI/';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(APP_PREFIX + 'index.html');
      if (response.ok) {
        await cache.put(APP_PREFIX + 'index.html', response.clone());
        const html = await response.text();
        const assets = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css|woff2?|png|svg))[^"']*["']/g)]
          .map((match) => new URL(match[1], self.location.origin + APP_PREFIX).href)
          .filter((url) => new URL(url).origin === self.location.origin);
        await Promise.all(assets.map(async (url) => {
          try { const asset = await fetch(url); if (asset.ok) await cache.put(url, asset); } catch {}
        }));
      }
    } catch {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('offline-ai-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') return (await caches.match(APP_PREFIX + 'index.html')) || Response.error();
      return Response.error();
    }
  })());
});
