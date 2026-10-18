/* ============================================================
   SERVICE WORKER «ЭХО» — офлайн-кэш, v17

   Два принципа:
   1) Установка НЕ атомарная: каждый файл кэшируется отдельно.
      Если сеть душится и часть файлов не скачалась — SW всё равно
      активируется, а недостающее докэшируется при первых запросах.
      Хуже «частично офлайн», чем «вообще не работает», не бывает.
   2) Код книги (HTML/JS/CSS) — network-first: свежая версия при
      любом живом соединении, кэш — запасной вариант при обрыве.
      Картинки и шрифты — cache-first: они не меняются.

   ПЕРЕД ЛЮБЫМ КОММИТОМ, который меняет хоть один файл сайта,
   подними CACHE_VERSION на +1 — старые кэши удалятся при активации.
   ============================================================ */
const CACHE_VERSION = 'echo-v17';

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

/* файлы, которые всегда сначала спрашивают у сети */
const CODE_FILES = ['index.html', 'style.css', 'script.js', 'chapters.js'];

/* ждём сеть не дольше 6 секунд — потом отдаём кэш */
const NETWORK_TIMEOUT = 6000;

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => Promise.allSettled(PRECACHE.map((f) => cache.add(f))))
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

function isCodeRequest(req, url) {
    if (req.mode === 'navigate') return true;
    return CODE_FILES.some((f) => url.pathname.endsWith('/' + f));
}

/* сеть с таймаутом; успех — в кэш; таймаут/обрыв — кэш */
function networkFirst(req) {
    const fetchAndCache = fetch(req).then((res) => {
        if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
    });
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('network-timeout')), NETWORK_TIMEOUT)
    );
    return Promise.race([fetchAndCache, timeout]).catch(() =>
        caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req))
    );
}

/* кэш с догрузкой: картинки, шрифты, кадры плёнки */
function cacheFirst(req) {
    return caches.match(req, { ignoreSearch: true }).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((res) => {
            if (res && res.ok) {
                const copy = res.clone();
                caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
            }
            return res;
        });
    });
}

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    e.respondWith(isCodeRequest(req, url) ? networkFirst(req) : cacheFirst(req));
});
