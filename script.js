const coverScreen = document.getElementById('cover-screen');
const textScreen = document.getElementById('text-screen');
const glitchText = document.getElementById('glitch-text');
const finalScreen = document.getElementById('final-screen');
const titleScreen = document.getElementById('title-screen');
const contentsScreen = document.getElementById('contents-screen');
const chapterScreen = document.getElementById('chapter-screen');

/* === ПОДГОТОВКА СТРУКТУРЫ ГЛИТЧ-ТЕКСТА === */
(function initGlitchText() {
    if (!glitchText) return;
    const text = glitchText.textContent.trim();
    if (!text) return;

    glitchText.innerHTML = '';

    const base = document.createElement('span');
    base.className = 'glitch-base';
    base.textContent = text;

    const red = document.createElement('span');
    red.className = 'glitch-red';
    red.textContent = text;
    red.setAttribute('aria-hidden', 'true');

    const cyan = document.createElement('span');
    cyan.className = 'glitch-cyan';
    cyan.textContent = text;
    cyan.setAttribute('aria-hidden', 'true');

    glitchText.appendChild(base);
    glitchText.appendChild(red);
    glitchText.appendChild(cyan);
})();

let isStarted = false;

const menuTrigger = document.getElementById('menu-trigger');
const menuOverlay = document.getElementById('menu-overlay');
const menuClose = document.getElementById('menu-close');

let isMenuOpen = false;
const overlayOpenOrder = [];

function markOverlayOpen(overlay) {
    const existing = overlayOpenOrder.indexOf(overlay);
    if (existing !== -1) overlayOpenOrder.splice(existing, 1);
    overlayOpenOrder.push(overlay);
}

function markOverlayClosed(overlay) {
    const existing = overlayOpenOrder.indexOf(overlay);
    if (existing !== -1) overlayOpenOrder.splice(existing, 1);
}

function getTopmostOpenOverlay() {
    for (let i = overlayOpenOrder.length - 1; i >= 0; i--) {
        const overlay = overlayOpenOrder[i];
        if (overlay.classList.contains('open') || overlay.classList.contains('active') || overlay.classList.contains('visible')) {
            return overlay;
        }
    }
    return null;
}

let currentChapter = 0;

/* состояние читательской панели (setBarHidden может вызываться на этапе загрузки) */
let barHidden = false;
let barLastScroll = 0;
let readPosTimer = null;
let readerGeneration = 0;  // bumped on every chapter open/exit; stale writes check it
let justFinishedChapter = null;  // a genuine read just crossed the threshold
let revealTimers = [];     // declared up here: initProgress/openChapter run during initial eval

const STORAGE_KEY = 'echo_state';
const STORAGE_BACKUP_KEY = 'echo_state_backup';

/* --- ключи глав: «01» и 1 — одна глава; при конфликте форм берём большее --- */
function normalizeChapterMap(obj, clamp) {
    const out = {};
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return out;
    Object.keys(obj).forEach((k) => {
        if (!/^\d+$/.test(k)) return;
        const raw = obj[k];
        if (typeof raw !== 'number' && typeof raw !== 'string') return;
        if (typeof raw === 'string' && raw.trim() === '') return;
        const idx = parseInt(k, 10);
        const v = Number(raw);
        if (!isFinite(v)) return;
        const val = clamp ? Math.min(1, Math.max(0, v)) : v;
        if (out[idx] === undefined || val > out[idx]) out[idx] = val;
    });
    return out;
}

function sanitizeReaderSettings(rs) {
    if (!rs || typeof rs !== 'object' || Array.isArray(rs)) return undefined;
    const size = Number(rs.size);
    const dim = Number(rs.dim);
    return {
        size: isFinite(size) ? Math.min(3, Math.max(0, Math.round(size))) : 1,
        tone: (rs.tone === 'soft' || rs.tone === 'warm') ? rs.tone : 'standard',
        dim: isFinite(dim) ? Math.min(45, Math.max(0, dim)) : 0
    };
}

/* чистим известные поля, неизвестные поля и их порядок не трогаем */
function sanitizeState(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const s = Object.assign({}, parsed);
    if ('readPos' in s) s.readPos = normalizeChapterMap(s.readPos, true);
    if ('readerSettings' in s) {
        const rs = sanitizeReaderSettings(s.readerSettings);
        if (rs) s.readerSettings = rs; else delete s.readerSettings;
    }
    if ('lastChapter' in s) {
        const n = Number(s.lastChapter);
        if (!isFinite(n) || n < 0 || Math.floor(n) !== n) delete s.lastChapter;
        else s.lastChapter = n;
    }
    return s;
}

let stateChecked = false;
function loadState() {
    let raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { return {}; }
    if (!raw) return {};
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch (e) {
        /* битый JSON: резервная копия, чтобы запись поверх не стёрла данные молча */
        try { localStorage.setItem(STORAGE_BACKUP_KEY, raw); } catch (e2) {}
        return {};
    }
    const clean = sanitizeState(parsed);
    if (!('v' in clean)) clean.v = 1;
    if (!stateChecked) {
        stateChecked = true;
        if (JSON.stringify(clean) !== JSON.stringify(parsed)) {
            try {
                localStorage.setItem(STORAGE_BACKUP_KEY, raw);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
            } catch (e2) {}
        }
    }
    return clean;
}
function saveState(patch) {
    try {
        const s = loadState();
        Object.assign(s, patch);
        s.v = 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {}
}

/* === СВАЙП ВВЕРХ: ПЕРЕХОД К СЛЕДУЮЩЕЙ ГЛАВЕ === */
let swipeStartY = 0;
let swipeStartX = 0;
let swipeAnchorY = 0;
let swipeReachedBottom = false;
let swipeMaxPull = 0;
let swipeIsTracking = false;

const SWIPE_RESISTANCE = 0.25;   // тугость: палец 100px → контент 25px
const SWIPE_HINT_THRESHOLD = 10; // смещение контента, с которого видна подсказка во время тяги
const SWIPE_LONG_THRESHOLD = 26; // смещение контента для перехода (≈104px пальцем после упора)
const MAX_PULL_OFFSET = 40;

const swipeHintEl = document.getElementById('swipe-hint');

function isAtBottom() {
    if (!chapterScreen) return false;
    const remaining = chapterScreen.scrollHeight - chapterScreen.scrollTop - chapterScreen.clientHeight;
    return remaining <= 2;
}

function showSwipeHint() {
    if (!swipeHintEl || swipeHintEl.classList.contains('visible')) return;
    swipeHintEl.classList.add('visible');
}

function hideSwipeHint() {
    if (!swipeHintEl) return;
    swipeHintEl.classList.remove('visible');
}

function resetSwipePull() {
    if (chapterScreen) {
        chapterScreen.style.setProperty('--swipe-pull-offset', '0px');
        chapterScreen.classList.remove('swipe-pulling');
    }
}

function resetSwipeHint() {
    swipeIsTracking = false;
    swipeReachedBottom = false;
    swipeAnchorY = 0;
    swipeMaxPull = 0;
    hideSwipeHint();
    resetSwipePull();
}

function goNextChapter() {
    resetSwipeHint();
    const next = nextReadableIndex(currentChapter);
    if (next !== -1) {
        openChapter(next);
    }
}

function canSwipe() {
    if (!chapterScreen || !chapterScreen.classList.contains('visible')) return false;
    if (isMenuOpen) return false;
    if (photoOverlay && photoOverlay.classList.contains('active')) return false;
    if (nextReadableIndex(currentChapter) === -1) return false;
    return true;
}

function handleChapterTouchStart(e) {
    if (!canSwipe()) return;
    const t = e.touches[0];
    swipeStartY = t.clientY;
    swipeStartX = t.clientX;
    swipeAnchorY = 0;
    swipeReachedBottom = false;
    swipeMaxPull = 0;
    swipeIsTracking = true;
}

function handleChapterTouchMove(e) {
    if (!swipeIsTracking) return;

    const t = e.touches[0];

    // Проверка направления — только пока не достигли дна
    if (!swipeReachedBottom) {
        const rawDy = swipeStartY - t.clientY;
        const dx = t.clientX - swipeStartX;
        if (rawDy < 0 || Math.abs(rawDy) < Math.abs(dx) * 1.2) {
            swipeIsTracking = false;
            resetSwipePull();
            return;
        }
    }

    // Ещё не в конце — ничего не делаем, скролл нативный
    if (!isAtBottom()) {
        resetSwipePull();
        return;
    }

    // Только что достигли конца? Фиксируем точку отсчёта
    if (!swipeReachedBottom) {
        swipeReachedBottom = true;
        swipeAnchorY = t.clientY;
    }

    // Сколько пальцем «продавили» после упора
    const dy = swipeAnchorY - t.clientY;
    if (dy <= 0) {
        resetSwipePull();
        return;
    }

    e.preventDefault();

    // Сопротивление: контент двигается медленнее пальца
    const pullOffset = Math.min(dy * SWIPE_RESISTANCE, MAX_PULL_OFFSET);
    swipeMaxPull = Math.max(swipeMaxPull, pullOffset);

    // живая подсказка: видна, пока тянешь; гаснет при ослаблении/отпускании
    if (pullOffset >= SWIPE_HINT_THRESHOLD) showSwipeHint();
    else hideSwipeHint();

    chapterScreen.classList.add('swipe-pulling');
    chapterScreen.style.setProperty('--swipe-pull-offset', (-pullOffset) + 'px');
}

function handleChapterTouchEnd(e) {
    if (!swipeIsTracking) return;
    swipeIsTracking = false;

    // переход только если во время жеста упёрлись в низ и продавили порог
    const navigate = swipeReachedBottom && swipeMaxPull >= SWIPE_LONG_THRESHOLD;
    resetSwipeHint();
    if (navigate) goNextChapter();
}

function handleChapterTouchCancel(e) {
    swipeIsTracking = false;
    resetSwipePull();
}

function initSwipeHandlers() {
    if (!chapterScreen) return;
    chapterScreen.addEventListener('touchstart', handleChapterTouchStart, { passive: true });
    chapterScreen.addEventListener('touchmove', handleChapterTouchMove, { passive: false });
    chapterScreen.addEventListener('touchend', handleChapterTouchEnd, { passive: true });
    chapterScreen.addEventListener('touchcancel', handleChapterTouchCancel, { passive: true });
}

function cleanupSwipeHandlers() {
    resetSwipeHint();
}

// === ПОСТРОЕНИЕ МАССИВА ГЛАВ ИЗ HTML ===
const items = document.querySelectorAll('.contents-item');
const chapters = Array.from(items).map((item, index) => {
    const num = String(index + 1).padStart(2, '0');
    const raw = item.textContent.trim();
    const title = raw.replace(/^\d+\s*[•\s]*/, '').trim();
    return { number: num, title, text: '', empty: false };
});

let chaptersPromise = null;
function applyChapterTexts() {
    if (typeof chapterTexts === 'undefined' || !chapterTexts || typeof chapterTexts !== 'object' || Array.isArray(chapterTexts)) {
        throw new Error('chapterTexts unavailable after load');
    }
    chapters.forEach((chapter, index) => {
        const rawText = chapterTexts[index];
        chapter.empty = typeof rawText !== 'string' || !rawText.trim();
        chapter.text = chapter.empty ? `<p class="placeholder">Глава в процессе написания…</p>` : rawText;
    });
    updateContentsMemory();
}

function ensureChapters() {
    if (chaptersPromise) return chaptersPromise;
    if (typeof chapterTexts !== 'undefined') {
        chaptersPromise = Promise.resolve().then(applyChapterTexts);
        return chaptersPromise;
    }
    chaptersPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const fail = () => {
            script.onload = script.onerror = null;
            script.remove();
            chaptersPromise = null;
            reject(new Error('Unable to load chapters.js'));
        };
        script.src = 'chapters.js';
        script.async = true;
        script.onload = () => {
            try {
                applyChapterTexts();
                resolve();
            } catch (error) {
                fail();
            }
        };
        script.onerror = fail;
        document.head.appendChild(script);
    });
    return chaptersPromise;
}

function prefetchChapters() {
    ensureChapters().catch(() => {});
}

/* --- обход пустых глав: «в работе» пропускаются всеми переходами --- */
function nextReadableIndex(from) {
    for (let i = from + 1; i < chapters.length; i++) {
        if (!chapters[i].empty) return i;
    }
    return -1;
}

function prevReadableIndex(from) {
    for (let i = from - 1; i >= 0; i--) {
        if (!chapters[i].empty) return i;
    }
    return -1;
}

/* --- память прочитанного: прочитанные тускнеют, текущая — с линией, новые — с меткой --- */
function updateContentsMemory() {
    const s = loadState();
    const readPos = s.readPos || {};
    const last = (typeof s.lastChapter === 'number') ? s.lastChapter : -1;

    // общий прогресс книги — одна приглушённая строка под заголовком
    const totalPublished = chapters.filter((c) => !c.empty).length;
    const totalRead = chapters.filter((c, i) => !c.empty &&
        typeof readPos[i] === 'number' && readPos[i] >= 0.85).length;
    let prog = document.querySelector('.contents-progress');
    if (!prog) {
        prog = document.createElement('div');
        prog.className = 'contents-progress';
        const header = document.querySelector('.contents-header');
        if (header && header.parentNode) {
            header.parentNode.insertBefore(prog, header.nextSibling);
        }
    }
    prog.textContent = 'Прочитано ' + totalRead + ' из ' + totalPublished;

    /* one short afterglow when a chapter genuinely became read */
    if (justFinishedChapter !== null) {
        justFinishedChapter = null;
        prog.classList.remove('read-pulse');
        void prog.offsetWidth;
        prog.classList.add('read-pulse');
        setTimeout(() => prog.classList.remove('read-pulse'), 1700);
    }

    document.querySelectorAll('.contents-item').forEach((item) => {
        const i = parseInt(item.dataset.chapter, 10);
        if (isNaN(i)) return;

        const frac = readPos[i];
        const isEmpty = !!(chapters[i] && chapters[i].empty);
        const isRead = !isEmpty && (typeof frac === 'number') && frac >= 0.85;
        const isCurrent = (i === last) && !isRead && !isEmpty;

        item.classList.toggle('read', isRead);
        item.classList.toggle('current', isCurrent);
        item.classList.toggle('empty', isEmpty);

        if (isCurrent) item.setAttribute('aria-current', 'true');
        else item.removeAttribute('aria-current');
        if (isEmpty) item.setAttribute('aria-disabled', 'true');
        else item.removeAttribute('aria-disabled');

        if (isEmpty && !item.querySelector('.wip')) {
            const wip = document.createElement('span');
            wip.className = 'wip';
            wip.textContent = '· в работе';
            item.appendChild(wip);
        }

        let line = item.querySelector('.toc-line');
        if (isCurrent) {
            if (!line) {
                line = document.createElement('span');
                line.className = 'toc-line';
                line.innerHTML = '<i></i>';
                item.appendChild(line);
            }
            const f = (typeof frac === 'number') ? Math.max(0.04, frac) : 0.04;
            line.firstChild.style.width = (f * 100) + '%';
        } else if (line) {
            line.remove();
        }
    });
}
updateContentsMemory();

