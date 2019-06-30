const RESOURCES_CACHE_KEY = 'mpasierbski-v5';
const CONTENT_CACHE_KEY = 'mpasierbski-content-v1';

const resourcesToPrefetch = [
  '/css/style.css',
  '/lib/font-awesome/css/font-awesome.min.css',
  '/js/main.js',
  '/images/me-logo.png',
  '/fonts/Ubuntu/Ubuntu-Regular.ttf'
];

const contentToPrefetch = ['/', '/index.html'];

self.addEventListener('install', function(event) {
  // prefetch resources
  event.waitUntil(
    Promise.all([
      caches.open(RESOURCES_CACHE_KEY).then(function(cache) {
        return cache.addAll(resourcesToPrefetch);
      }),
      caches.open(CONTENT_CACHE_KEY).then(function(cache) {
        return cache.addAll(contentToPrefetch);
      })
    ])
  );
});

self.addEventListener('activate', function(event) {
  const cacheWhitelist = [
    RESOURCES_CACHE_KEY,
    CONTENT_CACHE_KEY
  ];

  // Delete unused caches
  event.waitUntil(
    caches.keys().then(function(cachesKeys) {
      return Promise.all(cachesKeys.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(handleFetch(event));
});

/**
 * 
 * @param {Event} event 
 * @returns Promise
 */
function handleFetch(event) {
  isContentRequest(event.request);

  return caches.match(event.request).then(function(cachedResponse) {
    if (cachedResponse) {
      return cachedResponse;
    }

    return fetch(event.request);
  });
}

function isContentRequest(request) {
  console.log(request.url);
}