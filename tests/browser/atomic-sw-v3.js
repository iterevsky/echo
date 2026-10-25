/* fixture: mirrors the production install flow — atomic core, then best-effort extras */
const CACHE_VERSION = 'echo-atomic-v3';
const CORE_FILES = ['./atomic-host.html'];
const EXTRA_FILES = [];
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(CORE_FILES)
                .then(() => Promise.allSettled(EXTRA_FILES.map((f) => cache.add(f)))))
            .then(() => self.skipWaiting())
    );
});
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
