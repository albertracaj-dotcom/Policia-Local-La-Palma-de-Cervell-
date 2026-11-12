const CACHE = 'policia-vmp-vtc-v32';
const ASSETS = [
  './', './index.html', './manifest.json', './Interfície%20de%20la%20Policia%20Local%20de%20Cervelló.png?v=1', './policia-icon.svg', './escut-oficial.jpg',
  'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js'
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(ASSETS.map(asset => cache.add(asset)));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const requestUrl = new URL(event.request.url);
    const isAppShell = requestUrl.origin === self.location.origin && (requestUrl.pathname.endsWith('/index.html') || requestUrl.pathname.endsWith('/home-splash.svg') || requestUrl.pathname.endsWith('/Interfície de la Policia Local de Cervelló.png') || requestUrl.pathname.endsWith('/policia-icon.svg') || requestUrl.pathname.endsWith('/escut-oficial.jpg'));
    if (!isAppShell) {
      const cached = await caches.match(event.request);
      if (cached) return cached;
    }
    try {
      const response = await fetch(event.request);
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const cache = await caches.open(CACHE);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      if (event.request.mode === 'navigate') {
        const fallback = await caches.match('./index.html');
        if (fallback) return fallback;
      }
      throw error;
    }
  })());
});