/* single initial-route decision: SW-reload flag first, then deep/hash links,
   then saved-progress overlay, else the cover. Nothing paints before this. */
async function applyInitialRoute() {
    let swRoute = null;
    try {
        const raw = sessionStorage.getItem('echo_sw_route');
        if (raw) {
            swRoute = JSON.parse(raw);
            sessionStorage.removeItem('echo_sw_route');   // one-shot, consumed now
        }
    } catch (e) {}

    // reveal the cover immediately; chapter text loading must not block it
    document.documentElement.classList.remove('routing-pending');

    if (swRoute && typeof swRoute.chapter === 'number' && chapters[swRoute.chapter]) {
        hideIntroScreens();
        await openChapter(swRoute.chapter, { restore: !!swRoute.restore });
        return;
    }
    if (await handleDeepLink()) return;
    if (await handleHashLink()) return;
    await initProgress();
}
/* символьный статик на разрыве глав: два кадра шума в полосе
   45–55% высоты экрана, отрисовываются заранее в простое.
   Объявление стоит ДО applyInitialRoute(): дип-линк ?ch=N зовёт
   openChapter на этапе первичного eval, до поздних let. */
let tearStaticFrames = null;
(function initTearStatic() {
    if (typeof makeStaticFrames !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    echoWhenIdle(() => {
        tearStaticFrames = makeStaticFrames(window.innerWidth, window.innerHeight, {
            frames: 2,
            glyphs: 40,
            band: [0.45, 0.55],
            colors: ['rgba(232,230,227,0.5)', 'rgba(0,168,232,0.4)']
        });
    });
})();

/* заголовки глав: сборка из символов на фоне расфокуса.
   finish() у decodeText хранится здесь, чтобы смена/выход главы
   мгновенно вернула чистый текст (элементы заголовков переиспользуются).
   Объявление ДО applyInitialRoute(): дип-линк зовёт openChapter на eval. */
let headingFinishers = [];
function cancelHeadingEffects() {
    headingFinishers.forEach((f) => f());
    headingFinishers = [];
    chapterScreen.classList.remove('heading-focus', 'heading-sharp');
}

applyInitialRoute();

// === ОБРАБОТЧИКИ НАВИГАЦИИ ВНУТРИ ГЛАВЫ ===
document.querySelector('.nav-prev').addEventListener('click', () => {
    const prev = prevReadableIndex(currentChapter);
    if (prev !== -1) openChapter(prev);
});
document.querySelector('.nav-next').addEventListener('click', () => {
    const next = nextReadableIndex(currentChapter);
    if (next !== -1) openChapter(next);
});
document.querySelector('.nav-contents').addEventListener('click', () => {
    exitChapterToContents();
});



// === ДЕЛЕГИРОВАНИЕ НА ОГЛАВЛЕНИЕ ===
contentsScreen.addEventListener('click', (e) => {
    const item = e.target.closest('.contents-item');
    if (!item) return;
    e.preventDefault();
    const idx = parseInt(item.dataset.chapter, 10);
    if (isNaN(idx)) return;
    if (chapters[idx] && chapters[idx].empty) return;
    openChapter(idx);
});

function closeProgress(restoreFocus = true) {
    const overlay = document.getElementById('progress-overlay');
    if (!overlay || !overlay.classList.contains('visible')) return;
    overlay.classList.remove('visible');
    overlay.inert = true;
    contentsScreen.classList.remove('progress-dimmed');
    contentsScreen.inert = false;
    markOverlayClosed(overlay);
    if (restoreFocus) {
        const item = contentsScreen.querySelector('.contents-item.current') || contentsScreen.querySelector('.contents-item');
        if (item) item.focus();
    }
}

// === КЛАВИАТУРА ===
/* image gestures: cancel dragstart and contextmenu on images and their
   dedicated containers only — not site-wide, not text selection */
document.addEventListener('dragstart', (e) => {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
});
document.addEventListener('contextmenu', (e) => {
    if (e.target && e.target.closest('img, .cover-stage, .film-gate, #photo-container')) {
        e.preventDefault();
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const overlay = getTopmostOpenOverlay();
        if (overlay) {
            e.preventDefault();
            if (overlay.id === 'progress-overlay') closeProgress();
            else if (overlay.id === 'install-overlay') closeInstall();
            else if (overlay.id === 'photo-overlay') closePhoto();
            else if (overlay.id === 'menu-overlay') closeMenu();
            else if (overlay.id === 'reader-sheet') toggleReaderSheet(false);
            return;
        }
    }

    if (!chapterScreen.classList.contains('visible')) return;

    // стрелки и выход из главы не работают, пока открыт хоть один оверлей
    const overlayOpen = isMenuOpen ||
        (photoOverlay && photoOverlay.classList.contains('active')) ||
        isReaderSheetOpen() ||
        (installOverlay && installOverlay.classList.contains('visible'));
    if (overlayOpen) return;

    if (e.key === 'ArrowLeft') {
        const prev = prevReadableIndex(currentChapter);
        if (prev !== -1) {
            e.preventDefault();
            openChapter(prev);
        }
    }
    if (e.key === 'ArrowRight') {
        const next = nextReadableIndex(currentChapter);
        if (next !== -1) {
            e.preventDefault();
            openChapter(next);
        }
    }
    if (e.key === 'Escape') {
        e.preventDefault();
        exitChapterToContents();
    }
});

// === ИНТРО: КАСАНИЕ / КЛИК ===

(function initMenuSwipeRecognizer() {
    let gesture = null;
    const cancel = () => { gesture = null; };
    const overlayActive = () => document.querySelector(
        '#photo-overlay.active, #reader-sheet.open, #install-overlay.visible, #progress-overlay.visible'
    );

    document.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1 || e.target.closest('.photo-link')) { cancel(); return; }
        const t = e.touches[0];
        gesture = { id: t.identifier, x: t.clientX, y: t.clientY, at: performance.now(), axis: null };
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!gesture) return;
        if (e.touches.length !== 1) { cancel(); return; }
        const t = e.touches[0];
        const dx = t.clientX - gesture.x;
        const dy = t.clientY - gesture.y;
        if (gesture.axis) return;
        if (Math.abs(dy) >= 10 && Math.abs(dy) > Math.abs(dx)) gesture.axis = 'vertical';
        else if (Math.abs(dx) >= 10 && Math.abs(dx) > Math.abs(dy) * 1.2) gesture.axis = 'horizontal';
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (!gesture) return;
        const start = gesture;
        gesture = null;
        const t = Array.from(e.changedTouches).find((point) => point.identifier === start.id);
        if (!t || start.axis !== 'horizontal') return;
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        if (performance.now() - start.at > 600 || Math.abs(dx) < 64 || Math.abs(dx) <= 1.5 * Math.abs(dy)) return;
        if (overlayActive()) return;
        const onMenuSurface = chapterScreen.classList.contains('visible') || contentsScreen.classList.contains('visible');
        if (!onMenuSurface) return;
        if (isMenuOpen && dx > 0) closeMenu();
        else if (!isMenuOpen && dx < 0) openMenu();
    }, { passive: true });

    /* no preventDefault: vertical scrolling and text selection keep ownership */
    document.addEventListener('touchcancel', cancel, { passive: true });
    window.addEventListener('blur', cancel);
})();



document.addEventListener('click', (e) => {
    if (isStarted) return;
    if (e.detail !== 0 && e.target.closest('#cover-screen')) return;
    startSequence();
});

// === ФУНКЦИИ ===

/* название собирается из символов: автор — слева направо (700 мс),
   ЭХО — к центру (900 мс, «Х» последней), после лока «Х» её свечение
   проявляется fade'ом. Только полное интро; при reduced-motion —
   мгновенный титул (разовый glow делает CSS). */
let titleDecodePlayed = false;
function playTitleDecode() {
    if (titleDecodePlayed) return;
    titleDecodePlayed = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const authorEl = titleScreen.querySelector('.author');
    const titleEl = titleScreen.querySelector('.book-title');
    if (!authorEl || !titleEl || typeof decodeText !== 'function') return;
    titleScreen.classList.add('decoding');
    decodeText(authorEl, { duration: 700, order: 'ltr' });
    setTimeout(() => {
        decodeText(titleEl, {
            duration: 900,
            order: 'center',
            onDone: () => titleScreen.classList.remove('decoding')
        });
    }, 250);
}

function startSequence() {
    if (isStarted) return;
    isStarted = true;
    prefetchChapters();
    startFilmPreload();

    // 1. Убираем картинку
    coverScreen.classList.add('hide-up');
    coverScreen.dispatchEvent(new CustomEvent('echo:entry-start'));

    // 2. Показываем текст
    setTimeout(() => {
        textScreen.classList.add('visible');
        glitchText.classList.add('visible');

        // 3. Мигание
        setTimeout(() => {
            glitchText.classList.add('blinking');

            setTimeout(() => {
                glitchText.classList.remove('blinking');

                // 4. Глитч с затуханием в тьму — 3.8 секунды
                glitchText.classList.add('glitching');

                // Затухаем text-screen параллельно с глитчем
                setTimeout(() => {
                    textScreen.style.opacity = '0';
                }, 3000);

                // После окончания глитча — чёрный экран
                setTimeout(() => {
                    textScreen.classList.remove('visible');
                    textScreen.style.opacity = '';

                    // Показываем финальный чёрный экран
                    finalScreen.classList.add('visible');
                    finalScreen.classList.add('final-flash');
                    setTimeout(() => finalScreen.classList.remove('final-flash'), 150);

                    // 5. Через 1.5 секунды — плёнка или название
                    setTimeout(() => {
                        // Затухаем чёрный экран
                        finalScreen.classList.remove('visible');

                        // Эпизод проекторной плёнки (только если все кадры загрузились)
                        if (filmReady) {
                            runFilmSequence();
                            return;
                        }

                        // Показываем название
                        titleScreen.classList.add('visible');
                        playTitleDecode();

                        // Ждём клик для перехода к оглавлению
                        titleScreen.addEventListener('click', showContents, { once: true });

                    }, 1500);

                }, 3800); // глитч длится 3.8 секунды

            }, 1800); // мигание

        }, 400); // пауза перед миганием

    }, 700); // задержка после свайпа
}

function showContents() {
    updateContentsMemory();
    titleScreen.classList.remove('film-enter');
    titleScreen.classList.remove('decoding');  /* клик в середине decode — melt не блокируем */
    // Буквы растают
    titleScreen.classList.add('melting');

    setTimeout(() => {
        titleScreen.classList.remove('visible');
        titleScreen.classList.remove('melting');

        // Показываем оглавление
        setTimeout(() => {
            contentsScreen.classList.add('visible');
            contentsScreen.inert = false;
            if (menuTrigger) menuTrigger.classList.add('visible');
            scrollContentsToCurrent();
            revealContentsItems();
        }, 300);

    }, 1200);
}

/* signal-acquisition boot: only the first full contents entry, started when
   fonts are actually ready; the real labels are never touched — the glyphs
   are a separate transient layer */
function bootContentsOnce() {
    const s = loadState();
    if (s.seenContentsBoot) return;
    saveState({ seenContentsBoot: true });
    const start = () => {
        if (!contentsScreen.classList.contains('visible')) return;
        document.querySelectorAll('.contents-item').forEach((item, i) => {
            item.style.setProperty('--boot-delay', (200 + i * 80) + 'ms');
        });
        contentsScreen.classList.add('signal-boot');
        setTimeout(() => contentsScreen.classList.remove('signal-boot'), 7500);
    };
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(start);
    } else {
        start();
    }
}

function cleanupChapterTear() {
    const tearOverlay = document.getElementById('tear-overlay');
    if (!tearOverlay) return;
    chapterScreen.classList.remove('tear-flash');
    tearOverlay.style.display = 'none';
    tearOverlay.querySelectorAll('*').forEach(el => el.style.animation = '');
}

function showChapterPending(index) {
    const chapter = chapters[index];
    if (!chapter) { openContentsFresh(); return; }
    hideIntroScreens();
    contentsScreen.classList.remove('visible');
    contentsScreen.inert = true;
    clearRevealTimers();
    if (menuTrigger) menuTrigger.classList.remove('visible');
    chapterScreen.querySelector('.chapter-number').textContent = 'Глава ' + chapter.number;
    chapterScreen.querySelector('.chapter-title').textContent = chapter.title;
    const textEl = chapterScreen.querySelector('.chapter-text');
    textEl.innerHTML = '<p class="placeholder" role="status" style="margin:2em 0">Загрузка главы…</p>';
    chapterScreen.classList.add('visible');
    chapterScreen.inert = false;
    chapterScreen.scrollTop = 0;
    const pending = textEl.firstElementChild;
    if (pending.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        pending.animate([{ opacity: 0.3 }, { opacity: 0.85 }], {
            duration: 650, direction: 'alternate', iterations: Infinity
        });
    }
}

function showChapterLoadError(index, retry) {
    showChapterPending(index);
    const textEl = chapterScreen.querySelector('.chapter-text');
    textEl.innerHTML = '<p class="placeholder" role="alert">Не удалось загрузить главу. Проверьте соединение.</p>';
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Повторить';
    button.style.cssText = 'display:block;margin:1em 0;padding:10px 24px;background:none;border:1px solid #00A8E8;color:#00A8E8;font:inherit;cursor:pointer';
    button.addEventListener('click', retry);
    textEl.appendChild(button);
    button.focus();
}

