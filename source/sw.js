const CACHE_KEY = 'mpasierbski-v3';

const urlsToPrefetch = [
  '/css/style.css',
  '/lib/font-awesome/css/font-awesome.min.css',
  '/js/main.js',
  '/images/me-logo.png',
  '/fonts/Ubuntu/Ubuntu-Regular.ttf'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_KEY).then(function(cache) {
      return cache.addAll(urlsToPrefetch);
    }).catch(console.error)
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(CACHE_KEY).then(function(cache) {
      return cache.match(event.request);
    }).then(function(cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request);
    })
  );
});
