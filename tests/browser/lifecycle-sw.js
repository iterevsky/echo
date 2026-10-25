/* fixture: mirrors the production response-cache lifecycle (network-first
   with cache fallback, cacheable-response guard, waitUntil-tied writes) */
const CACHE_VERSION = 'echo-lifecycle-v1';

function isCacheable(res) {
    return !!res && res.ok && res.status !== 206 && res.type === 'basic';
}

function cachePut(event, req, res) {
    const copy = res.clone();
    const write = caches.open(CACHE_VERSION)
        .then((cache) => cache.put(req, copy))
        .catch(() => {});
    event.waitUntil(write);
}

function networkFirst(req, event) {
    return fetch(req).then((res) => {
        if (isCacheable(res)) {
            cachePut(event, req, res);
            return res;
        }
        return caches.match(req, { ignoreSearch: true }).then((hit) => {
            if (hit) return hit;
            return res;
        });
    }).catch(() => {
        return caches.match(req, { ignoreSearch: true }).then((hit) => {
            if (hit) return hit;
            return Response.error();
        });
    });
}

self.addEventListener('install', (e) => { e.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    e.respondWith(networkFirst(e.request, e));
});