async function openChapter(index, opts = {}) {
    if (!chapters[index]) { openContentsFresh(); return false; }
    const generation = ++readerGeneration;
    const wasChapterVisible = chapterScreen.classList.contains('visible');
    clearTimeout(readPosTimer);
    readPosTimer = null;
    showChapterPending(index);
    try {
        await ensureChapters();
    } catch (error) {
        if (generation === readerGeneration) {
            showChapterLoadError(index, () => openChapter(index, opts));
        }
        return null;
    }
    if (generation !== readerGeneration) return null;
    if (chapters[index].empty) {
        chapterScreen.classList.remove('visible');
        chapterScreen.inert = true;
        openContentsFresh();
        return false;
    }
    const tearOverlay = document.getElementById('tear-overlay');
    const chScreen = document.getElementById('chapter-screen');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (tearOverlay && chScreen && !reducedMotion) {
        tearOverlay.style.display = 'block';
        tearOverlay.querySelector('.tear-top').style.animation = 'tear-top-shift 0.12s steps(1) forwards';
        tearOverlay.querySelector('.tear-bottom').style.animation = 'tear-bottom-shift 0.12s steps(1) forwards';
        tearOverlay.querySelector('.tear-line').style.animation = 'tear-line-fly 0.1s linear forwards';
        chScreen.classList.add('tear-flash');

        /* статик-вспышка: +40 мс от начала разрыва, 110 мс, один swap кадров */
        const tearStatic = tearOverlay.querySelector('#tear-static');
        if (tearStatic && tearStaticFrames) {
            const stx = tearStatic.getContext('2d');
            setTimeout(() => {
                stx.drawImage(tearStaticFrames[0], 0, 0);
                tearStatic.style.opacity = '0.45';
                setTimeout(() => stx.drawImage(tearStaticFrames[1], 0, 0), 55);
            }, 40);
        }

        setTimeout(() => {
            if (generation !== readerGeneration) return;
            cleanupChapterTear();
        }, 150);
    }

    resetSwipeHint();
    setBarHidden(false);

    // ушли «вперёд» из открытой главы — она считается прочитанной
    if (wasChapterVisible && index > currentChapter) {
        const sFwd = loadState();
        const posFwd = sFwd.readPos || {};
        if ((posFwd[currentChapter] || 0) < 0.85) {
            posFwd[currentChapter] = 1;
            saveState({ readPos: posFwd });
        }
    }

    // точка «назад» системной кнопки Android (в ответ на popstate не пушим);
    // в адресе всегда ссылка на открытую главу — можно скопировать вручную
    if (!opts.fromPop) {
        try { history.pushState({ echoChapter: index }, '', '#ch-' + chapters[index].number); } catch (e) {}
    }

    currentChapter = index;
    const chapter = chapters[index];

    const numberEl = chapterScreen.querySelector('.chapter-number');
    const titleEl = chapterScreen.querySelector('.chapter-title');
    const textEl = chapterScreen.querySelector('.chapter-text');
    const prevBtn = chapterScreen.querySelector('.nav-prev');
    const nextBtn = chapterScreen.querySelector('.nav-next');

    numberEl.textContent = 'Глава ' + chapter.number;
    titleEl.textContent = chapter.title;

    /* заголовки: сборка из символов на фоне расфокуса (фича 9+19).
       reduced-motion — сразу чистый текст; смена/выход из главы
       возвращает финальный текст через cancelHeadingEffects() */
    cancelHeadingEffects();
    if (!reducedMotion && typeof decodeText === 'function') {
        const gen = readerGeneration;
        chapterScreen.classList.add('heading-focus');
        void chapterScreen.offsetWidth;  /* reflow: переход blur→0 должен стартовать */
        chapterScreen.classList.add('heading-sharp');
        setTimeout(() => {
            if (gen !== readerGeneration) return;
            headingFinishers.push(decodeText(numberEl, { duration: 450, order: 'ltr' }));
        }, 300);
        setTimeout(() => {
            if (gen !== readerGeneration) return;
            headingFinishers.push(decodeText(titleEl, { duration: 650, order: 'center' }));
        }, 450);
        setTimeout(() => {
            if (gen !== readerGeneration) return;
            chapterScreen.classList.remove('heading-focus', 'heading-sharp');
        }, 1250);
    }
        // Парсим {{PHOTO:слово:файл}} и {{VOICE}}
    let processedText = chapter.text
      .replace(
        /\{\{PHOTO:([^:]+):([^}]+)\}\}/g,
        '<span class="photo-link" data-photo="$2" role="button" tabindex="0">$1</span>'
      )
      .replace(
        /{{VOICE(?::(\w+))?}}(.*?){{\/VOICE}}/g,
        (match, mode, text) => {
          const voiceMode = mode || 'standard';
          return `<span class="voice-glitch" data-voice-mode="${voiceMode}">${text}</span>`;
        }
      );

    cleanupVoiceObserver();
    textEl.innerHTML = processedText;
    appendChapterEnd(textEl, index);

   saveState({ lastChapter: index, chapterTitle: chapter.title });


    prevBtn.classList.toggle('inactive', prevReadableIndex(index) === -1);
    nextBtn.classList.toggle('inactive', nextReadableIndex(index) === -1);

    contentsScreen.classList.remove('visible');
    contentsScreen.inert = true;
    clearRevealTimers();   // contents hidden — pending reveals are obsolete
    if (menuTrigger) menuTrigger.classList.remove('visible');


    setTimeout(() => {
        if (generation !== readerGeneration) return;
        chapterScreen.classList.add('visible');
        chapterScreen.inert = false;
        chapterScreen.scrollTop = 0;
        if (opts.restore) {
            const restorePos = () => {
                if (generation !== readerGeneration) return;
                const s = loadState();
                const frac = s.readPos && s.readPos[index];
                if (frac) {
                    const total = chapterScreen.scrollHeight - chapterScreen.clientHeight;
                    chapterScreen.scrollTop = frac * total;
                }
            };
            if (document.fonts && document.fonts.ready) {
                // позиция — после загрузки шрифтов, иначе метрики пересчитаются
                document.fonts.ready.then(() => {
                    if (generation !== readerGeneration) return;
                    requestAnimationFrame(() => {
                        if (generation !== readerGeneration) return;
                        requestAnimationFrame(restorePos);
                    });
                });
            } else {
                setTimeout(restorePos, 300);
            }
        }
        initVoiceObserver();
        requestReaderWakeLock();
    }, 300);
    setTimeout(() => {
        if (generation !== readerGeneration) return;
        updateChapterProgress();
    }, 350);
}

/* === ФОТО: ОВЕРЛЕЙ === */

const photoOverlay = document.getElementById('photo-overlay');
const photoBackdrop = document.getElementById('photo-backdrop');
const photoImage = document.getElementById('photo-image');
const photoClose = document.getElementById('photo-close');

let photoTouchStartY = 0;
let photoTouchStartX = 0;
let photoTouchMoved = false;
let photoTouchTimer = null;
let photoTrigger = null;   // the photo-link that opened the overlay (focus restore)

function openPhoto(src) {
  photoImage.src = 'images/' + src;
  photoImage.alt = photoTrigger && photoTrigger.textContent.trim() ? photoTrigger.textContent.trim() : 'Фотография из главы';
  photoOverlay.classList.add('active');
  photoOverlay.inert = false;
  document.body.style.overflow = 'hidden';
  markOverlayOpen(photoOverlay);
  if (photoClose) photoClose.focus();
}

function closePhoto() {
  photoOverlay.classList.remove('active');
  photoOverlay.inert = true;
  document.body.style.overflow = '';
  photoImage.src = '';
  photoImage.alt = '';
  markOverlayClosed(photoOverlay);
  if (photoTrigger && document.contains(photoTrigger)) {
      photoTrigger.focus();
      photoTrigger = null;
  }
}

if (photoBackdrop) photoBackdrop.addEventListener('click', closePhoto);
if (photoClose) photoClose.addEventListener('click', closePhoto);

if (photoOverlay) {
  photoOverlay.addEventListener('touchstart', function(e) {
    photoTouchStartY = e.touches[0].clientY;
    photoTouchStartX = e.touches[0].clientX;
    photoTouchMoved = false;
  }, { passive: true });

  photoOverlay.addEventListener('touchmove', function(e) {
    const dy = e.touches[0].clientY - photoTouchStartY;
    const dx = e.touches[0].clientX - photoTouchStartX;
    if (Math.abs(dy) > 10 || Math.abs(dx) > 10) {
      photoTouchMoved = true;
    }
  }, { passive: true });

  photoOverlay.addEventListener('touchend', function(e) {
    if (!photoTouchMoved) return;
    const dy = e.changedTouches[0].clientY - photoTouchStartY;
    if (dy > 50) {
      closePhoto();
    }
  }, { passive: true });
}

/* === ЭЛЕКТРИЧЕСКИЙ ДРЕБЕЗГ В ОГЛАВЛЕНИИ === */
(function() {
    const GROUP_SIZE = 15;          // Каждые 15 глав = одна группа
    const INTERVAL_MS = 15000;      // Раз в 15 секунд
    const GLITCH_DURATION = 1200;   // Длительность дребезга одной главы
    const GLITCH_VARIANTS = ['shear', 'chroma-walk', 'drop-frame'];
    const variantHistory = new WeakMap();
    let variantSeed = 0x4543484f;

    function pickGlitchVariant(item) {
        variantSeed = (1664525 * variantSeed + 1013904223) >>> 0;
        let index = variantSeed % GLITCH_VARIANTS.length;
        if (index === variantHistory.get(item)) index = (index + 1) % GLITCH_VARIANTS.length;
        variantHistory.set(item, index);
        return GLITCH_VARIANTS[index];
    }

    const contentsScreen = document.getElementById('contents-screen');
    if (!contentsScreen) return;

    function triggerGlitch() {
        // Работает только когда оглавление открыто
        if (!contentsScreen.classList.contains('visible')) return;

        const items = Array.from(document.querySelectorAll('.contents-item'));
        if (items.length === 0) return;

        const totalGroups = Math.ceil(items.length / GROUP_SIZE);

        for (let g = 0; g < totalGroups; g++) {
            const start = g * GROUP_SIZE;
            const end = Math.min(start + GROUP_SIZE, items.length);
            const group = items.slice(start, end);

            // Случайная глава из группы
            const randomIndex = Math.floor(Math.random() * group.length);
            const item = group[randomIndex];

            // Если уже дребезжит — пропускаем, чтобы не наложилось
            if (item.classList.contains('electric-glitch')) continue;

            // пустые главы не дребезжат
            if (item.classList.contains('empty')) continue;

            item.dataset.glitchVariant = pickGlitchVariant(item);
            item.classList.add('electric-glitch');

            // Убираем эффект после окончания анимации
            setTimeout(() => {
                item.classList.remove('electric-glitch');
                delete item.dataset.glitchVariant;
            }, GLITCH_DURATION);
        }
    }

    // Запускаем цикл только пока оглавление на экране
    let glitchTimer = null;
    let dropTimer = null;

    function triggerAnalogDrop() {
        if (!contentsScreen.classList.contains('visible')) return;
        contentsScreen.classList.add('analog-drop');
        setTimeout(() => {
            contentsScreen.classList.remove('analog-drop');
        }, 200);
    }

    function scheduleAnalogDrop() {
        clearTimeout(dropTimer);
        dropTimer = setTimeout(() => {
            triggerAnalogDrop();
            scheduleAnalogDrop();
        }, 25000 + Math.random() * 15000);
    }

    function startGlitches() {
        if (glitchTimer) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        glitchTimer = setInterval(triggerGlitch, INTERVAL_MS);
        scheduleAnalogDrop();
    }

    function stopGlitches() {
        if (glitchTimer) {
            clearInterval(glitchTimer);
            glitchTimer = null;
        }
        clearTimeout(dropTimer);
        dropTimer = null;
    }

    new MutationObserver(() => {
        if (contentsScreen.classList.contains('visible')) startGlitches();
        else stopGlitches();
    }).observe(contentsScreen, { attributes: true, attributeFilter: ['class'] });
})();

                          
/* === МЕХАНИЧЕСКИЙ ГОЛОС: РАНДОМНАЯ АНИМАЦИЯ И ОТСЛЕЖИВАНИЕ === */
let voiceObserver = null;

function createVoiceSpan(cls, text) {
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = text;
    span.setAttribute('aria-hidden', 'true');
    return span;
}

function prepareVoiceElement(el) {
    let text = el.dataset.voiceText;
    if (!text) {
        text = el.textContent.trim();
        el.dataset.voiceText = text;
    }
    el.innerHTML = '';
    el.setAttribute('aria-label', text);
    return text;
}

function buildVoiceLayers(el) {
    const text = prepareVoiceElement(el);
    const base = document.createElement('span');
    base.className = 'voice-base';
    base.textContent = text;
    const red = createVoiceSpan('voice-red', text);
    const cyan = createVoiceSpan('voice-cyan', text);
    const slice1 = createVoiceSpan('voice-slice', text);
    const slice2 = createVoiceSpan('voice-slice', text);
    el.appendChild(base);
    el.appendChild(red);
    el.appendChild(cyan);
    el.appendChild(slice1);
    el.appendChild(slice2);
    return { base, red, cyan, slice1, slice2 };
}

function voiceTimer(el, fn, delay) {
    if (!el._voiceTimers) el._voiceTimers = [];
    const id = setTimeout(() => {
        el._voiceTimers = el._voiceTimers.filter((timer) => timer !== id);
        fn();
    }, delay);
    el._voiceTimers.push(id);
    return id;
}

function onVoiceCancel(el, fn) {
    if (!el._voiceCancel) el._voiceCancel = [];
    el._voiceCancel.push(fn);
}

function cancelVoiceAnimations(el) {
    (el._voiceTimers || []).forEach(clearTimeout);
    el._voiceTimers = [];
    (el._voiceCancel || []).forEach((fn) => fn());
    el._voiceCancel = [];
    [el, ...el.querySelectorAll('.voice-base, .voice-red, .voice-cyan, .voice-slice')].forEach((node) => {
        node.getAnimations().forEach((animation) => animation.cancel());
    });
    delete el.dataset.voiceActive;
}

function applyVoiceShock(el) {
    const parentP = el.closest('p');
    if (!parentP) return;
    const prev = parentP.previousElementSibling;
    const next = parentP.nextElementSibling;
    if (prev && prev.tagName === 'P') prev.classList.add('voice-shock-prev');
    if (next && next.tagName === 'P') next.classList.add('voice-shock-next');
    onVoiceCancel(el, () => {
        if (prev) prev.classList.remove('voice-shock-prev');
        if (next) next.classList.remove('voice-shock-next');
    });
    voiceTimer(el, () => {
        if (prev) prev.classList.remove('voice-shock-prev');
        if (next) next.classList.remove('voice-shock-next');
    }, 700);
}

