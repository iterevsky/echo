/* ============================================================
   GLYPH UTILS «ЭХО» — растеризация изображений в символы и
   статические поля-«шумы». Чистые данные и canvas-рендер,
   ничего не трогают в DOM сами по себе.

   Тяжёлые вызовы (rasterizeToGlyphs, makeStaticFrames) запускать
   ТОЛЬКО через echoWhenIdle — никогда на первом кадре загрузки.
   После инициализации переиспользуются без новых аллокаций
   на кадр (drawGlyphField пишет в переданный canvas).
   ============================================================ */

/* рампа яркости: от пробела (тёмное) к «@» (светлое) */
var ECHO_GLYPH_RAMP = ' .·:;+*#%@';

/* отношение ширины символа к его высоте в monospace —
   нужно, чтобы поле глифов не сплющивало пропорции картинки */
var ECHO_GLYPH_ASPECT = 0.55;

function echoWhenIdle(fn) {
    if (typeof requestIdleCallback === 'function') requestIdleCallback(fn);
    else setTimeout(fn, 1);
}

/* img → { cells, cols, rows, cellW, cellH }.
   cells — строка длиной cols*rows, cells[y*cols+x] — символ рампы.
   cellW/cellH — размер ячейки в пикселях ИСХОДНОГО изображения.
   Рендером не занимается: только сэмплирование. */
function rasterizeToGlyphs(img, cols) {
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    cols = Math.max(1, Math.floor(cols));
    var rows = Math.max(1, Math.round(cols * (ih / iw) * ECHO_GLYPH_ASPECT));

    var cv = document.createElement('canvas');
    cv.width = cols;
    cv.height = rows;
    var ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, cols, rows);
    var data = ctx.getImageData(0, 0, cols, rows).data;

    var last = ECHO_GLYPH_RAMP.length - 1;
    var cells = '';
    for (var i = 0; i < cols * rows; i++) {
        var p = i * 4;
        var lum = data[p] * 0.2126 + data[p + 1] * 0.7152 + data[p + 2] * 0.0722;
        cells += ECHO_GLYPH_RAMP.charAt(Math.round((lum / 255) * last));
    }
    return { cells: cells, cols: cols, rows: rows, cellW: iw / cols, cellH: ih / rows };
}

/* Рендерит поле глифов в canvas.
   opts: cols, rows, cellW, cellH (пиксели НАЗНАЧЕНИЯ),
         color, font, alpha, alphaJitter, jitter, rng.
   alphaJitter/jitter — случайный разброс прозрачности/позиции каждого
   глифа; rng — источник случайности (по умолчанию Math.random). */
function drawGlyphField(canvas, cells, opts) {
    var cols = opts.cols, rows = opts.rows;
    var cw = opts.cellW || 8, ch = opts.cellH || 14;
    var w = cols * cw, h = rows * ch;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.font = opts.font || ch + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = opts.color || '#ffffff';

    var baseAlpha = opts.alpha !== undefined ? opts.alpha : 1;
    var alphaJit = opts.alphaJitter || 0;
    var jit = opts.jitter || 0;
    var rng = opts.rng || Math.random;

    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            var g = cells[y * cols + x];
            if (g === ' ') continue;
            var a = baseAlpha + (rng() - 0.5) * alphaJit;
            ctx.globalAlpha = a < 0 ? 0 : a > 1 ? 1 : a;
            ctx.fillText(g,
                x * cw + cw / 2 + (rng() - 0.5) * jit,
                y * ch + ch / 2 + (rng() - 0.5) * jit);
        }
    }
    ctx.globalAlpha = 1;
    return canvas;
}

/* decodeText(el, { duration, order, onDone }): текст «собирается» из
   символов — незафиксированные позиции мерцают случайными глифами
   рампы, символы локуются в заданном порядке:
   'ltr' — слева направо; 'center' — от краёв к центру (центральный
   символ последним). Финальный DOM восстанавливается в точности:
   обёртки вроде .h-char сохраняются, их анимации продолжаются. */
