const RESOURCES_CACHE_KEY = 'mpasierbski-assets-v1';
const CONTENT_CACHE_KEY = 'mpasierbski-content-v2';

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
async function handleFetch(event) {
  if (isContentRequest(event.request)) {
    return handleFetchContent(event);
  } else {
    return cacheFirst(event.request);
  }
}

function handleFetchContent(event) {
  const onlineFirst = fetchAndCache(event.request, CONTENT_CACHE_KEY);
  const cacheFirst = new Promise((resolve) => {
    setTimeout(() => resolve(caches.match(event.request)), 300);
  });

  return Promise.race([onlineFirst, cacheFirst]);
}

function fetchAndCache(request, cacheKey) {
  return fetch(request).then((response) => {
    caches.open(cacheKey).then((cache) => {
      cache.put(request, response.clone());
    });

    return response;
  });
}

function cacheFirst(request) {
  return caches.match(request).then(function(cachedResponse) {
    if (cachedResponse) {
      return cachedResponse;
    }

    return fetch(request);
  });
}

function isContentRequest(request) {
  for (let path of contentToPrefetch) {
    if (request.url.endsWith(path)) return true;
  }

  return false;
}