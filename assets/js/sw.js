// Initialize VERSION variable
let VERSION;

// Get version from registration
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SET_VERSION') {
        VERSION = event.data.version;
    }
});

const CACHE_NAME = 'resume-cache-v1';

// Get the base URL from the service worker's scope
const getBaseUrl = () => self.registration.scope;

// Add base URL to paths
const addBaseUrl = (url) => {
    const baseUrl = getBaseUrl();
    return new URL(url.startsWith('/') ? url.slice(1) : url, baseUrl).href;
};

const ASSETS_TO_CACHE = [
    '/resume/',
    '/resume/index.html',
    '/resume/assets/css/resume.css',
    '/resume/assets/js/update-notification.js'
];

// Install event
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing new version');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating new version');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// Message event for cache updates
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        console.log('[ServiceWorker] Skip waiting and activating new version');
        self.skipWaiting();
    }
});