function decodeText(el, opts) {
    opts = opts || {};
    var duration = opts.duration || 700;
    var order = opts.order || 'ltr';
    var rng = opts.rng || Math.random;
    var GLYPHS = ECHO_GLYPH_RAMP.slice(3); /* ':;+*#%@' — без пробела и точек */

    var originals = [];
    for (var i = 0; i < el.childNodes.length; i++) originals.push(el.childNodes[i]);

    /* слоты: каждая видимая буква — свой span; элементы-обёртки
       с одним символом (например .h-char) — слот сами по себе */
    var slots = [];
    el.textContent = '';
    originals.forEach(function (node) {
        if (node.nodeType === 3) {
            var text = node.textContent;
            for (var i = 0; i < text.length; i++) {
                var s = el.ownerDocument.createElement('span');
                s.textContent = text[i];
                el.appendChild(s);
                slots.push({ node: s, ch: text[i] });
            }
        } else if (node.nodeType === 1) {
            el.appendChild(node);
            if (node.textContent.length === 1) slots.push({ node: node, ch: node.textContent });
        }
    });

    var n = slots.length;
    if (!n) { if (opts.onDone) opts.onDone(); return; }

    var seq = [];
    for (var k = 0; k < n; k++) seq.push(k);
    if (order === 'center') {
        var mid = (n - 1) / 2;
        seq.sort(function (a, b) { return Math.abs(b - mid) - Math.abs(a - mid); });
    }
    var lockTime = [];
    seq.forEach(function (slotIdx, pos) { lockTime[slotIdx] = duration * (pos + 1) / n; });

    var finished = false;
    var finish = function () {
        if (finished) return;
        finished = true;
        clearInterval(timer);
        el.textContent = '';
        originals.forEach(function (node) { el.appendChild(node); });
        if (opts.onDone) opts.onDone();
    };

    var t0 = performance.now();
    var timer;
    var tick = function () {
        var t = performance.now() - t0;
        var allLocked = true;
        for (var i = 0; i < n; i++) {
            var s = slots[i];
            if (s.ch === ' ' || s.ch === ' ') continue;
            if (t >= lockTime[i]) {
                if (s.node.textContent !== s.ch) s.node.textContent = s.ch;
            } else {
                allLocked = false;
                s.node.textContent = GLYPHS.charAt(Math.floor(rng() * GLYPHS.length));
            }
        }
        if (allLocked || t > duration + 200) finish();
    };
    timer = setInterval(tick, 40);
    tick();  /* сразу заменяем текст на глифы — без кадра «чистого» текста */
    return finish;
}

/* scrambleStatic(el, rng): заменяет текст статичными глифами рампы
   (без анимации) и возвращает функцию восстановления исходного DOM.
   Для «ожидающих» элементов каскада: скрембл сразу, decode — позже. */
function scrambleStatic(el, rng) {
    rng = rng || Math.random;
    var GLYPHS = ECHO_GLYPH_RAMP.slice(3);
    var originals = [];
    for (var i = 0; i < el.childNodes.length; i++) originals.push(el.childNodes[i]);
    el.textContent = '';
    originals.forEach(function (node) {
        if (node.nodeType === 3) {
            var text = node.textContent;
            for (var k = 0; k < text.length; k++) {
                var s = el.ownerDocument.createElement('span');
                var ch = text[k];
                s.textContent = ch.trim() === '' ? ch : GLYPHS.charAt(Math.floor(rng() * GLYPHS.length));
                el.appendChild(s);
            }
        } else if (node.nodeType === 1) {
            el.appendChild(node);
        }
    });
    var done = false;
    return function restore() {
        if (done) return;
        done = true;
        el.textContent = '';
        originals.forEach(function (n) { el.appendChild(n); });
    };
}

/* Массив из frames канвасов w×h: разреженный пиксельный шум +
   ФИКСИРОВАННЫЙ набор разбросанных глифов (одинаковый во всех
   кадрах — мерцает только шум). Строится один раз, дальше кадры
   просто переключаются через drawImage. */
function makeStaticFrames(w, h, opts) {
    opts = opts || {};
    var frames = opts.frames !== undefined ? opts.frames : 2;
    var glyphs = opts.glyphs !== undefined ? opts.glyphs : 40;
    var gs = opts.glyphSize || [10, 16];
    var colors = opts.colors || ['rgba(255,255,255,0.07)'];
    var noiseDensity = opts.noise !== undefined ? opts.noise : 0.012;
    var rng = opts.rng || Math.random;
    /* band: [topFrac, bottomFrac] — вся графика только в этой
       горизонтальной полосе высоты кадра */
    var y0 = opts.band ? Math.floor(h * opts.band[0]) : 0;
    var bandH = (opts.band ? Math.floor(h * opts.band[1]) : h) - y0;

    /* фиксированная раскладка глифов — общая для всех кадров */
    var layout = [];
    for (var g = 0; g < glyphs; g++) {
        layout.push({
            ch: ECHO_GLYPH_RAMP.charAt(1 + Math.floor(rng() * (ECHO_GLYPH_RAMP.length - 1))),
            x: rng() * w,
            y: y0 + rng() * bandH,
            size: gs[0] + rng() * (gs[1] - gs[0]),
            color: colors[Math.floor(rng() * colors.length)]
        });
    }

    var out = [];
    var noiseCount = Math.floor(w * bandH * noiseDensity);
    for (var f = 0; f < frames; f++) {
        var c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        var ctx = c.getContext('2d');

        var imgData = ctx.createImageData(w, h);
        var d = imgData.data;
        for (var n = 0; n < noiseCount; n++) {
            var p = (Math.floor(y0 + rng() * bandH) * w + Math.floor(rng() * w)) * 4;
            var v = Math.floor(rng() * 256);
            d[p] = v;
            d[p + 1] = v;
            d[p + 2] = v;
            d[p + 3] = 8 + Math.floor(rng() * 36);
        }
        ctx.putImageData(imgData, 0, 0);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (var k = 0; k < layout.length; k++) {
            var g2 = layout[k];
            ctx.font = g2.size + 'px monospace';
            ctx.fillStyle = g2.color;
            ctx.fillText(g2.ch, g2.x, g2.y);
        }
        out.push(c);
    }
    return out;
}