function generateAggressiveGlitch(el) {
    const { base, red, cyan, slice1, slice2 } = buildVoiceLayers(el);
    applyVoiceShock(el);
    const snapMs = 250 + Math.random() * 150;
    const sustainMs = 450 + Math.random() * 350;
    const decayMs = 450 + Math.random() * 150;
    const clean = { transform: 'translateX(0)', opacity: 1, clipPath: 'inset(0 0 0 0)' };
    const snap = {
        duration: snapMs, easing: 'steps(3, jump-start)', fill: 'forwards'
    };
    base.animate([
        clean,
        { transform: 'translateX(1.5px) skewX(-3deg)', opacity: 0.9, clipPath: 'inset(0 0 0 0)' }
    ], snap);
    slice1.animate([
        { ...clean, opacity: 0 },
        { transform: 'translateX(8px)', opacity: 0.65, clipPath: 'inset(12% 0 48% 0)' }
    ], snap);
    slice2.animate([
        { ...clean, opacity: 0 },
        { transform: 'translateX(-8px)', opacity: 0.65, clipPath: 'inset(48% 0 12% 0)' }
    ], snap);
    red.animate([
        { ...clean, opacity: 0 },
        { transform: 'translateX(-3px)', opacity: 0.5, clipPath: 'inset(0 0 0 0)' }
    ], snap);
    cyan.animate([
        { ...clean, opacity: 0 },
        { transform: 'translateX(3px)', opacity: 0.5, clipPath: 'inset(0 0 0 0)' }
    ], snap);

    voiceTimer(el, () => {
        const sustain = { duration: sustainMs, easing: 'steps(2, jump-start)', fill: 'forwards' };
        base.animate([
            { transform: 'translateX(1.5px) skewX(-3deg)', opacity: 0.9 },
            { transform: 'translateX(0.4px)', opacity: 1 }
        ], sustain);
        slice1.animate([
            { transform: 'translateX(8px)', opacity: 0.65, clipPath: 'inset(12% 0 48% 0)' },
            { transform: 'translateX(3px)', opacity: 0.35, clipPath: 'inset(22% 0 38% 0)' }
        ], sustain);
        slice2.animate([
            { transform: 'translateX(-8px)', opacity: 0.65, clipPath: 'inset(48% 0 12% 0)' },
            { transform: 'translateX(-3px)', opacity: 0.35, clipPath: 'inset(38% 0 22% 0)' }
        ], sustain);
        red.animate([{ transform: 'translateX(-3px)', opacity: 0.5 }, { transform: 'translateX(-1.5px)', opacity: 0.25 }], sustain);
        cyan.animate([{ transform: 'translateX(3px)', opacity: 0.5 }, { transform: 'translateX(1.5px)', opacity: 0.25 }], sustain);
    }, snapMs);

    voiceTimer(el, () => {
        const decay = { duration: decayMs, easing: 'steps(3, jump-start)', fill: 'forwards' };
        base.animate([
            { transform: 'translateX(0.4px)', opacity: 1 },
            { transform: 'translateX(-0.2px)', opacity: 0.96 },
            clean
        ], decay);
        [slice1, slice2].forEach((layer, index) => {
            const direction = index === 0 ? 1 : -1;
            layer.animate([
                { transform: `translateX(${direction * 3}px)`, opacity: 0.35 },
                { transform: `translateX(${direction}px)`, opacity: 0.18 },
                { transform: 'translateX(0)', opacity: 0 }
            ], decay);
        });
        red.animate([{ transform: 'translateX(-1.5px)', opacity: 0.25 }, { transform: 'translateX(0)', opacity: 0 }], decay);
        cyan.animate([{ transform: 'translateX(1.5px)', opacity: 0.25 }, { transform: 'translateX(0)', opacity: 0 }], decay);
    }, snapMs + sustainMs);
    voiceTimer(el, () => cancelVoiceAnimations(el), snapMs + sustainMs + decayMs + 50);
}

function generateStandardGlitch(el) {
    const { base, red, cyan, slice1, slice2 } = buildVoiceLayers(el);
    const jitterFrames = () => {
        const steps = 8 + Math.floor(Math.random() * 5);
        const frames = Array.from({ length: steps }, () => ({
            transform: `translate(${(Math.random() * 3 - 1.5).toFixed(2)}px, ${(Math.random() * 2 - 1).toFixed(2)}px)`,
            opacity: 0.94 + Math.random() * 0.06,
            easing: 'steps(1, jump-start)'
        }));
        frames.push({ transform: 'translate(0, 0)', opacity: 1, easing: 'steps(1, jump-start)' });
        return frames;
    };
    const jitter = base.animate(jitterFrames(), { duration: 1000, iterations: Infinity });
    jitter.oniteration = () => jitter.effect.setKeyframes(jitterFrames());

    const burst = () => {
        if (!el.isConnected) return;
        const duration = 150 + Math.random() * 100;
        const shear = 4 + Math.random() * 4;
        const split = 25 + Math.random() * 35;
        const easing = 'steps(3, jump-start)';
        const firstClip = `inset(0 0 ${100 - split}% 0)`;
        const secondClip = `inset(${split}% 0 0 0)`;
        slice1.animate([
            { opacity: 0, transform: 'translateX(0)', clipPath: firstClip },
            { opacity: 0.65, transform: `translateX(${shear}px) skewX(-4deg)`, clipPath: firstClip, offset: 0.35 },
            { opacity: 0.35, transform: `translateX(${shear * 0.6}px)`, clipPath: firstClip, offset: 0.75 },
            { opacity: 0, transform: 'translateX(0)', clipPath: firstClip }
        ], { duration, easing });
        slice2.animate([
            { opacity: 0, transform: 'translateX(0)', clipPath: secondClip },
            { opacity: 0.65, transform: `translateX(${-shear}px) skewX(4deg)`, clipPath: secondClip, offset: 0.35 },
            { opacity: 0.35, transform: `translateX(${-shear * 0.6}px)`, clipPath: secondClip, offset: 0.75 },
            { opacity: 0, transform: 'translateX(0)', clipPath: secondClip }
        ], { duration, easing });
        const peekMs = 80 + Math.random() * 40;
        red.animate([
            { opacity: 0, transform: 'translateX(0)', clipPath: 'inset(0 0 0 0)' },
            { opacity: 0.45, transform: 'translateX(-1.5px)', clipPath: 'inset(0 0 0 0)' },
            { opacity: 0, transform: 'translateX(0)', clipPath: 'inset(0 0 0 0)' }
        ], { duration: peekMs, easing: 'steps(2, jump-start)' });
        cyan.animate([
            { opacity: 0, transform: 'translateX(0)', clipPath: 'inset(0 0 0 0)' },
            { opacity: 0.5, transform: 'translateX(1.5px)', clipPath: 'inset(0 0 0 0)' },
            { opacity: 0, transform: 'translateX(0)', clipPath: 'inset(0 0 0 0)' }
        ], { duration: peekMs, easing: 'steps(2, jump-start)' });
        voiceTimer(el, burst, 800 + Math.random() * 1600);
    };
    voiceTimer(el, burst, 800 + Math.random() * 1600);
}

function generateWhisperGlitch(el) {
    const text = prepareVoiceElement(el);
    const base = document.createElement('span');
    base.className = 'voice-base';
    base.textContent = text;
    el.appendChild(base);

    /* the existing soft transform/opacity dip, without injected keyframes */
    base.animate([
        { transform: 'none', opacity: 1, offset: 0 },
        { transform: 'translateX(0.2px) scaleX(1.01)', opacity: 0.55, offset: 0.22 },
        { transform: 'translateX(-0.1px) scaleX(1.005)', opacity: 0.78, offset: 0.44 },
        { transform: 'none', opacity: 0.96, offset: 0.66 },
        { transform: 'none', opacity: 1, offset: 0.86 },
        { transform: 'none', opacity: 1, offset: 1 }
    ], { duration: 1600, easing: 'ease-in-out', fill: 'forwards' });
    voiceTimer(el, () => cancelVoiceAnimations(el), 1650);
}


const voiceUnknownTokens = new Set();

function generateGlitchAnimation(el) {
    const requested = el.dataset.voiceMode || 'standard';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // reduced motion: stable text immediately, no glitch sequence
        el.textContent = prepareVoiceElement(el);
        return;
    }

    let mode = requested;
    if (!['standard', 'strong', 'whisper'].includes(mode)) {
        if (!voiceUnknownTokens.has(mode)) {
            console.warn('[ЭХО] Unknown VOICE mode "' + mode + '"; using standard.');
            voiceUnknownTokens.add(mode);
        }
        mode = 'standard';
    }
    el.dataset.voiceActive = mode;
    if (mode === 'strong') generateAggressiveGlitch(el);
    else if (mode === 'whisper') generateWhisperGlitch(el);
    else generateStandardGlitch(el);
}

function initVoiceObserver() {
    if (voiceObserver) voiceObserver.disconnect();

    const chapterScreen = document.getElementById('chapter-screen');
    if (!chapterScreen) return;
    chapterScreen.querySelectorAll('.voice-glitch').forEach(cancelVoiceAnimations);

    const options = {
        root: chapterScreen,
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0.5
    };

    voiceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.voiceTriggered) {
                entry.target.dataset.voiceTriggered = 'true';
                generateGlitchAnimation(entry.target);
            } else if (!entry.isIntersecting) {
                cancelVoiceAnimations(entry.target);
                delete entry.target.dataset.voiceTriggered;
            }
        });
    }, options);

    chapterScreen.querySelectorAll('.voice-glitch').forEach(el => {
        voiceObserver.observe(el);
    });
}

function cleanupVoiceObserver() {
    if (voiceObserver) {
        voiceObserver.disconnect();
        voiceObserver = null;
    }
    document.querySelectorAll('style[data-voice-glitch]').forEach(s => s.remove());
    document.querySelectorAll('.voice-glitch').forEach(el => {
        cancelVoiceAnimations(el);
        el.style.animation = '';
        delete el.dataset.voiceTriggered;
        if (el.dataset.voiceText) {
            el.textContent = el.dataset.voiceText;
            delete el.dataset.voiceText;
        }
        el.removeAttribute('aria-label');
    });
}

/* === МЕНЮ: ОТКРЫТИЕ / ЗАКРЫТИЕ === */
function openMenu() {
    if (isMenuOpen) return;
    isMenuOpen = true;
    menuOverlay.classList.add('open');
    menuOverlay.inert = false;
    if (contentsScreen.classList.contains('visible')) {
        contentsScreen.classList.add('menu-dimmed');
    }
    if (chapterScreen.classList.contains('visible')) {
        chapterScreen.classList.add('menu-dimmed');
    }
    if (menuTrigger) menuTrigger.classList.remove('visible');
    markOverlayOpen(menuOverlay);
    if (menuClose) menuClose.focus();
}

function closeMenu() {
    if (!isMenuOpen) return;
    isMenuOpen = false;
    menuOverlay.classList.remove('open');
    menuOverlay.inert = true;
    contentsScreen.classList.remove('menu-dimmed');
    chapterScreen.classList.remove('menu-dimmed');
    markOverlayClosed(menuOverlay);
    if (contentsScreen.classList.contains('visible') && menuTrigger) {
        menuTrigger.classList.add('visible');
        syncTriggerInert();
        menuTrigger.focus();
    } else if (chapterScreen.classList.contains('visible')) {
        const contentsButton = chapterScreen.querySelector('.nav-contents');
        if (contentsButton) contentsButton.focus();
    }
}

function toggleMenu() {
    isMenuOpen ? closeMenu() : openMenu();
}

if (menuTrigger) menuTrigger.addEventListener('click', toggleMenu);
if (menuClose) menuClose.addEventListener('click', closeMenu);

/* focus stays inside a modal overlay while it is open */
function trapTab(container, e) {
    if (e.key !== 'Tab') return;
    const focusables = Array.from(container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((el) => !el.closest('[inert]') && el.getClientRects().length > 0);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!container.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
    } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
}

/* === КОПИРОВАНИЕ НОМЕРА КАРТЫ === */
function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(ta);
    return ok;
}

function copyCard(targetId, btn) {
    const cardEl = document.getElementById(targetId);
    if (!cardEl || !btn) return;
    const text = cardEl.textContent.trim();

    const flash = (label, ok) => {
        const originalText = btn.dataset.origText || btn.textContent;
        btn.dataset.origText = originalText;
        btn.textContent = label;
        btn.classList.toggle('copied', ok);
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    };
    /* success only on real success: both APIs failing -> honest failure */
    const onSuccess = () => flash('Скопировано', true);
    const onFailure = () => flash('Не скопировалось', false);

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
            if (fallbackCopy(text)) onSuccess(); else onFailure();
        });
    } else {
        if (fallbackCopy(text)) onSuccess(); else onFailure();
    }
}

document.querySelectorAll('.donate-copy').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        if (target) copyCard(target, btn);
    });
});

/* === КНИГА НА РАБОЧИЙ СТОЛ === */
const installTrigger = document.getElementById('install-trigger');
const installOverlay = document.getElementById('install-overlay');
const installClose = document.getElementById('install-close');
const installCopy = document.getElementById('install-copy');
const installNativeBtn = document.getElementById('install-native');

/* Chrome/Android предлагает нативную установку — ловим событие заранее */
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
});
window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    saveState({ installed: true });
});

function openInstall() {
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    const alreadyInstalled = !!loadState().installed;

    const blockAndroid = document.getElementById('install-android');
    const blockIOS = document.getElementById('install-ios');
    const doneEl = document.getElementById('install-done');

    blockAndroid.style.display = 'none';
    blockIOS.style.display = 'none';
    doneEl.style.display = 'none';
    installOverlay.classList.remove('show-both');
    if (installNativeBtn) installNativeBtn.style.display = 'none';

    if (isStandalone || alreadyInstalled) {
        doneEl.style.display = 'block';
    } else {
        // нативная кнопка сверху, ручная инструкция ниже — как запасной вариант
        if (deferredInstallPrompt && installNativeBtn) {
            installNativeBtn.style.display = 'block';
        }
        if (isIOS) {
            blockIOS.style.display = 'block';
        } else if (isAndroid) {
            blockAndroid.style.display = 'block';
        } else {
            blockAndroid.style.display = 'block';
            blockIOS.style.display = 'block';
            installOverlay.classList.add('show-both');
        }
    }

    installOverlay.classList.add('visible');
    installOverlay.inert = false;
    document.body.classList.add('install-open');
    markOverlayOpen(installOverlay);
    if (installClose) installClose.focus();
}

function closeInstall() {
    installOverlay.classList.remove('visible');
    installOverlay.inert = true;
    document.body.classList.remove('install-open');
    markOverlayClosed(installOverlay);
    if (installTrigger && installTrigger.classList.contains('visible')) {
        syncTriggerInert();
        installTrigger.focus();
    } else if (chapterScreen.classList.contains('visible')) {
        const contentsButton = chapterScreen.querySelector('.nav-contents');
        if (contentsButton) contentsButton.focus();
    }
}

if (installTrigger) installTrigger.addEventListener('click', openInstall);
if (installTrigger && typeof menuTrigger !== 'undefined' && menuTrigger) {
    installTrigger.classList.toggle('visible', menuTrigger.classList.contains('visible'));
    new MutationObserver(() => {
        installTrigger.classList.toggle('visible', menuTrigger.classList.contains('visible'));
    }).observe(menuTrigger, { attributes: true, attributeFilter: ['class'] });
}

/* hidden triggers stay out of the Tab order */
function syncTriggerInert() {
    const vis = !!(menuTrigger && menuTrigger.classList.contains('visible'));
    if (menuTrigger) menuTrigger.inert = !vis;
    if (installTrigger) installTrigger.inert = !vis;
}
if (menuTrigger) {
    new MutationObserver(syncTriggerInert)
        .observe(menuTrigger, { attributes: true, attributeFilter: ['class'] });
}
syncTriggerInert();
if (installClose) installClose.addEventListener('click', closeInstall);
if (installOverlay) installOverlay.addEventListener('click', (e) => {
    if (e.target === installOverlay) closeInstall();
});
if (installCopy) installCopy.addEventListener('click', () => copyCard('install-url', installCopy));
if (installNativeBtn) installNativeBtn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    try { await deferredInstallPrompt.userChoice; } catch (e) {}
    deferredInstallPrompt = null;
    installNativeBtn.style.display = 'none';
});

/* === АВТОДОПИСЫВАНИЕ ИСТОЧНИКА ПРИ КОПИРОВАНИИ === */
document.addEventListener('copy', function(e) {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (!text) return;

    // Работает только внутри текста главы
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (!range) return;
    const container = range.commonAncestorContainer;
    const el = container.nodeType === 3 ? container.parentElement : container;
    if (!el.closest('.chapter-text')) return;

    const source = '\n\n— из «ЭХО». Читать: iterevsky.github.io/echo';
    e.preventDefault();
    e.clipboardData.setData('text/plain', text + source);
});



