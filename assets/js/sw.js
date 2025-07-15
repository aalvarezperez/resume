const VERSION = new Date().toISOString();
const CACHE_NAME = 'resume-cache-' + VERSION;
const OFFLINE_URL = '/404.html';

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/assets/css/resume.css',
  '/assets/js/update-notification.js',
  OFFLINE_URL
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache all precache URLs
      await cache.addAll(PRECACHE_URLS);
      // Skip waiting to allow immediate activation
      await self.skipWaiting();
    })()
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      // Take control of all pages immediately
      await clients.claim();
    })()
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    (async () => {
      try {
        // Try to get from network first
        const networkResponse = await fetch(event.request);

        // Cache successful GET requests
        if (event.request.method === 'GET') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        // If network fails, try cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If cache fails, return offline page for HTML requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match(OFFLINE_URL);
        }

        // Otherwise, propagate the error
        throw error;
      }
    })()
  );
});

// Message event
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
