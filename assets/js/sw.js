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

// Install event — activate immediately, bypass HTTP cache for precaching
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing version', VERSION);
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                ASSETS_TO_CACHE.map((url) =>
                    fetch(url, { cache: 'no-store' }).then((res) => cache.put(url, res))
                )
            );
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

// Fetch event — true network first (bypass HTTP cache), SW cache fallback
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const fetchOptions = event.request.mode === 'navigate'
        ? { cache: 'no-store' }
        : {};

    event.respondWith(
        fetch(event.request, fetchOptions)
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