/* === ФОТО: ОБРАБОТЧИКИ === */

document.addEventListener('click', function(e) {
  const link = e.target.closest('.photo-link');
  if (!link) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const filename = link.getAttribute('data-photo');
  if (filename) {
    photoTrigger = link;
    openPhoto(filename);
  }
});

document.addEventListener('touchstart', function(e) {
  const link = e.target.closest('.photo-link');
  if (!link) return;
  
  photoTouchMoved = false;
  photoTouchTimer = setTimeout(function() {
    if (!photoTouchMoved) {
      const filename = link.getAttribute('data-photo');
      if (filename) {
        e.preventDefault();
        photoTrigger = link;
        openPhoto(filename);
      }
    }
  }, 150);
}, { passive: false });

/* keyboard: Enter/Space on a photo-link (role=button) */
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const link = e.target && e.target.classList ? e.target.closest('.photo-link') : null;
  if (!link) return;
  e.preventDefault();
  const filename = link.getAttribute('data-photo');
  if (filename) {
    photoTrigger = link;
    openPhoto(filename);
  }
});

document.addEventListener('touchmove', function(e) {
  if (photoTouchTimer) {
    clearTimeout(photoTouchTimer);
    photoTouchTimer = null;
  }
  photoTouchMoved = true;
}, { passive: true });

document.addEventListener('touchend', function(e) {
  if (photoTouchTimer) {
    clearTimeout(photoTouchTimer);
    photoTouchTimer = null;
  }
}, { passive: true });

/* ============================================================
   PROGRESS
   ============================================================ */

/* скрыть обложку/вопрос/финал/титул — вход в книгу без вступления */
function hideIntroScreens() {
    isStarted = true;
    coverScreen.style.opacity = '0';
    coverScreen.style.pointerEvents = 'none';
    textScreen.style.opacity = '0';
    textScreen.style.pointerEvents = 'none';
    finalScreen.style.opacity = '0';
    finalScreen.style.pointerEvents = 'none';
    titleScreen.style.opacity = '0';
    titleScreen.style.pointerEvents = 'none';
}

/* deep-link ?ch=N: открыть главу сразу; пустая/невалидная — в оглавление */
async function handleDeepLink() {
    const m = /[?&]ch=(\d+)/.exec(location.search);
    if (!m) return false;
    const idx = parseInt(m[1], 10);
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    hideIntroScreens();
    updateContentsMemory();

    if (isNaN(idx) || idx < 0 || idx >= chapters.length) {
        openContentsFresh();
        return true;
    }
    await openChapter(idx);
    return true;
}

/* ссылка вида #ch-12: внешний переход (history.state пуст) — открыть главу сразу.
   Перезагрузка внутри сессии (history.state уже наш) — НЕ перехватываем:
   отдаём ход initProgress(), чтобы показать «Продолжить / Начать сначала» */
async function handleHashLink() {
    const m = (location.hash || '').match(/^#ch-(\d+)$/);
    if (!m) return false;
    if (history.state && history.state.echoChapter !== undefined) return false;
    const idx = chapters.findIndex((c) => String(c.number) === m[1]);
    if (idx < 0) return false;
    hideIntroScreens(); /* новый читатель по ссылке — без заставки */
    await openChapter(idx);
    return true;
}

function openContentsFresh() {
    readerGeneration++;
    cleanupSwipeHandlers();
    cleanupChapterTear();
    chapterScreen.classList.remove('visible');
    chapterScreen.inert = true;
    contentsScreen.classList.add('visible');
    contentsScreen.inert = false;
    if (menuTrigger) menuTrigger.classList.add('visible');
    revealContentsItems();
}

/* проявление пунктов оглавления — идемпотентно, из любой точки показа */
function clearRevealTimers() {
    revealTimers.forEach(clearTimeout);
    revealTimers = [];
}
function revealContentsItems() {
    clearRevealTimers();   // reopening/hiding cancels the previous schedule
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.contents-item').forEach((item, i) => {
        if (item.classList.contains('revealed')) return;
        if (reduced) { item.classList.add('revealed'); return; }
        const id = setTimeout(() => {
            item.classList.add('revealed');
            const at = revealTimers.indexOf(id);
            if (at !== -1) revealTimers.splice(at, 1);
        }, 200 + i * 20);
        revealTimers.push(id);
    });
}

async function initProgress() {
    const saved = loadState();
    if (saved.lastChapter === undefined || saved.lastChapter < 0) return;
    isStarted = true;

    try {
        await ensureChapters();
    } catch (error) {
        showChapterLoadError(saved.lastChapter, initProgress);
        return;
    }
    const chapter = chapters[saved.lastChapter];
    if (!chapter || chapter.empty) { openContentsFresh(); return; }

    hideIntroScreens();

    updateContentsMemory();
    contentsScreen.classList.add('visible');
    contentsScreen.inert = false;
    if (menuTrigger) menuTrigger.classList.add('visible');
    scrollContentsToCurrent();

    revealContentsItems();

    contentsScreen.classList.add('progress-dimmed');

    const overlay = document.getElementById('progress-overlay');
    if (!overlay) return;
    overlay.innerHTML = `
        <div class="progress-content">
            <div class="progress-title" id="progress-title">Вы остановились на главе ${chapter.number}</div>
            <div class="progress-subtitle">${chapter.title}</div>
            <div class="progress-actions">
                <button type="button" class="progress-continue"><span class="pa-label">Продолжить</span><span class="pa-arrow" aria-hidden="true">→</span></button>
                <button type="button" class="progress-restart">Начать сначала</button>
            </div>
        </div>
    `;
    overlay.setAttribute('aria-labelledby', 'progress-title');
    overlay.inert = false;
    overlay.classList.add('visible');
    contentsScreen.inert = true;   // dimmed contents stays out of the Tab order
    markOverlayOpen(overlay);
    overlay.querySelector('.progress-continue').focus();

    overlay.querySelector('.progress-continue').addEventListener('click', () => {
        closeProgress(false);
        setTimeout(() => openChapter(saved.lastChapter, { restore: true }), 400);
    });

    overlay.querySelector('.progress-restart').addEventListener('click', () => {
        // стираем только прогресс чтения; настройки читателя сохраняем
        // everything else survives too: installed flag, visit rotation,
        // badge state, unknown fields — no wholesale replacement
        const s = loadState();
        delete s.readPos;
        delete s.lastChapter;
        delete s.chapterTitle;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        } catch (err) {}
        closeProgress(false);
        location.reload();
    });
}

initSwipeHandlers();

/* === CRT: генерация шума и бегущей развёртки === */
(function() {
    const noiseElements = document.querySelectorAll('.crt-noise');
    if (noiseElements.length > 0) {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(size, size);
        const data = imgData.data;

        for (let y = 0; y < size; y++) {
            const lineInt = Math.random();
            const isBright = lineInt > 0.92;
            const isMed = lineInt > 0.75 && !isBright;

            for (let x = 0; x < size; x++) {
                const i = (y * size + x) * 4;
                let n = Math.random();
                if (isBright) n = 0.4 + Math.random() * 0.5;
                else if (isMed) n = 0.15 + Math.random() * 0.3;
                else n = Math.random() * 0.12;

                if (Math.random() > 0.7) n += Math.random() * 0.15;

                data[i]     = Math.floor(n * 48 + 14);
                data[i + 1] = Math.floor(n * 58 + 18);
                data[i + 2] = Math.floor(n * 44 + 12);
                data[i + 3] = Math.floor(n * 200 + 30);
            }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        noiseElements.forEach(el => {
            el.style.backgroundImage = `url(${dataUrl})`;
        });
    }

    const chapterScreen = document.getElementById('chapter-screen');
    if (chapterScreen && !chapterScreen.querySelector('.crt-rolling')) {
        const rolling = document.createElement('div');
        rolling.className = 'crt-rolling';
        chapterScreen.appendChild(rolling);
    }
})();

/* ============================================================
   ПРОЕКТОРНАЯ ПЛЁНКА: ЭПИЗОД МЕЖДУ ВСПЫШКОЙ И НАЗВАНИЕМ
   ============================================================ */

const FILM_FRAMES = [
    'images/frame/frame-01.jpg',
    'images/frame/frame-02.jpg',
    'images/frame/frame-03.jpg',
    'images/frame/frame-04.jpg',
    'images/frame/frame-05.jpg',
    'images/frame/frame-06.jpg',
    'images/frame/frame-07.jpg'
];

const filmScreen = document.getElementById('film-screen');
const filmGate = filmScreen ? filmScreen.querySelector('.film-gate') : null;
const filmImage = filmGate ? filmGate.querySelector('.film-image') : null;
const filmGrain = filmScreen ? filmScreen.querySelector('.film-grain') : null;
const filmHalo = filmGate ? filmGate.querySelector('.film-halo') : null;
const filmHint = document.getElementById('film-hint');

let filmReady = false;
let filmRunning = false;
let filmLoaded = [];
let filmPreloadStarted = false;

function preloadFilmFrames() {
    return Promise.all(FILM_FRAMES.map((src) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            if (img.decode) {
                img.decode().then(() => resolve(true)).catch(() => resolve(false));
            } else {
                resolve(true);
            }
        };
        img.onerror = () => resolve(false);
        img.src = src;
    }))).then((results) => {
        filmLoaded = results;
        // эпизод идёт, если загрузилось не меньше 5 кадров из 7
        return results.filter(Boolean).length >= 5;
    });
}

/* ближайший успешно загруженный кадр к заданному индексу */
function filmFrameSrc(i) {
    if (!filmLoaded.length) return FILM_FRAMES[i];
    if (filmLoaded[i]) return FILM_FRAMES[i];
    for (let step = 1; step < FILM_FRAMES.length; step++) {
        const up = i + step;
        const down = i - step;
        if (up < FILM_FRAMES.length && filmLoaded[up]) return FILM_FRAMES[up];
        if (down >= 0 && filmLoaded[down]) return FILM_FRAMES[down];
    }
    return FILM_FRAMES[i];
}

/* прелоад кадров не при загрузке страницы, а когда канал свободен */
function startFilmPreload() {
    if (filmPreloadStarted) return;
    filmPreloadStarted = true;
    preloadFilmFrames().then((ok) => { filmReady = ok; });
}

