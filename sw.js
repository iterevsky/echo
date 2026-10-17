/* ============================================================
   SERVICE WORKER «ЭХО» — офлайн-кэш

   ПЕРЕД ЛЮБЫМ КОММИТОМ, который меняет хоть один файл сайта
   (включая chapters.js с новой главой), подними CACHE_VERSION
   ниже на +1. Не поднял — читатели не увидят изменений:
   браузер продолжит отдавать старый кэш, а новый sw.js,
   чьи байты не изменились, он не подхватит.
   Старые кэши удалятся сами при активации.
   ============================================================ */
const CACHE_VERSION = 'echo-v14';

/* app-shell: всё, что нужно для запуска книги без сети */
const PRECACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './chapters.js',
    './Zastavka.jpg',
    './icons/icon.svg',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/apple-touch-icon.png',
    './fonts/pt-serif-400-cyrillic.woff2',
    './fonts/pt-serif-400-latin.woff2',
    './fonts/pt-serif-700-cyrillic.woff2',
    './fonts/pt-serif-700-latin.woff2',
    './fonts/pt-serif-400-italic-cyrillic.woff2',
    './fonts/pt-serif-400-italic-latin.woff2',
    './fonts/golos-text-cyrillic.woff2',
    './fonts/golos-text-latin.woff2'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

/* cache-first с догрузкой: кадры плёнки, картинки и вся статика
   попадают в кэш при первом запросе и дальше идут из него */
self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    e.respondWith(
        caches.match(req, { ignoreSearch: true }).then((hit) => {
            if (hit) return hit;
            return fetch(req).then((res) => {
                if (res && res.ok) {
                    const copy = res.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
                }
                return res;
            });
        })
    );
});
