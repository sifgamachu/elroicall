// Only public app shell assets are cached. Auth, account data, signed media,
// API responses, and third-party requests never enter this cache.
const CACHE = 'elroi-app-shell-v2';
const SHELL = '/app/';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.add(SHELL)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('elroi-app-shell-') && key !== CACHE).map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.search || url.hash) return;
  if (event.request.mode === 'navigate' && url.pathname.startsWith('/app/')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(SHELL).then(response => response || Response.error())));
    return;
  }
  if (!/^\/(assets\/[^/]+\.(?:js|css)|images\/(?:readings\/)?[^/]+\.webp|icons\/elroi-\d+\.png)$/.test(url.pathname)) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && response.type === 'basic') { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
    return response;
  })));
});