/* зерно: текстура генерируется на canvas, по образцу CRT-шума */
function buildFilmGrain() {
    if (!filmGrain) return;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
        const lineInt = Math.random();
        const isBright = lineInt > 0.965;
        const isMed = lineInt > 0.87 && !isBright;

        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            let n = Math.random();
            if (isBright) n = 0.4 + Math.random() * 0.4;
            else if (isMed) n = 0.12 + Math.random() * 0.2;
            else n = Math.random() * 0.14;

            if (Math.random() > 0.72) n += Math.random() * 0.18;

            const v = Math.floor(Math.min(n, 1) * 255);
            data[i] = v;
            data[i + 1] = v;
            data[i + 2] = v;
            data[i + 3] = Math.floor(n * 220 + 25);
        }
    }

    ctx.putImageData(imgData, 0, 0);
    filmGrain.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`;
}

buildFilmGrain();

/* preload only when the intro will actually run: bypassed intro
   (deep link, hash link, saved progress) never plays the film */
function prefetchIntroAssets() {
    prefetchChapters();
    startFilmPreload();
}
if (!isStarted) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(prefetchIntroAssets, { timeout: 8000 });
    } else {
        setTimeout(prefetchIntroAssets, 4000);
    }
}

function showFilmHint() {
    if (!filmHint) return;
    filmHint.classList.remove('visible');
    void filmHint.offsetWidth;
    filmHint.classList.add('visible');
}

function runFilmSequence() {
    if (filmRunning || !filmScreen || !filmGate || !filmImage) return;
    filmRunning = true;
    filmScreen.style.pointerEvents = 'auto';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers = [];
    const clones = [];
    let finished = false;

    const later = (fn, ms) => {
        const id = setTimeout(fn, ms);
        timers.push(id);
        return id;
    };
    const clearAllTimers = () => {
        timers.forEach((id) => clearTimeout(id));
        timers.length = 0;
    };
    const removeClones = () => {
        clones.forEach((el) => { if (el.parentNode) el.parentNode.removeChild(el); });
        clones.length = 0;
    };

    const onVisibilityHidden = () => {
        if (document.hidden) endToTitle();
    };
    let filmPointer = null;
    let lastFilmTap = 0;
    const resetFilmGesture = () => {
        filmPointer = null;
        lastFilmTap = 0;
    };
    const onFilmPointerDown = (e) => {
        if (!filmRunning || !e.isPrimary || !['touch', 'pen', 'mouse'].includes(e.pointerType)) return;
        filmPointer = { id: e.pointerId, x: e.clientX, y: e.clientY, at: performance.now() };
    };
    const onFilmPointerUp = (e) => {
        if (!filmRunning || !filmPointer || filmPointer.id !== e.pointerId) return;
        const start = filmPointer;
        filmPointer = null;
        const duration = performance.now() - start.at;
        const movement = Math.hypot(e.clientX - start.x, e.clientY - start.y);
        if (duration > 300 || movement > 10) { lastFilmTap = 0; return; }
        const now = performance.now();
        if (lastFilmTap && now - lastFilmTap <= 300) {
            lastFilmTap = 0;
            endToTitle();
        } else {
            lastFilmTap = now;
        }
    };
    const onFilmPointerCancel = () => resetFilmGesture();

    /* pointerup is the only tap channel; synthetic clicks are never consumed */
    const endToTitle = () => {
        if (finished) return;
        finished = true;
        clearAllTimers();
        resetFilmGesture();
        document.removeEventListener('visibilitychange', onVisibilityHidden);
        filmScreen.removeEventListener('pointerdown', onFilmPointerDown);
        filmScreen.removeEventListener('pointerup', onFilmPointerUp);
        filmScreen.removeEventListener('pointercancel', onFilmPointerCancel);
        window.removeEventListener('blur', onFilmPointerCancel);

        filmScreen.classList.remove('film-live');
        filmScreen.classList.remove('visible');
        filmScreen.style.pointerEvents = '';
        if (filmHint) filmHint.classList.remove('visible');
        filmGate.classList.remove('filming', 'film-flick', 'film-tear', 'film-zoom', 'film-slip', 'film-gap', 'film-gap-dip', 'film-drift', 'film-breathe', 'film-jam', 'film-push', 'film-catch', 'film-lamp-stutter', 'film-lamp-die');
        filmGate.style.visibility = '';
        filmGate.style.clipPath = '';
        filmGate.style.webkitClipPath = '';
        filmGate.style.transition = '';
        filmImage.style.opacity = '';
        filmScreen.style.filter = '';
        const crackleEl = filmScreen.querySelector('#film-crackle');
        if (crackleEl) crackleEl.style.opacity = '0';

        const scratch = filmGate.querySelector('.film-scratch');
        if (scratch) scratch.remove();

        titleScreen.classList.add('visible');
        titleScreen.addEventListener('click', showContents, { once: true });

        later(() => {
            filmScreen.classList.remove('reduced', 'film-flick', 'film-breathe', 'film-hit-light', 'film-lamp-stutter', 'film-lamp-die', 'film-startup', 'film-catch-light', 'film-lamp-ignite');
            filmScreen.style.transition = '';
            removeClones();
            filmRunning = false;
        }, 450);
    };

    filmScreen.addEventListener('pointerdown', onFilmPointerDown);
    filmScreen.addEventListener('pointerup', onFilmPointerUp);
    filmScreen.addEventListener('pointercancel', onFilmPointerCancel);
    window.addEventListener('blur', onFilmPointerCancel);
    document.addEventListener('visibilitychange', onVisibilityHidden);

    /* --- reduced-motion: плавные кроссфейды без эффектов --- */
    if (reduced) {
        filmScreen.classList.add('visible');
        filmScreen.classList.add('reduced');
        showFilmHint();

        const buffer = document.createElement('img');
        buffer.className = 'film-image film-clone';
        buffer.alt = '';
        buffer.draggable = false;
        buffer.src = filmFrameSrc(0);
        buffer.style.opacity = '0';
        filmGate.appendChild(buffer);
        clones.push(buffer);

        filmImage.src = filmFrameSrc(0);
        filmImage.style.opacity = '0';
        void filmImage.offsetWidth;
        filmImage.style.opacity = '1';

        let active = filmImage;
        let idle = buffer;
        let t = 1000;
        for (let i = 1; i < FILM_FRAMES.length; i++) {
            const showFrame = () => {
                idle.src = filmFrameSrc(i);
                idle.style.opacity = '1';
                active.style.opacity = '0';
                const tmp = active;
                active = idle;
                idle = tmp;
            };
            later(showFrame, t);
            t += 1000;
        }
        later(endToTitle, t);
        return;
    }

    /* --- обычная серия --- */

    /* треск символов в жёстких провалах: один переиспользуемый canvas,
       кадры пересобираются на старте каждой серии */
    let crackle = filmScreen.querySelector('#film-crackle');
    if (!crackle) {
        crackle = document.createElement('canvas');
        crackle.id = 'film-crackle';
        filmScreen.appendChild(crackle);
    }
    crackle.width = window.innerWidth;
    crackle.height = window.innerHeight;
    const crackleCtx = crackle.getContext('2d');
    const crackleFrames = makeStaticFrames(window.innerWidth, window.innerHeight, {
        frames: 2,
        glyphs: 30,
        colors: ['rgba(232,230,227,0.55)', 'rgba(0,168,232,0.5)']
    });

    /* показ на длину провала (60–120 мс), один swap кадров на 40 мс,
       экран на время окна темнее (0.85) */
    const crackleBurst = (ms) => {
        const dur = Math.min(120, Math.max(60, ms));
        crackleCtx.drawImage(crackleFrames[0], 0, 0);
        crackle.style.opacity = '1';
        filmScreen.style.filter = 'brightness(0.85)';
        later(() => crackleCtx.drawImage(crackleFrames[1], 0, 0), 40);
        later(() => {
            crackle.style.opacity = '0';
            filmScreen.style.filter = '';
        }, dur);
    };

    const pulse = (cls, ms) => {
        filmGate.classList.remove(cls);
        void filmGate.offsetWidth;
        filmGate.classList.add(cls);
        later(() => filmGate.classList.remove(cls), ms);
    };

    const pulseScreen = (cls, ms) => {
        filmScreen.classList.remove(cls);
        void filmScreen.offsetWidth;
        filmScreen.classList.add(cls);
        later(() => filmScreen.classList.remove(cls), ms);
    };

    const flick = () => pulseScreen('film-flick', 90);
    const setFrame = (i) => {
        const src = filmFrameSrc(i);
        filmImage.src = src;
        // gate ghosting: the halo follows the frame change a beat late
        if (filmHalo) later(() => { filmHalo.src = src; }, 110);
        filmImage.style.setProperty('--frame-hue', (Math.random() * 10 - 8).toFixed(1) + 'deg');
        filmImage.style.setProperty('--frame-bright', (Math.random() * 0.05 - 0.02).toFixed(3));
    };

    /* хроматический разрыв: красный и циановый клоны кадра */
    const chromSplit = (src) => {
        const makeClone = (filterValue, tx) => {
            const img = document.createElement('img');
            img.className = 'film-clone';
            img.alt = '';
            img.draggable = false;
            img.src = src;
            img.style.transform = `translateX(${tx}px) scale(1.03)`;
            img.style.filter = filterValue;
            filmGate.appendChild(img);
            clones.push(img);
        };
        makeClone('grayscale(1) sepia(1) saturate(6) hue-rotate(-48deg) brightness(0.7)', -2);
        makeClone('grayscale(1) sepia(1) saturate(5) hue-rotate(150deg) brightness(0.8)', 2);
        later(removeClones, 80);
    };

    const runScratch = () => {
        const scratch = document.createElement('div');
        scratch.className = 'film-scratch';
        scratch.style.left = (12 + Math.random() * 76) + '%';
        filmGate.appendChild(scratch);
        void scratch.offsetWidth;
        scratch.classList.add('run');
        later(() => { if (scratch.parentNode) scratch.remove(); }, 600);
    };

    /* затухание лампы проектора после седьмого кадра */
    const sleep = (ms) => new Promise((resolve) => { later(resolve, ms); });

    const runFilmEnding = async () => {
        filmGate.classList.remove('film-drift');
        filmScreen.classList.remove('film-breathe');
        filmGate.classList.add('film-jam');
        await sleep(170);
        if (finished) return;
        filmGate.classList.remove('film-jam');
        filmScreen.classList.add('film-lamp-stutter');
        await sleep(240);
        if (finished) return;
        filmScreen.classList.remove('film-lamp-stutter');
        filmScreen.classList.add('film-lamp-die');
        await sleep(620);
        if (finished) return;
        filmScreen.classList.remove('film-live');
        filmScreen.classList.remove('visible');
        await sleep(330);
        if (finished) return;
        titleScreen.classList.add('film-enter');
        void titleScreen.offsetWidth;
        titleScreen.classList.add('visible');
        endToTitle();
    };

    const VISIBLE = [1700, 700, 550, 600, 500, 900, 1400];
    const GAPS = [120, 100, 80, 90, 60, 250];
    const scratchAtGap = 2 + Math.floor(Math.random() * 2); // провал после кадра 3 или 4
    const SOFT_GAPS = [false, false, true, false, false, true]; // мягкие провалы после 3-го и 6-го кадров

    const startBreathe = (ms) => {
        filmScreen.style.setProperty('--breathe-dur', ms + 'ms');
        filmScreen.classList.remove('film-breathe');
        void filmScreen.offsetWidth;
        filmScreen.classList.add('film-breathe');
    };

    // === ЗАПУСК ПРОЕКТОРА: сначала свет, потом кадр ===
    const LAMP_MS = 900;   // лампа зажигается: пустой луч с зерном и царапинами
    const CATCH_MS = 520;  // ворот ловит первый кадр

    // акт 1. ЛАМПА: экран виден, луч пустой (film-startup), изображения нет
    filmScreen.classList.add('visible');
    filmScreen.classList.add('film-live');
    filmScreen.classList.add('film-startup');
    filmGate.classList.add('filming');
    void filmScreen.offsetWidth;
    filmScreen.classList.add('film-lamp-ignite');
    showFilmHint();

    // пыль и царапины видны в пустом свете до появления кадра
    later(runScratch, 260);
    later(runScratch, 640);

    // акт 2. ВОРОТ ЛОВИТ КАДР: влетает смещённым и пересвеченным
    later(() => {
        filmScreen.classList.remove('film-lamp-ignite');
        filmScreen.classList.remove('film-startup');
        setFrame(0);
        filmGate.classList.add('film-catch');
        filmScreen.classList.add('film-catch-light');
    }, LAMP_MS);

    // акт 3. КАДР СЕЛ: щелчок, начинаются дрейф и дыхание
    later(() => {
        filmGate.classList.remove('film-catch');
        filmScreen.classList.remove('film-catch-light');
        filmGate.classList.add('film-drift');
        flick();
        startBreathe(VISIBLE[0]);
    }, LAMP_MS + CATCH_MS);

    let t = LAMP_MS + CATCH_MS;
    for (let i = 0; i < 6; i++) {
        t += VISIBLE[i];
        const gapIndex = i;
        const nextFrame = i + 1;

        later(() => {
            filmScreen.classList.remove('film-breathe');
            if (SOFT_GAPS[gapIndex]) {
                pulse('film-gap-dip', 160);
            } else {
                filmGate.classList.add('film-gap');
                crackleBurst(GAPS[gapIndex]);
            }
            if (nextFrame === 3) {
                pulse('film-slip', 140);
                chromSplit(FILM_FRAMES[3]);
            }
            if (gapIndex === scratchAtGap) runScratch();
        }, t);

        t += GAPS[i];

        later(() => {
            setFrame(nextFrame);
            filmGate.classList.remove('film-gap');
            startBreathe(VISIBLE[nextFrame]);
            flick();
            if (nextFrame >= 2 && nextFrame <= 4) {
                pulse('film-tear', 200);
                pulse('film-zoom', 500);
            }
            if (nextFrame === 5) {
                pulse('film-hit', 300);
                pulseScreen('film-hit-light', 300);
            }
            if (nextFrame === 6) {
                filmGate.classList.add('film-push');
            }
        }, t);
    }

    t += VISIBLE[6];
    later(runFilmEnding, t);
}

/* ============================================================
   ЧИТАТЕЛЬСКИЙ ИНТЕРФЕЙС: ПАНЕЛЬ, ПРОГРЕСС, ШТОРКА, МЕСТО В ГЛАВЕ
   ============================================================ */

function setBarHidden(hidden) {
    const bar = document.getElementById('chapter-bar');
    if (!bar) return;
    barHidden = hidden;
    bar.classList.toggle('bar-hidden', hidden);
}

function updateChapterProgress() {
    const fill = document.querySelector('#chapter-progress .progress-fill');
    if (!fill || !chapters[currentChapter]) return;
    const total = chapterScreen.scrollHeight - chapterScreen.clientHeight;
    const frac = total > 0 ? Math.min(chapterScreen.scrollTop / total, 1) : 1;
    fill.style.setProperty('--p', frac);
}

chapterScreen.addEventListener('scroll', () => {
    if (!chapterScreen.classList.contains('visible')) return;
    const st = chapterScreen.scrollTop;
    const delta = st - barLastScroll;
    if (!isReaderSheetOpen()) {
        if (delta > 8 && st > 60) setBarHidden(true);
        else if (delta < -8) setBarHidden(false);
    }
    barLastScroll = st;

    updateChapterProgress();

    // capture identity now; the delayed write must not outlive this chapter
    const sessionChapter = currentChapter;
    const sessionGeneration = readerGeneration;
    clearTimeout(readPosTimer);
    readPosTimer = setTimeout(() => {
        if (sessionGeneration !== readerGeneration || sessionChapter !== currentChapter) return;
        if (!chapterScreen.classList.contains('visible')) return;
        const total = chapterScreen.scrollHeight - chapterScreen.clientHeight;
        if (total <= 0) return;
        const frac = chapterScreen.scrollTop / total;
        if (frac > 0.02) {
            const s = loadState();
            const readPos = s.readPos || {};
            const prevFrac = Number(readPos[sessionChapter]) || 0;
            const newFrac = Math.min(frac, 1);
            if (prevFrac < 0.85 && newFrac >= 0.85) justFinishedChapter = sessionChapter;
            readPos[sessionChapter] = newFrac;
            saveState({ readPos });
        }
    }, 500);
}, { passive: true });

chapterScreen.addEventListener('click', (e) => {
    if (!chapterScreen.classList.contains('visible')) return;
    if (e.target.closest('.photo-link')) return;
    if (e.target.closest('#chapter-bar')) return;
    if (isReaderSheetOpen()) { toggleReaderSheet(false); return; }
    setBarHidden(!barHidden);
});

/* --- шторка настроек чтения --- */

function getReaderSettings() {
    const s = loadState();
    return s.readerSettings || { size: 1, tone: 'standard', dim: 0 };
}

function applyReaderSettings() {
    const rs = getReaderSettings();
    const chScreen = document.getElementById('chapter-screen');
    chScreen.classList.remove('reader-size-0', 'reader-size-1', 'reader-size-2', 'reader-size-3');
    chScreen.classList.remove('reader-tone-soft', 'reader-tone-warm');
    chScreen.classList.add('reader-size-' + rs.size);
    if (rs.tone !== 'standard') chScreen.classList.add('reader-tone-' + rs.tone);

    const dim = document.getElementById('reader-dim');
    if (dim) dim.style.setProperty('--dim-op', (rs.dim / 100));

    document.querySelectorAll('.rs-dot').forEach((d, i) => {
        d.classList.toggle('active', i <= rs.size);
    });
    document.querySelectorAll('.rs-tone').forEach((t) => {
        t.classList.toggle('active', t.dataset.tone === rs.tone);
    });
    const dimInput = document.querySelector('.rs-dim');
    if (dimInput && Number(dimInput.value) !== rs.dim) dimInput.value = rs.dim;

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
        themeMeta.content = rs.tone === 'warm' ? '#14100a' :
                            rs.tone === 'soft' ? '#0c0f0c' : '#0c0c0c';
    }
}

function setReaderSetting(key, value) {
    const rs = getReaderSettings();
    rs[key] = value;
    saveState({ readerSettings: rs });
    applyReaderSettings();
}

function isReaderSheetOpen() {
    const sheet = document.getElementById('reader-sheet');
    return sheet && sheet.classList.contains('open');
}

function toggleReaderSheet(open) {
    const sheet = document.getElementById('reader-sheet');
    const backdrop = document.getElementById('reader-sheet-backdrop');
    if (!sheet || !backdrop) return;
    sheet.classList.toggle('open', open);
    sheet.inert = !open;
    backdrop.classList.toggle('open', open);
    if (open) {
        setBarHidden(false);
        markOverlayOpen(sheet);
        const first = sheet.querySelector('button, input');
        if (first) first.focus();
    } else {
        markOverlayClosed(sheet);
        if (navAaBtn) navAaBtn.focus();
    }
}

const navAaBtn = document.querySelector('.nav-aa');
if (navAaBtn) navAaBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleReaderSheet(!isReaderSheetOpen());
});

const readerBackdrop = document.getElementById('reader-sheet-backdrop');
if (readerBackdrop) readerBackdrop.addEventListener('click', () => toggleReaderSheet(false));

document.querySelectorAll('.rs-size-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const rs = getReaderSettings();
        const next = Math.min(3, Math.max(0, rs.size + Number(btn.dataset.dir)));
        setReaderSetting('size', next);
    });
});

document.querySelectorAll('.rs-tone').forEach((btn) => {
    btn.addEventListener('click', () => setReaderSetting('tone', btn.dataset.tone));
});

const rsDimInput = document.querySelector('.rs-dim');
if (rsDimInput) rsDimInput.addEventListener('input', (e) => {
    setReaderSetting('dim', Number(e.target.value));
});

applyReaderSettings();

/* --- выход из главы в оглавление (общий для всех точек) --- */
/* --- прокрутка оглавления к текущей главе --- */
function scrollContentsToCurrent() {
    const s = loadState();
    if (typeof s.lastChapter !== 'number' || s.lastChapter < 0) return;
    const item = document.querySelector('.contents-item[data-chapter="' + s.lastChapter + '"]');
    if (!item) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
        item.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    });
}

function doExitChapterToContents() {
    chapterExitInProgress = false;
    readerGeneration++;            // leaving the reader invalidates pending writes
    cleanupChapterTear();
    clearTimeout(readPosTimer);
    readPosTimer = null;
    cancelHeadingEffects();        /* если ушли в середине сборки — чистый текст */
    releaseReaderWakeLock();
    updateContentsMemory();
    cleanupVoiceObserver();
    cleanupSwipeHandlers();
    chapterScreen.classList.remove('visible');
    chapterScreen.inert = true;
    if (menuTrigger) menuTrigger.classList.add('visible');
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} /* уходим в оглавление — хэш главы снимаем */
    setTimeout(() => {
        contentsScreen.classList.add('visible');
        contentsScreen.inert = false;
        revealContentsItems();
        scrollContentsToCurrent();
    }, 500);
}

/* выход из главы: если состояние наше — идём через history.back(),
   сам выход выполнит popstate (защита от двойного срабатывания — флаг) */
let chapterExitInProgress = false;

function exitChapterToContents() {
    const ours = history.state && history.state.echoChapter !== undefined;
    if (ours && !chapterExitInProgress) {
        chapterExitInProgress = true;
        history.back();
        return;
    }
    doExitChapterToContents();
}

window.addEventListener('popstate', () => {
    const target = (history.state && history.state.echoChapter !== undefined)
        ? history.state.echoChapter : null;
    const chapterVisible = chapterScreen.classList.contains('visible');

    if (chapterVisible) {
        if (target === currentChapter && !chapterExitInProgress) return;
        if (chapterExitInProgress || target === null) {
            doExitChapterToContents();
        } else {
            openChapter(target, { fromPop: true });
        }
    } else {
        chapterExitInProgress = false;
        // history moved onto a chapter entry while another screen is up
        // (Forward after exiting to contents) — follow it
        if (target !== null) openChapter(target, { fromPop: true });
    }
});

/* --- плашка конца главы: переход дальше или возврат к оглавлению --- */
function appendChapterEnd(textEl, index) {
    const old = textEl.querySelector('.chapter-end');
    if (old) old.remove();

    const next = nextReadableIndex(index);
    const end = document.createElement('div');
    end.className = 'chapter-end';
    end.innerHTML = '<span class="ce-rule"></span><div class="ce-note"></div><span class="ce-link"></span>';
    const note = end.querySelector('.ce-note');
    const link = end.querySelector('.ce-link');

    if (next !== -1) {
        end.classList.add('has-next');
        note.textContent = 'Глава закончена';
        link.textContent = 'Глава ' + chapters[next].number + ' →';
        link.addEventListener('click', () => openChapter(next));
    } else {
        note.textContent = 'На этом пока всё.';
        link.textContent = 'К оглавлению';
        link.addEventListener('click', exitChapterToContents);
    }
    textEl.appendChild(end);
}

/* --- экран не гаснет во время чтения --- */
let readerWakeLock = null;
let wakeLockPending = false;
let wakeLockGeneration = 0;

async function requestReaderWakeLock() {
    if (!('wakeLock' in navigator)) return;
    if (readerWakeLock || wakeLockPending) return;  // one lock, one in-flight request
    wakeLockPending = true;
    const gen = wakeLockGeneration;
    try {
        const sentinel = await navigator.wakeLock.request('screen');
        wakeLockPending = false;
        if (gen !== wakeLockGeneration || readerWakeLock) {
            // deactivated while the request was in flight — don't keep the lock
            sentinel.release().catch(() => {});
            return;
        }
        readerWakeLock = sentinel;
        sentinel.addEventListener('release', () => {
            if (readerWakeLock === sentinel) readerWakeLock = null;
        });
    } catch (err) {
        wakeLockPending = false;
    }
}

function releaseReaderWakeLock() {
    wakeLockGeneration++;   // cancels an in-flight request
    wakeLockPending = false;
    if (readerWakeLock) {
        readerWakeLock.release().catch(() => {});
        readerWakeLock = null;
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        if (chapterScreen.classList.contains('visible')) requestReaderWakeLock();
    } else {
        releaseReaderWakeLock();
    }
});

/* === SERVICE WORKER: офлайн === */
if ('serviceWorker' in navigator) {
    /* когда активировался новый service worker — перезагрузить страницу один раз,
       чтобы читатель сразу получил свежие файлы */
    /* clarification: "new" means a worker replacing one that already controlled
       this page; the very first install takes control without a reload */
    const swHadController = !!navigator.serviceWorker.controller;
    let swReloaded = false;
    let swLastReloadTs = 0;
    try {
        swLastReloadTs = Number(sessionStorage.getItem('echo_sw_reload_ts')) || 0;
        sessionStorage.removeItem('echo_sw_reload_ts');
    } catch (e) {}
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!swHadController) return;              // first install: no reload
        if (swReloaded) return;                    // at most one reload per page
        if (Date.now() - swLastReloadTs < 15000) return; // loop guard
        swReloaded = true;
        try {
            const openChapterState = history.state && history.state.echoChapter !== undefined;
            if (openChapterState) {
                // the chapter route is active (visible or opening): preserve it
                sessionStorage.setItem('echo_sw_route', JSON.stringify({
                    chapter: history.state.echoChapter, restore: true
                }));
            }
            sessionStorage.setItem('echo_sw_reload_ts', String(Date.now()));
        } catch (e) {}
        location.reload();
    });

    navigator.serviceWorker.register('sw.js').catch(() => {});
}

/* ============================================================
   ПОДЕЛИТЬСЯ ЦИТАТОЙ: плавающая кнопка у правого края -> canvas 1200x630
   ============================================================ */
(function shareQuote() {
    const chScreen = document.getElementById('chapter-screen');
    if (!chScreen) return;

    let fab = null;
    let selTimer = null;
    let sharing = false;

    const FAB_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4"/><path d="M8 8l4-4 4 4"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/></svg>';

    function getQuote() {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
        const text = sel.toString().replace(/\s+/g, ' ').trim();
        if (text.length < 12 || text.length > 600) return null;
        const node = sel.anchorNode;
        const el = node && (node.nodeType === 3 ? node.parentElement : node);
        if (!el || !el.closest('.chapter-text')) return null;
        return { text };
    }

    function hideFab() {
        if (fab) { fab.remove(); fab = null; }
    }

    function showFab() {
        if (!fab) {
            fab = document.createElement('div');
            fab.className = 'share-fab-wrap share-fab-in';
            fab.setAttribute('role', 'group');
            fab.setAttribute('aria-label', 'Поделиться цитатой');
            fab.innerHTML = '<span class="share-fab-label">Поделиться</span>' +
                '<button type="button" class="share-fab" aria-label="Поделиться цитатой">' + FAB_ICON + '</button>';
            /* тап не сбрасывает выделение до генерации карточки;
               preventDefault на touchstart гасит синтезированный click,
               поэтому на тач-устройствах действие вызываем из touchend */
            fab.addEventListener('mousedown', (e) => e.preventDefault());
            fab.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
            fab.addEventListener('touchend', (e) => { e.preventDefault(); share(); }, { passive: false });
            fab.addEventListener('click', share);
            document.body.appendChild(fab);
        }
    }

    function renderCard(quote) {
        return new Promise((resolve) => {
            const W = 1200, H = 630, M = 90;
            const CYAN = '#00A8E8';
            const cv = document.createElement('canvas');
            cv.width = W; cv.height = H;
            const ctx = cv.getContext('2d');
            ctx.textBaseline = 'top';

            /* разряженный текст (letterSpacing в canvas поддержан не везде — вручную) */
            function tracked(text, x, y, font, color, tr, alignRight) {
                ctx.font = font;
                ctx.fillStyle = color;
                const chars = [...text];
                const widths = chars.map((ch) => ctx.measureText(ch).width);
                const total = widths.reduce((a, b) => a + b, 0) + tr * (chars.length - 1);
                let cx = alignRight ? x - total : x;
                chars.forEach((ch, i) => { ctx.fillText(ch, cx, y); cx += widths[i] + tr; });
                return total;
            }

            /* фон */
            ctx.fillStyle = '#0c0c0c';
            ctx.fillRect(0, 0, W, H);

            /* верх: циановая риска + ЭХО слева, номер главы справа */
            const chNum = chapters[currentChapter] ? chapters[currentChapter].number : '';
            ctx.fillStyle = CYAN;
            ctx.fillRect(M, 84, 72, 3);
            tracked('ЭХО', M + 88, 74, '700 24px "Golos Text", sans-serif', '#c8c8c8', 6);
            tracked('ГЛАВА ' + chNum, W - M, 76, '500 22px "Golos Text", sans-serif', '#8a8a8a', 5, true);

            /* гигантская кавычка с циановым свечением */
            ctx.font = '700 210px "PT Serif", serif';
            ctx.shadowColor = 'rgba(0,168,232,0.85)';
            ctx.shadowBlur = 24;
            ctx.fillStyle = 'rgba(0,168,232,0.45)';
            ctx.fillText('“', M - 14, 108);
            ctx.shadowBlur = 0;

            /* текст цитаты: адаптивный размер, максимум 4 строки с многоточием */
            function wrapAt(px) {
                ctx.font = px + 'px "PT Serif", serif';
                const lines = [];
                let line = '';
                quote.split(' ').forEach((w) => {
                    const t = line ? line + ' ' + w : w;
                    if (ctx.measureText(t).width > W - 2 * M && line) { lines.push(line); line = w; }
                    else line = t;
                });
                if (line) lines.push(line);
                return lines;
            }
            let size = 46, lh = 70, y0 = 300;
            let lines = wrapAt(size);
            if (lines.length > 3) { size = 40; lh = 62; y0 = 272; lines = wrapAt(size); }
            if (lines.length > 4) {
                lines = lines.slice(0, 4);
                let lastLine = lines[3];
                while (lastLine.length && ctx.measureText(lastLine + ' …').width > W - 2 * M) {
                    lastLine = lastLine.slice(0, -1);
                }
                lines[3] = lastLine.trim() + ' …';
            }
            ctx.fillStyle = '#e8e5e0';
            lines.forEach((l, i) => ctx.fillText(l, M, y0 + i * lh));

            /* низ: волосяная линия, глитч-лого, автор, ссылка */
            ctx.fillStyle = '#222222';
            ctx.fillRect(M, H - 96, W - 2 * M, 1);
            ctx.font = '700 30px "Golos Text", sans-serif';
            ctx.fillStyle = 'rgba(0,168,232,0.6)';
            ctx.fillText('ЭХО', M - 2, H - 76);
            ctx.fillStyle = 'rgba(232,60,60,0.45)';
            ctx.fillText('ЭХО', M + 2, H - 76);
            const markW = tracked('ЭХО', M, H - 76, '700 30px "Golos Text", sans-serif', '#ebebeb', 4);
            ctx.font = '500 22px "Golos Text", sans-serif';
            ctx.fillStyle = '#6b6b6b';
            ctx.fillText('· Итеревский-Кочетов', M + markW + 24, H - 70);
            ctx.fillStyle = '#8a8a8a';
            const url = 'iterevsky.github.io/echo';
            ctx.fillText(url, W - M - ctx.measureText(url).width, H - 70);

            /* виньетка поверх всего */
            const vg = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 760);
            vg.addColorStop(0, 'rgba(0,0,0,0)');
            vg.addColorStop(1, 'rgba(0,0,0,0.42)');
            ctx.fillStyle = vg;
            ctx.fillRect(0, 0, W, H);

            /* сканлайны */
            ctx.fillStyle = 'rgba(0,0,0,0.14)';
            for (let yy = 0; yy < H; yy += 3) ctx.fillRect(0, yy, W, 1);

            /* зерно */
            for (let i = 0; i < 2600; i++) {
                ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)';
                ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
            }

            /* bright-pass bloom: one compositing pass, only the bright ink blooms */
            const bp = document.createElement('canvas');
            bp.width = W; bp.height = H;
            bp.getContext('2d').drawImage(cv, 0, 0);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.22;
            ctx.filter = 'contrast(2.4) brightness(0.5) blur(2.5px)';
            ctx.drawImage(bp, 0, 0);
            ctx.restore();

            /* fine phosphor triad: 3px-pitch vertical structure, very restrained */
            for (let xx = 0; xx < W; xx += 3) {
                ctx.fillStyle = 'rgba(0, 168, 232, 0.028)';
                ctx.fillRect(xx, 0, 1, H);
                ctx.fillStyle = 'rgba(196, 30, 58, 0.014)';
                ctx.fillRect(xx + 1, 0, 1, H);
            }

            cv.toBlob((blob) => resolve(blob), 'image/png');
        });
    }

    function chapterLink() {
        const ch = chapters[currentChapter];
        return 'https://iterevsky.github.io/echo/#ch-' + (ch ? ch.number : '');
    }

    function shareCaption(text) {
        let teaser = text;
        if (teaser.length > 140) {
            teaser = teaser.slice(0, 140);
            teaser = teaser.slice(0, teaser.lastIndexOf(' ')) + '…';
        }
        const num = chapters[currentChapter] ? chapters[currentChapter].number : '';
        return '«' + teaser + '»\n— ЭХО, глава ' + num + '. Читать целиком: ' + chapterLink();
    }

    async function share() {
        if (sharing) return;
        const q = getQuote();
        hideFab();
        if (!q) return;
        sharing = true;
        try {
            await document.fonts.ready; /* шрифты карточки точно загружены */
            const blob = await renderCard(q.text);
            const file = new File([blob], 'echo-quote.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({ files: [file], text: shareCaption(q.text), title: 'ЭХО' });
                } catch (err) {
                    if (err && err.name === 'AbortError') throw err; /* пользователь отменил — молчим */
                    await navigator.share({ files: [file], title: 'ЭХО' }); /* комбо не поддержано — только файл */
                }
            } else {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'echo-quote.png';
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 5000);
                try { await navigator.clipboard.writeText(shareCaption(q.text)); } catch (e) {}
            }
        } catch (err) {}
        sharing = false;
    }

    document.addEventListener('selectionchange', () => {
        clearTimeout(selTimer);
        selTimer = setTimeout(() => {
            if (!chScreen.classList.contains('visible')) { hideFab(); return; }
            const q = getQuote();
            if (q) showFab(); else hideFab();
        }, 350);
    });

    chScreen.addEventListener('scroll', hideFab, { passive: true });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideFab(); });

    /* открытие любого оверлея прячет кнопку явно */
    document.addEventListener('click', (e) => {
        if (!fab) return;
        if (e.target.closest('#menu-trigger, #menu-overlay, .photo-link, #photo-overlay, .nav-aa, #reader-sheet, #reader-sheet-backdrop, #install-trigger, #install-overlay')) {
            hideFab();
        }
    }, true);
})();


function coverSurgeHook() {
    /* W-8 integration point: emit the water impulse burst on SURGE. */
    if (coverScreen.__waterSurge) coverScreen.__waterSurge();
}

(function coverIdleRhythm() {
    if (!coverScreen || isStarted) return;
    const img = coverScreen.querySelector('img');
    const tremor = coverScreen.querySelector('.cover-tremor');
    if (!img || !tremor) return;
    const entryEvents = ['touchstart', 'mousedown', 'keydown', 'click'];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const hint = document.createElement('div');
        hint.className = 'cover-idle-static';
        hint.setAttribute('role', 'note');
        hint.textContent = 'Коснитесь, чтобы войти';
        coverScreen.appendChild(hint);
        entryEvents.forEach((eventName) => {
            document.addEventListener(eventName, () => hint.remove(), { once: true, passive: true });
        });
        return;
    }

    const ring = document.createElement('div');
    ring.className = 'cover-beckon-ring';
    ring.setAttribute('aria-hidden', 'true');
    ring.innerHTML = '<i></i><i></i>';
    coverScreen.appendChild(ring);

    let phase = 'IDLE';
    let timer = null;
    let tremorAnimation = null;
    let stopped = false;
    const ringObserver = new ResizeObserver(positionRing);

    function positionRing() {
        const rect = img.getBoundingClientRect();
        const size = Math.max(76, Math.min(132, Math.min(rect.width, rect.height) * 0.18));
        ring.style.width = size + 'px';
        ring.style.height = size + 'px';
        ring.style.left = (rect.left + rect.width / 2 - size / 2) + 'px';
        ring.style.top = (rect.top + rect.height * 0.43 - size / 2) + 'px';
    }

    function cancelSurge() {
        if (tremorAnimation) {
            tremorAnimation.cancel();
            tremorAnimation = null;
        }
        coverScreen.classList.remove('surge');
        ring.classList.remove('visible');
    }

    function schedulePhase() {
        if (stopped || document.hidden) return;
        const delay = phase === 'IDLE' ? 8000 : phase === 'SURGE' ? 3000 : 12000;
        timer = setTimeout(() => {
            if (phase === 'IDLE') enterPhase('SURGE');
            else if (phase === 'SURGE') enterPhase('LULL');
            else enterPhase('IDLE');
        }, delay);
    }

    function enterPhase(next) {
        if (stopped) return;
        clearTimeout(timer);
        timer = null;
        phase = next;
        coverScreen.dataset.idlePhase = phase;
        coverScreen.classList.toggle('lull', phase === 'LULL');
        cancelSurge();
        if (phase === 'SURGE') {
            positionRing();
            coverScreen.classList.add('surge');
            ring.classList.add('visible');
            const frames = Array.from({ length: 24 }, () => ({
                transform: `translate(${(Math.random() * 1.5 - 0.75).toFixed(2)}px, ${(Math.random() * 1.5 - 0.75).toFixed(2)}px)`,
                easing: 'steps(1, jump-start)'
            }));
            frames.push({ transform: 'translate(0, 0)', easing: 'steps(1, jump-start)' });
            tremorAnimation = tremor.animate(frames, { duration: 3000 });
            coverSurgeHook();
        }
        schedulePhase();
    }

    function stopRhythm() {
        stopped = true;
        clearTimeout(timer);
        timer = null;
        cancelSurge();
        coverScreen.classList.remove('lull');
        delete coverScreen.dataset.idlePhase;
        ringObserver.disconnect();
        ring.remove();
    }

    function rearmOnVisibility() {
        if (stopped) return;
        clearTimeout(timer);
        timer = null;
        cancelSurge();
        coverScreen.classList.remove('lull');
        phase = 'IDLE';
        coverScreen.dataset.idlePhase = phase;
        if (!document.hidden) {
            positionRing();
            enterPhase('IDLE');
        }
    }

    positionRing();
    enterPhase('IDLE');
    img.addEventListener('load', positionRing);
    ringObserver.observe(img);
    window.addEventListener('resize', positionRing);
    window.addEventListener('orientationchange', positionRing);
    document.addEventListener('visibilitychange', rearmOnVisibility);
    entryEvents.forEach((eventName) => {
        document.addEventListener(eventName, stopRhythm, { once: true, passive: true });
    });
})();

/* focus containment hooks — registered last, after every overlay exists */
[menuOverlay, installOverlay, photoOverlay, document.getElementById('reader-sheet'), document.getElementById('progress-overlay')].forEach((ov) => {
    if (ov) ov.addEventListener('keydown', (e) => trapTab(ov, e));
});


(function initWaterCover() {
    const canvas = document.getElementById('water-cover');
    if (!coverScreen || !canvas || isStarted) return;
    const saved = loadState();
    if (saved.lastChapter !== undefined || /[?&]ch=/.test(location.search) || /^#ch-\d+$/.test(location.hash)) return;
    try {
        if (sessionStorage.getItem('echo_sw_route')) return;
    } catch (error) {}

    let state = 'idle';
    let view = null;
    let waterPromise = null;
    let covered = false;
    let pendingImpulse = null;
    let entryAttempt = 0;
    const pointers = new Map();
    const gestureLog = [];
    const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
    coverScreen.__waterLog = gestureLog;
    coverScreen.__waterMetrics = () => view ? view.getMetrics() : null;
    coverScreen.__waterState = () => ({
        state,
        covered,
        pendingImpulse,
        entryAttempt,
        promiseCached: Boolean(waterPromise),
        scriptCount: document.querySelectorAll('script[src="ascii-water.js"]').length,
        cellPx: view ? view.cellPx : null
    });

    function record(step, details) {
        gestureLog.push(Object.assign({ step, at: performance.now() }, details || {}));
        if (gestureLog.length > 120) gestureLog.shift();
    }

    function toGrid(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const cellWidth = view ? view.cellWidth : 12;
        const cellHeight = view ? view.cellHeight : 12;
        const cols = view ? view.cols : Math.max(1, Math.floor(rect.width / 12));
        const rows = view ? view.rows : Math.max(1, Math.floor(rect.height / 12));
        const cssX = clamp(clientX - rect.left, 0, rect.width);
        const cssY = clamp(clientY - rect.top, 0, rect.height);
        return {
            x: clamp(cssX / cellWidth, 0, cols - 1),
            y: clamp(cssY / cellHeight, 0, rows - 1),
            normalizedX: rect.width ? cssX / rect.width : 0,
            normalizedY: rect.height ? cssY / rect.height : 0
        };
    }

    function failWater(error, script) {
        script.remove();
        state = 'failed';
        pendingImpulse = null;
        waterPromise = null;
        if (view) {
            view.destroy();
            view = null;
        } else if (window.__echoWater) {
            window.__echoWater.destroy();
        }
        record('load-error', { message: error.message });
    }

    function ensureWater(trigger) {
        if (covered || state === 'failed') return null;
        if (view) return Promise.resolve(view);
        if (waterPromise) return waterPromise;
        state = 'loading';
        record('load-start', { trigger });
        const script = document.createElement('script');
        script.async = true;
        script.src = 'ascii-water.js';
        const current = new Promise((resolve, reject) => {
            script.onload = () => {
                if (covered) {
                    pendingImpulse = null;
                    record('discard-late');
                    resolve(null);
                    return;
                }
                try {
                    if (!window.__echoWater || typeof window.__echoWater.init !== 'function') throw new Error('water module did not initialize');
                    view = window.__echoWater.init(canvas);
                    state = 'ready';
                    record('ready');
                    if (pendingImpulse) {
                        const impulse = pendingImpulse;
                        pendingImpulse = null;
                        window.__echoWater.drop(impulse.x, impulse.y, impulse.strength);
                        record('queued-flush', impulse);
                    }
                    resolve(view);
                } catch (error) {
                    failWater(error, script);
                    reject(error);
                }
            };
            script.onerror = () => {
                const error = new Error('water module request failed');
                failWater(error, script);
                reject(error);
            };
            document.head.appendChild(script);
        });
        waterPromise = current.catch(() => null);
        return waterPromise;
    }

    function emit(mapping, point, strength, pointerType, pointerId) {
        if (state === 'ready' && view) {
            window.__echoWater.drop(point.x, point.y, strength);
            record(mapping, { x: point.x, y: point.y, strength, pointerType, pointerId });
        } else {
            record('impulse-discarded', { mapping, x: point.x, y: point.y, strength, pointerType, pointerId });
        }
    }

    function enterWithWater(clientX, clientY, strength, pointerType, pointerId) {
        if (isStarted) return;
        const point = toGrid(clientX, clientY);
        record('coordinates', { x: point.x, y: point.y, normalizedX: point.normalizedX, normalizedY: point.normalizedY, pointerType, pointerId });
        const impulse = { x: point.x, y: point.y, strength, pointerType, pointerId, entryAttempt: ++entryAttempt };
        if (state === 'ready' && view) {
            window.__echoWater.drop(point.x, point.y, strength);
            record('impulse', impulse);
        } else if (state !== 'failed' && !covered) {
            pendingImpulse = impulse;
            record('queued-impulse', impulse);
            ensureWater('entry');
        } else {
            record('impulse-discarded', impulse);
        }
        startSequence();
    }

    function pointerDown(event) {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        if (pointers.has(event.pointerId)) pointers.delete(event.pointerId);
        if (pointers.size >= 3) {
            record('cap-reject', { pointerId: event.pointerId, pointerType: event.pointerType });
            return;
        }
        ensureWater('pointer-intent');
        pointers.set(event.pointerId, {
            id: event.pointerId,
            pointerType: event.pointerType,
            state: 'pending',
            startTime: event.timeStamp,
            startX: event.clientX,
            startY: event.clientY,
            lastTime: event.timeStamp,
            lastX: event.clientX,
            lastY: event.clientY,
            lastImpulse: -Infinity
        });
        try { canvas.setPointerCapture(event.pointerId); } catch (error) { /* Synthetic verification events may not own capture. */ }
        record('pending', { pointerId: event.pointerId, pointerType: event.pointerType });
    }

    function pointerMove(event) {
        const pointer = pointers.get(event.pointerId);
        if (!pointer) {
            if (event.pointerType === 'mouse' && event.buttons === 0) {
                if (event.timeStamp - pointerMove.lastHover < 40) return;
                const previousTime = pointerMove.hoverTime === undefined ? event.timeStamp - 16 : pointerMove.hoverTime;
                const previousX = pointerMove.hoverX === undefined ? event.clientX : pointerMove.hoverX;
                const previousY = pointerMove.hoverY === undefined ? event.clientY : pointerMove.hoverY;
                const seconds = Math.max(0.001, (event.timeStamp - previousTime) / 1000);
                const velocity = clamp(Math.hypot(event.clientX - previousX, event.clientY - previousY) / seconds, 0, 4000);
                const strength = clamp(0.035 + velocity / 2500 * 0.045, 0.035, 0.08);
                emit('mouse-hover', toGrid(event.clientX, event.clientY), strength, 'mouse', event.pointerId);
                pointerMove.lastHover = event.timeStamp;
                pointerMove.hoverTime = event.timeStamp;
                pointerMove.hoverX = event.clientX;
                pointerMove.hoverY = event.clientY;
            }
            return;
        }
        const distance = Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY);
        if (pointer.state === 'pending' && distance >= 8) pointer.state = 'drag';
        const seconds = Math.max(0.001, (event.timeStamp - pointer.lastTime) / 1000);
        const velocity = clamp(Math.hypot(event.clientX - pointer.lastX, event.clientY - pointer.lastY) / seconds, 0, 4000);
        pointer.lastTime = event.timeStamp;
        pointer.lastX = event.clientX;
        pointer.lastY = event.clientY;
        if (pointer.state !== 'drag' || event.timeStamp - pointer.lastImpulse < 24) return;
        const strength = clamp(0.12 + velocity / 2000 * 0.53, 0.12, 0.65);
        emit(pointer.pointerType + '-drag', toGrid(event.clientX, event.clientY), strength, pointer.pointerType, event.pointerId);
        pointer.lastImpulse = event.timeStamp;
    }

    function pointerUp(event) {
        const pointer = pointers.get(event.pointerId);
        if (!pointer) return;
        const duration = event.timeStamp - pointer.startTime;
        const distance = Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY);
        if (pointer.state === 'pending' && distance >= 8) pointer.state = 'drag';
        if (pointer.state === 'pending' && distance < 8 && duration < 250) {
            record('tap-classified', { pointerId: pointer.id, pointerType: pointer.pointerType, duration });
            enterWithWater(pointer.startX, pointer.startY, pointer.pointerType === 'mouse' ? 1.1 : 0.65, pointer.pointerType, pointer.id);
        } else {
            record(pointer.state === 'drag' ? 'drag-end' : 'long-press-end', { pointerId: pointer.id, pointerType: pointer.pointerType });
        }
        pointers.delete(event.pointerId);
        try { canvas.releasePointerCapture(event.pointerId); } catch (error) { /* Capture may already be released. */ }
    }

    function cancelPointer(event) {
        if (!pointers.has(event.pointerId)) return;
        pointers.delete(event.pointerId);
        record(event.type === 'lostpointercapture' ? 'lostpointercapture' : 'pointercancel', { pointerId: event.pointerId });
    }

    function cancelAll() {
        for (const id of pointers.keys()) record('blur-cancel', { pointerId: id });
        pointers.clear();
    }

    function finishCover(event) {
        if (covered || event.target !== coverScreen || event.propertyName !== 'transform' || !coverScreen.classList.contains('hide-up')) return;
        covered = true;
        pendingImpulse = null;
        state = 'covered';
        record('freeze');
        if (view) view.freeze();
        if (window.__echoWater) window.__echoWater.destroy();
        state = 'destroyed';
        record('destroy');
    }

    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', cancelPointer);
    canvas.addEventListener('lostpointercapture', cancelPointer);
    canvas.addEventListener('keydown', event => {
        if (event.repeat || event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        enterWithWater(rect.left + rect.width / 2, rect.top + rect.height / 2, 0.65, 'keyboard', 'keyboard');
    });
    window.addEventListener('blur', cancelAll);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAll(); });
    coverScreen.addEventListener('echo:entry-start', () => {
        state = 'entering';
        record('entry-start');
        setTimeout(() => finishCover({ target: coverScreen, propertyName: 'transform' }), 1050);
    });
    coverScreen.addEventListener('transitionend', finishCover);
    coverScreen.__waterRetry = () => {
        if (covered || isStarted) return null;
        state = 'idle';
        return ensureWater('deliberate-retry');
    };
    coverScreen.__waterSurge = () => {
        if (state !== 'ready' || !view) return;
        window.__echoWater.drop(view.cols * 0.5, view.rows * 0.68, 0.65);
        record('surge', { x: view.cols * 0.5, y: view.rows * 0.68, strength: 0.65 });
    };
    const schedule = window.requestIdleCallback || (callback => setTimeout(callback, 250));
    schedule(() => ensureWater('idle'), { timeout: 250 });
})();
