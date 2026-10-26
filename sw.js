/* ============================================================
   SERVICE WORKER «ЭХО» — офлайн-кэш, v18

   Принципы:
   1) Установка НЕ атомарная: каждый файл кэшируется отдельно
      (allSettled) — SW встаёт при любой сети, недостающее
      докэшируется при первых запросах.
   2) Код книги (HTML/JS/CSS) — network-first: свежая версия при
      живой сети, кэш — запасной вариант при обрыве. Любой сетевой
      запрос ограничен таймаутом: зависшее соединение не должно
      оставлять читателя на вечном «pending» и чёрном экране.
   3) Картинки и шрифты — cache-first: они не меняются.
   4) Навигация без сети и без кэша — встроенная заглушка
      с кнопкой «Повторить», а не мёртвый экран.

   ПЕРЕД ЛЮБЫМ КОММИТОМ, который меняет хоть один файл сайта,
   подними CACHE_VERSION на +1 — старые кэши удалятся при активации.
   ============================================================ */
const CACHE_VERSION = 'echo-v66';

/* все кэши «ЭХО» начинаются с этого префикса; чужие кэши не трогаем */
const CACHE_PREFIX = 'echo-';

/* NOTE: install is atomic for the core again (see below) — the
   allSettled-for-everything scheme described above was retired because
   it let an incomplete worker replace a working one. */
const CORE_FILES = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './chapters.js'
];

/* nonessential: cached best-effort, refilled on demand at runtime */
const EXTRA_FILES = [
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

const PRECACHE = CORE_FILES.concat(EXTRA_FILES);

/* файлы, которые всегда сначала спрашивают у сети */
const CODE_FILES = ['index.html', 'style.css', 'script.js', 'chapters.js'];

/* потолок ожидания сети — потом кэш или заглушка */
const NETWORK_TIMEOUT = 8000;

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(CORE_FILES)
                .then(() => Promise.allSettled(EXTRA_FILES.map((f) => cache.add(f)))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_VERSION)
                    .map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

function isCodeRequest(req, url) {
    if (req.mode === 'navigate') return true;
    return CODE_FILES.some((f) => url.pathname.endsWith('/' + f));
}

/* fetch с жёстким таймаутом: зависшее соединение обрывается,
   а не висит вечно */
function fetchWithTimeout(req, ms) {
    if (!self.AbortController) return fetch(req);
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), ms);
    return fetch(req, { signal: ctl.signal }).then((res) => {
        clearTimeout(timer);
        return res;
    }, (err) => {
        clearTimeout(timer);
        throw err;
    });
}

/* офлайн-заглушка: навигация без сети и без кэша — не чёрный экран,
   а экран с действием */
function offlinePage() {
    return new Response(
        '<!doctype html><html lang="ru"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>ЭХО — нет соединения</title>' +
        '<style>body{margin:0;background:#0c0c0c;color:#8a8a8a;font-family:Georgia,serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:18px;text-align:center;padding:24px;box-sizing:border-box}' +
        'h1{color:#e8e6e3;font-size:1.4rem;letter-spacing:0.3em;font-weight:400;margin:0}' +
        'button{background:none;border:1px solid #00A8E8;color:#00A8E8;font:inherit;font-size:0.95rem;padding:10px 28px;cursor:pointer}</style>' +
        '</head><body><h1>ЭХО</h1><p>Нет соединения, и сохранённой копии пока нет.<br>Подключитесь к сети и попробуйте снова.</p>' +
        '<button onclick="location.reload()">Повторить</button></body></html>',
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
}

/* only good, complete, same-origin responses are cached */
function isCacheable(res) {
    return !!res && res.ok && res.status !== 206 && res.type === 'basic';
}

/* cache write tied to the fetch event's lifetime */
function cachePut(event, req, res) {
    const copy = res.clone();
    const write = caches.open(CACHE_VERSION)
        .then((cache) => cache.put(req, copy))
        .catch(() => {});
    event.waitUntil(write);
}

/* сеть с таймаутом; успех — в кэш; таймаут/обрыв — кэш;
   кэша нет — заглушка (навигация) или Response.error() */
function networkFirst(req, event) {
    return fetchWithTimeout(req, NETWORK_TIMEOUT).then((res) => {
        if (isCacheable(res)) {
            cachePut(event, req, res);
            return res;
        }
        // HTTP/серверная ошибка: в кэш не пишем; отдаём кэш, если он есть
        return caches.match(req, { ignoreSearch: true }).then((hit) => {
            if (hit) return hit;
            if (req.mode === 'navigate') return offlinePage();
            return res;
        });
    }).catch(() => {
        return caches.match(req, { ignoreSearch: true }).then((hit) => {
            if (hit) return hit;
            if (req.mode === 'navigate') return offlinePage();
            return Response.error();
        });
    });
}

/* кэш с догрузкой: картинки, шрифты, кадры плёнки;
   сеть тоже под таймаутом — чтобы не виснуть на мёртвом соединении */
function cacheFirst(req, event) {
    return caches.match(req, { ignoreSearch: true }).then((hit) => {
        if (hit) return hit;
        return fetchWithTimeout(req, NETWORK_TIMEOUT).then((res) => {
            if (isCacheable(res)) cachePut(event, req, res);
            return res;
        }).catch(() => Response.error());
    });
}

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    e.respondWith(isCodeRequest(req, url) ? networkFirst(req, e) : cacheFirst(req, e));
});
