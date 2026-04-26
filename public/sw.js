// Service Worker for PWA offline support
const CACHE_NAME = 'snowman-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept non-GET requests (POST/PATCH/DELETE for mutations)
  if (request.method !== 'GET') {
    return;
  }

  // Never cache API calls or object storage files - always fetch fresh
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/objects/') ||
    url.pathname.startsWith('/public-objects/')
  ) {
    return;
  }

  // Never cache admin pages - always fetch fresh
  if (url.pathname.startsWith('/admin')) {
    return;
  }

  // Only cache same-origin GET requests for static assets
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          return response;
        });
      })
  );
});

// Listen for messages from the client to clear cache or skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => caches.delete(cacheName));
    });
  }
});
