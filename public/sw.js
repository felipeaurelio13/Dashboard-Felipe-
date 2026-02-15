self.addEventListener('install', (event) => {
  event.waitUntil(caches.open('ritual-cache-v1').then((cache) => cache.addAll(['/today', '/week', '/month', '/logs', '/settings'])));
});
self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached)));
});
