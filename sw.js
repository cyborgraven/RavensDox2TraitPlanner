// Raven’s Dox2 Trait Planner — Service Worker
const CACHE_NAME = ‘trait-planner-v1’;

// Files to cache for offline use
const PRECACHE_URLS = [
‘./index.html’,
‘https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap’
];

// Install: cache app shell
self.addEventListener(‘install’, event => {
event.waitUntil(
caches.open(CACHE_NAME).then(cache => {
// Cache the main HTML - fonts may fail offline which is fine
return cache.add(’./index.html’).catch(() => {});
}).then(() => self.skipWaiting())
);
});

// Activate: clean up old caches
self.addEventListener(‘activate’, event => {
event.waitUntil(
caches.keys().then(keys =>
Promise.all(
keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
)
).then(() => self.clients.claim())
);
});

// Fetch: serve from cache, fall back to network
self.addEventListener(‘fetch’, event => {
// Only handle GET requests
if (event.request.method !== ‘GET’) return;

event.respondWith(
caches.match(event.request).then(cached => {
if (cached) return cached;

```
  return fetch(event.request).then(response => {
    // Cache successful same-origin responses
    if (response.ok && event.request.url.startsWith(self.location.origin)) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
    }
    return response;
  }).catch(() => {
    // If offline and not cached, return a simple offline message for navigation
    if (event.request.mode === 'navigate') {
      return caches.match('./index.html');
    }
  });
})
```

);
});