---
layout: null
---
const VERSION = '{{ site.time | date: "%Y%m%d%H%M%S" }}';
const CACHE_NAME = `resume-cache-${VERSION}`;

const ASSETS_TO_CACHE = [
    '/resume/',
    '/resume/index.html',
    '/resume/assets/css/resume.css',
    '/resume/assets/js/update-notification.js'
];

// Install event — activate immediately, don't wait for old SW to release
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing version', VERSION);
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate event — take over all tabs and clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating version', VERSION);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event — network first, cache fallback
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

