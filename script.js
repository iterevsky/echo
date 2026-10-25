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
let touchStartX = 0;

const menuTrigger = document.getElementById('menu-trigger');
const menuOverlay = document.getElementById('menu-overlay');
const menuClose = document.getElementById('menu-close');

let isMenuOpen = false;

let currentChapter = 0;

/* состояние читательской панели (setBarHidden может вызываться на этапе загрузки) */
let barHidden = false;
let barLastScroll = 0;
let readPosTimer = null;
let readerGeneration = 0;  // bumped on every chapter open/exit; stale writes check it

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

function normalizeSeenNew(obj) {
    const out = {};
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return out;
    Object.keys(obj).forEach((k) => {
        if (!/^\d+$/.test(k)) return;
        if (obj[k]) out[parseInt(k, 10)] = true;
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

function sanitizeDateString(v) {
    if (typeof v !== 'string') return undefined;
    return isNaN(new Date(v).getTime()) ? undefined : v;
}

/* чистим известные поля, неизвестные поля и их порядок не трогаем */
function sanitizeState(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const s = Object.assign({}, parsed);
    if ('readPos' in s) s.readPos = normalizeChapterMap(s.readPos, true);
    if ('seenNew' in s) s.seenNew = normalizeSeenNew(s.seenNew);
    if ('readerSettings' in s) {
        const rs = sanitizeReaderSettings(s.readerSettings);
        if (rs) s.readerSettings = rs; else delete s.readerSettings;
    }
    if ('lastChapter' in s) {
        const n = Number(s.lastChapter);
        if (!isFinite(n) || n < 0 || Math.floor(n) !== n) delete s.lastChapter;
        else s.lastChapter = n;
    }
    ['lastVisit', 'prevVisit'].forEach((k) => {
        if (k in s) {
            const d = sanitizeDateString(s[k]);
            if (d === undefined) delete s[k]; else s[k] = d;
        }
    });
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

/* --- ротация визитов: если с прошлого захода больше 12 часов,
   lastVisit становится prevVisit — до того, как его перезапишет openChapter --- */
(function rotateVisits() {
    const s = loadState();
    if (!s.lastVisit) return;
    const age = Date.now() - new Date(s.lastVisit).getTime();
    if (age > 12 * 3600 * 1000) {
        saveState({ prevVisit: s.lastVisit });
    }
})();

// === ПОСТРОЕНИЕ МАССИВА ГЛАВ ИЗ HTML ===
const items = document.querySelectorAll('.contents-item');
const chapters = Array.from(items).map((item, index) => {
    const num = String(index + 1).padStart(2, '0');
    const raw = item.textContent.trim();
    const title = raw.replace(/^\d+\s*[•\s]*/, '').trim();
    const rawText = chapterTexts[index];
    const text = rawText || `<p class="placeholder">Глава в процессе написания…</p>`;
    return { number: num, title, text, empty: !rawText };
});

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
    const seenNew = s.seenNew || {};
    const prevVisit = s.prevVisit || null;

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

    document.querySelectorAll('.contents-item').forEach((item) => {
        const i = parseInt(item.dataset.chapter, 10);
        if (isNaN(i)) return;

        const frac = readPos[i];
        const isEmpty = !!(chapters[i] && chapters[i].empty);
        const isRead = !isEmpty && (typeof frac === 'number') && frac >= 0.85;
        const isCurrent = (i === last) && !isRead && !isEmpty;
        // «новое»: глава вышла после прошлого визита и ещё не открывалась
        const isNew = !isEmpty && !isRead && !seenNew[i] && !!prevVisit &&
            typeof PUBLISHED_AT !== 'undefined' && !!PUBLISHED_AT[i] &&
            new Date(PUBLISHED_AT[i]).getTime() > new Date(prevVisit).getTime();

        item.classList.toggle('read', isRead);
        item.classList.toggle('current', isCurrent);
        item.classList.toggle('empty', isEmpty);
        item.classList.toggle('new', isNew);

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

if (!handleDeepLink() && !handleHashLink()) initProgress();

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

// === КЛАВИАТУРА ===
document.addEventListener('keydown', (e) => {
    // сначала — закрытие оверлеев в порядке приоритета, независимо от видимого экрана
    if (e.key === 'Escape') {
        e.preventDefault();
        if (installOverlay && installOverlay.classList.contains('visible')) { closeInstall(); return; }
        if (photoOverlay && photoOverlay.classList.contains('active')) { closePhoto(); return; }
        if (isMenuOpen) { closeMenu(); return; }
        if (isReaderSheetOpen()) { toggleReaderSheet(false); return; }
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

// === ИНТРО: КАСАНИЕ / КЛИК / СВАЙП ===
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const diffY = touchStartY - e.changedTouches[0].clientY;
    const diffX = touchStartX - e.changedTouches[0].clientX;
    
    if (!isStarted && diffY > 50 && Math.abs(diffX) < 40) {
        startSequence();
    }
    
    // Свайп справа налево в главе — открыть меню
    if (chapterScreen.classList.contains('visible') 
        && Math.abs(diffX) > Math.abs(diffY) * 1.8 
        && diffX > 70 
        && touchStartX > window.innerWidth * 0.82) {
        openMenu();
    }
}, { passive: true });



document.addEventListener('click', () => {
    if (!isStarted) startSequence();
});

// === ФУНКЦИИ ===

function startSequence() {
    if (isStarted) return;
    isStarted = true;
    startFilmPreload();

    // 1. Убираем картинку
    coverScreen.classList.add('hide-up');

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
    // Буквы растают
    titleScreen.classList.add('melting');

    setTimeout(() => {
        titleScreen.classList.remove('visible');
        titleScreen.classList.remove('melting');

        // Показываем оглавление
        setTimeout(() => {
            contentsScreen.classList.add('visible');
            if (menuTrigger) menuTrigger.classList.add('visible');
            scrollContentsToCurrent();
            revealContentsItems();
        }, 300);

    }, 1200);
}

function openChapter(index, opts = {}) {
    if (index < 0 || index >= chapters.length) return;
    if (chapters[index].empty) return;
    // invalidate any pending position write from the previous chapter
    readerGeneration++;
    clearTimeout(readPosTimer);
    readPosTimer = null;
    const tearOverlay = document.getElementById('tear-overlay');
    const chScreen = document.getElementById('chapter-screen');
    if (tearOverlay && chScreen) {
        tearOverlay.style.display = 'block';
        tearOverlay.querySelector('.tear-top').style.animation = 'tear-top-shift 0.12s steps(1) forwards';
        tearOverlay.querySelector('.tear-bottom').style.animation = 'tear-bottom-shift 0.12s steps(1) forwards';
        tearOverlay.querySelector('.tear-line').style.animation = 'tear-line-fly 0.1s linear forwards';
        chScreen.classList.add('tear-flash');

        setTimeout(() => {
            chScreen.classList.remove('tear-flash');
            tearOverlay.style.display = 'none';
            tearOverlay.querySelectorAll('*').forEach(el => el.style.animation = '');
        }, 150);
    }

    resetSwipeHint();
    setBarHidden(false);

    // ушли «вперёд» из открытой главы — она считается прочитанной
    if (chapterScreen.classList.contains('visible') && index > currentChapter) {
        const sFwd = loadState();
        const posFwd = sFwd.readPos || {};
        if ((posFwd[currentChapter] || 0) < 0.85) {
            posFwd[currentChapter] = 1;
            saveState({ readPos: posFwd });
        }
    }

    // глава с бейджем «новое» увидена — метка гаснет
    const sSeen = loadState();
    if (sSeen.prevVisit && typeof PUBLISHED_AT !== 'undefined' && PUBLISHED_AT[index] &&
        new Date(PUBLISHED_AT[index]).getTime() > new Date(sSeen.prevVisit).getTime()) {
        const seen = sSeen.seenNew || {};
        seen[index] = true;
        saveState({ seenNew: seen });
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
        // Парсим {{PHOTO:слово:файл}} и {{VOICE}}
    let processedText = chapter.text
      .replace(
        /\{\{PHOTO:([^:]+):([^}]+)\}\}/g,
        '<span class="photo-link" data-photo="$2">$1</span>'
      )
      .replace(
        /{{VOICE(?::(\w+))?}}(.*?){{\/VOICE}}/g,
        (match, mode, text) => {
          const voiceMode = mode || 'aggressive';
          return `<span class="voice-glitch" data-voice-mode="${voiceMode}">${text}</span>`;
        }
      );

    textEl.innerHTML = processedText;
    appendChapterEnd(textEl, index);

   saveState({ lastChapter: index, lastVisit: new Date().toISOString(), chapterTitle: chapter.title });


    prevBtn.classList.toggle('inactive', prevReadableIndex(index) === -1);
    nextBtn.classList.toggle('inactive', nextReadableIndex(index) === -1);

    contentsScreen.classList.remove('visible');
    if (menuTrigger) menuTrigger.classList.remove('visible');


    setTimeout(() => {
        chapterScreen.classList.add('visible');
        chapterScreen.scrollTop = 0;
        if (opts.restore) {
            const restorePos = () => {
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
                    requestAnimationFrame(() => requestAnimationFrame(restorePos));
                });
            } else {
                setTimeout(restorePos, 300);
            }
        }
        initVoiceObserver();
        requestReaderWakeLock();
    }, 300);
    setTimeout(updateChapterProgress, 350);
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

function openPhoto(src) {
  photoImage.src = 'images/' + src;
  photoOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePhoto() {
  photoOverlay.classList.remove('active');
  document.body.style.overflow = '';
  photoImage.src = '';
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

            item.classList.add('electric-glitch');

            // Убираем эффект после окончания анимации
            setTimeout(() => {
                item.classList.remove('electric-glitch');
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

function generateAggressiveGlitch(el) {
    const chapterScreen = document.getElementById('chapter-screen');

    if (chapterScreen) {
        chapterScreen.classList.add('xray-flash');
    }

    setTimeout(() => {
        if (chapterScreen) {
            chapterScreen.classList.remove('xray-flash');
        }

        const text = prepareVoiceElement(el);
        const animId = 'voice-glitch-' + Math.random().toString(36).substr(2, 9);
        const duration = (2.4 + Math.random() * 2.6).toFixed(2);
        const steps = 16;

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

        const c1 = '#c41e3a';
        const c2 = '#00A8E8';
        let baseFrames = '';
        let redFrames = '';
        let cyanFrames = '';
        let slice1Frames = '';
        let slice2Frames = '';

        for (let i = 0; i <= steps; i++) {
            const pct = Math.round((i / steps) * 100);

            const tx = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3 + 1);
            const ty = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);
            const sk = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4 + 1);
            const op = (0.5 + Math.random() * 0.5).toFixed(2);
            const br = (0.6 + Math.random() * 0.8).toFixed(2);
            const hasShadow = Math.random() > 0.25;
            const ts = hasShadow
                ? `${Math.floor(Math.random()*3+1)}px 0 ${c1}, -${Math.floor(Math.random()*3+1)}px 0 ${c2}`
                : 'none';
            baseFrames += `            ${pct}% { transform: translate(${tx}px, ${ty}px) skewX(${sk}deg); opacity: ${op}; text-shadow: ${ts}; filter: brightness(${br}); }\n`;

            const redClip = Math.random() > 0.35
                ? `inset(${Math.floor(Math.random()*70)}% 0 ${Math.floor(Math.random()*70)}% 0)`
                : 'inset(0 0 0 0)';
            const redTx = -2 - Math.floor(Math.random() * 5);
            const redOp = Math.random() > 0.45 ? (0.4 + Math.random() * 0.6).toFixed(2) : 0;
            redFrames += `            ${pct}% { opacity: ${redOp}; clip-path: ${redClip}; transform: translateX(${redTx}px); }\n`;

            const cyanClip = Math.random() > 0.35
                ? `inset(${Math.floor(Math.random()*70)}% 0 ${Math.floor(Math.random()*70)}% 0)`
                : 'inset(0 0 0 0)';
            const cyanTx = 2 + Math.floor(Math.random() * 5);
            const cyanOp = Math.random() > 0.45 ? (0.4 + Math.random() * 0.6).toFixed(2) : 0;
            cyanFrames += `            ${pct}% { opacity: ${cyanOp}; clip-path: ${cyanClip}; transform: translateX(${cyanTx}px); }\n`;

            const slice1Clip = `inset(${Math.floor(Math.random()*80)}% 0 ${Math.floor(Math.random()*10)}% 0)`;
            const slice1Tx = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5 + 2);
            const slice1Op = Math.random() > 0.5 ? (0.3 + Math.random() * 0.5).toFixed(2) : 0;
            slice1Frames += `            ${pct}% { opacity: ${slice1Op}; clip-path: ${slice1Clip}; transform: translateX(${slice1Tx}px); }\n`;

            const slice2Clip = `inset(${Math.floor(Math.random()*10)}% 0 ${Math.floor(Math.random()*80)}% 0)`;
            const slice2Tx = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5 + 2);
            const slice2Op = Math.random() > 0.5 ? (0.3 + Math.random() * 0.5).toFixed(2) : 0;
            slice2Frames += `            ${pct}% { opacity: ${slice2Op}; clip-path: ${slice2Clip}; transform: translateX(${slice2Tx}px); }\n`;
        }

        const keyframes = `
            @keyframes ${animId} { ${baseFrames} }
            @keyframes ${animId}-red { ${redFrames} }
            @keyframes ${animId}-cyan { ${cyanFrames} }
            @keyframes ${animId}-slice1 { ${slice1Frames} }
            @keyframes ${animId}-slice2 { ${slice2Frames} }
        `;

        const style = document.createElement('style');
        style.textContent = keyframes;
        style.dataset.voiceGlitch = animId;
        document.head.appendChild(style);

        base.style.animation = `${animId} ${duration}s steps(1) forwards`;
        red.style.animation = `${animId}-red ${duration}s steps(1) forwards`;
        cyan.style.animation = `${animId}-cyan ${duration}s steps(1) forwards`;
        slice1.style.animation = `${animId}-slice1 ${duration}s steps(1) forwards`;
        slice2.style.animation = `${animId}-slice2 ${duration}s steps(1) forwards`;

        // Ударная волна
        const parentP = el.closest('p');
        if (parentP) {
            const prev = parentP.previousElementSibling;
            const next = parentP.nextElementSibling;
            if (prev && prev.tagName === 'P') {
                prev.classList.add('voice-shock-prev');
                setTimeout(() => prev.classList.remove('voice-shock-prev'), 700);
            }
            if (next && next.tagName === 'P') {
                next.classList.add('voice-shock-next');
                setTimeout(() => next.classList.remove('voice-shock-next'), 700);
            }
        }

        // Вибрация
        if (navigator.vibrate) {
            navigator.vibrate([30, 60, 30]);
        }

        setTimeout(() => {
            base.style.animation = '';
            red.style.animation = '';
            cyan.style.animation = '';
            slice1.style.animation = '';
            slice2.style.animation = '';
            if (style.parentNode) style.remove();
        }, parseFloat(duration) * 1000);
    }, 70);
}

function generateStandardGlitch(el) {
    const text = prepareVoiceElement(el);
    const animId = 'voice-standard-' + Math.random().toString(36).substr(2, 9);
    const duration = (2.4 + Math.random() * 2.6).toFixed(2);
    const steps = 12;
    
    const base = document.createElement('span');
    base.className = 'voice-base';
    base.textContent = text;
    el.appendChild(base);
    
    let frames = '';
    for (let i = 0; i <= steps; i++) {
        const pct = Math.round((i / steps) * 100);
        const hasShadow = Math.random() > 0.4;
        const ts = hasShadow
            ? `${Math.floor(Math.random()*2+1)}px 0 #c41e3a, -${Math.floor(Math.random()*2+1)}px 0 #00A8E8`
            : 'none';
        const op = (0.85 + Math.random() * 0.15).toFixed(2);
        frames += `            ${pct}% { text-shadow: ${ts}; opacity: ${op}; }\n`;
    }
    
    const keyframes = `@keyframes ${animId} {\n${frames}        }`;
    
    const style = document.createElement('style');
    style.textContent = keyframes;
    style.dataset.voiceGlitch = animId;
    document.head.appendChild(style);
    
    base.style.animation = `${animId} ${duration}s steps(1) forwards`;
    
    setTimeout(() => {
        base.style.animation = '';
        if (style.parentNode) style.remove();
    }, parseFloat(duration) * 1000);
}

function generateWhisperGlitch(el) {
    const text = prepareVoiceElement(el);
    const animId = 'voice-whisper-' + Math.random().toString(36).substr(2, 9);
    const duration = (3.0 + Math.random() * 2.0).toFixed(2);
    const steps = 14;
    
    const base = document.createElement('span');
    base.className = 'voice-base';
    base.textContent = text;
    el.appendChild(base);
    
    let frames = '';
    for (let i = 0; i <= steps; i++) {
        const pct = Math.round((i / steps) * 100);
        const op = (0.15 + Math.random() * 0.5).toFixed(2);
        const tx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5).toFixed(2);
        const sx = (1.01 + Math.random() * 0.02).toFixed(3);
        const bl = (Math.random() * 1.0).toFixed(2);
        const br = (0.9 + Math.random() * 0.25).toFixed(2);
        frames += `            ${pct}% { transform: translateX(${tx}px) scaleX(${sx}); opacity: ${op}; filter: blur(${bl}px) brightness(${br}); }\n`;
    }
    
    const keyframes = `@keyframes ${animId} {\n${frames}        }`;
    
    const style = document.createElement('style');
    style.textContent = keyframes;
    style.dataset.voiceGlitch = animId;
    document.head.appendChild(style);
    
    base.style.animation = `${animId} ${duration}s ease-in-out forwards`;
    
    setTimeout(() => {
        base.style.animation = '';
        if (style.parentNode) style.remove();
    }, parseFloat(duration) * 1000);
}


function generateGlitchAnimation(el) {
    const mode = el.dataset.voiceMode || 'aggressive';
    
    switch (mode) {
        case 'standard':
            generateStandardGlitch(el);
            break;
        case 'whisper':
            generateWhisperGlitch(el);
            break;
        default:
            generateAggressiveGlitch(el);
    }
}

function initVoiceObserver() {
    if (voiceObserver) voiceObserver.disconnect();
    
    const chapterScreen = document.getElementById('chapter-screen');
    if (!chapterScreen) return;
    
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
    if (contentsScreen.classList.contains('visible')) {
        contentsScreen.classList.add('menu-dimmed');
    }
    if (chapterScreen.classList.contains('visible')) {
        chapterScreen.classList.add('menu-dimmed');
    }
    if (menuTrigger) menuTrigger.classList.remove('visible');
}

function closeMenu() {
    if (!isMenuOpen) return;
    isMenuOpen = false;
    menuOverlay.classList.remove('open');
    contentsScreen.classList.remove('menu-dimmed');
    chapterScreen.classList.remove('menu-dimmed');
    if (contentsScreen.classList.contains('visible') && menuTrigger) {
        menuTrigger.classList.add('visible');
    }
}

function toggleMenu() {
    isMenuOpen ? closeMenu() : openMenu();
}

if (menuTrigger) menuTrigger.addEventListener('click', toggleMenu);
if (menuClose) menuClose.addEventListener('click', closeMenu);

/* === КОПИРОВАНИЕ НОМЕРА КАРТЫ === */
function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'Скопировано';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('copied');
            }, 2000);
        }
    } catch (err) {}
    document.body.removeChild(ta);
}

function copyCard(targetId, btn) {
    const cardEl = document.getElementById(targetId);
    if (!cardEl || !btn) return;
    const text = cardEl.textContent.trim();

    const onSuccess = () => {
        const originalText = btn.textContent;
        btn.textContent = 'Скопировано';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
            fallbackCopy(text, btn);
        });
    } else {
        fallbackCopy(text, btn);
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
    document.body.classList.add('install-open');
}

function closeInstall() {
    installOverlay.classList.remove('visible');
    document.body.classList.remove('install-open');
}

if (installTrigger) installTrigger.addEventListener('click', openInstall);
if (installTrigger && typeof menuTrigger !== 'undefined' && menuTrigger) {
    installTrigger.classList.toggle('visible', menuTrigger.classList.contains('visible'));
    new MutationObserver(() => {
        installTrigger.classList.toggle('visible', menuTrigger.classList.contains('visible'));
    }).observe(menuTrigger, { attributes: true, attributeFilter: ['class'] });
}
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
        openPhoto(filename);
      }
    }
  }, 150);
}, { passive: false });

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
function handleDeepLink() {
    const m = /[?&]ch=(\d+)/.exec(location.search);
    if (!m) return false;
    const idx = parseInt(m[1], 10);
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    hideIntroScreens();
    updateContentsMemory();

    if (isNaN(idx) || idx < 0 || idx >= chapters.length || chapters[idx].empty) {
        openContentsFresh();
        return true;
    }
    openChapter(idx);
    return true;
}

/* ссылка вида #ch-12: внешний переход (history.state пуст) — открыть главу сразу.
   Перезагрузка внутри сессии (history.state уже наш) — НЕ перехватываем:
   отдаём ход initProgress(), чтобы показать «Продолжить / Начать сначала» */
function handleHashLink() {
    const m = (location.hash || '').match(/^#ch-(\d+)$/);
    if (!m) return false;
    if (history.state && history.state.echoChapter !== undefined) return false;
    const idx = chapters.findIndex((c) => String(c.number) === m[1]);
    if (idx < 0 || chapters[idx].empty) return false; /* пустые главы («в работе») не открываем */
    hideIntroScreens(); /* новый читатель по ссылке — без заставки */
    openChapter(idx);
    return true;
}

function openContentsFresh() {
    contentsScreen.classList.add('visible');
    if (menuTrigger) menuTrigger.classList.add('visible');
    revealContentsItems();
}

/* проявление пунктов оглавления — идемпотентно, из любой точки показа */
function revealContentsItems() {
    document.querySelectorAll('.contents-item').forEach((item, i) => {
        setTimeout(() => item.classList.add('revealed'), 200 + i * 80);
    });
}

function initProgress() {
    const saved = loadState();
    if (saved.lastChapter === undefined || saved.lastChapter < 0) return;

    const chapter = chapters[saved.lastChapter];
    if (!chapter || chapter.empty) return;

    hideIntroScreens();

    updateContentsMemory();
    contentsScreen.classList.add('visible');
    if (menuTrigger) menuTrigger.classList.add('visible');
    scrollContentsToCurrent();

    const items = document.querySelectorAll('.contents-item');
    items.forEach((item, index) => {
        setTimeout(() => item.classList.add('revealed'), 200 + index * 80);
    });

    contentsScreen.classList.add('progress-dimmed');

    const overlay = document.getElementById('progress-overlay');
    if (!overlay) return;
    overlay.innerHTML = `
        <div class="progress-content">
            <div class="progress-title">Вы остановились на главе ${chapter.number}</div>
            <div class="progress-subtitle">${chapter.title}</div>
            <div class="progress-actions">
                <span class="progress-continue">Продолжить</span>
                <span class="progress-restart">Начать сначала</span>
            </div>
        </div>
    `;
    overlay.classList.add('visible');

    overlay.querySelector('.progress-continue').addEventListener('click', () => {
        overlay.classList.remove('visible');
        contentsScreen.classList.remove('progress-dimmed');
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
        contentsScreen.classList.remove('progress-dimmed');
        overlay.classList.remove('visible');
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

if ('requestIdleCallback' in window) {
    requestIdleCallback(startFilmPreload, { timeout: 8000 });
} else {
    setTimeout(startFilmPreload, 4000);
}

function runFilmSequence() {
    if (filmRunning || !filmScreen || !filmGate || !filmImage) return;
    filmRunning = true;

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

    /* выход из серии: снять классы, таймеры, клоны; довести до названия */
    const endToTitle = () => {
        if (finished) return;
        finished = true;
        clearAllTimers();
        document.removeEventListener('visibilitychange', onVisibilityHidden);

        filmScreen.classList.remove('film-live');
        filmScreen.classList.remove('visible');
        filmGate.classList.remove('filming', 'film-flick', 'film-tear', 'film-zoom', 'film-slip', 'film-gap', 'film-gap-dip', 'film-drift', 'film-breathe', 'film-jam', 'film-push', 'film-catch', 'film-lamp-stutter', 'film-lamp-die');
        filmGate.style.visibility = '';
        filmGate.style.clipPath = '';
        filmGate.style.webkitClipPath = '';
        filmGate.style.transition = '';
        filmImage.style.opacity = '';

        const scratch = filmGate.querySelector('.film-scratch');
        if (scratch) scratch.remove();

        titleScreen.classList.add('visible');
        titleScreen.addEventListener('click', showContents, { once: true });

        setTimeout(() => {
            filmScreen.classList.remove('reduced', 'film-flick', 'film-breathe', 'film-hit-light', 'film-lamp-stutter', 'film-lamp-die', 'film-startup', 'film-catch-light', 'film-lamp-ignite');
            filmScreen.style.transition = '';
            removeClones();
            filmRunning = false;
        }, 450);
    };

    document.addEventListener('visibilitychange', onVisibilityHidden);

    /* --- reduced-motion: плавные кроссфейды без эффектов --- */
    if (reduced) {
        filmScreen.classList.add('visible');
        filmScreen.classList.add('reduced');

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
        if (filmHalo) filmHalo.src = src;
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
                if (navigator.vibrate) navigator.vibrate(30);
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
            readPos[sessionChapter] = Math.min(frac, 1);
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
    backdrop.classList.toggle('open', open);
    if (open) setBarHidden(false);
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
    clearTimeout(readPosTimer);
    readPosTimer = null;
    releaseReaderWakeLock();
    updateContentsMemory();
    cleanupVoiceObserver();
    cleanupSwipeHandlers();
    chapterScreen.classList.remove('visible');
    if (menuTrigger) menuTrigger.classList.add('visible');
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} /* уходим в оглавление — хэш главы снимаем */
    setTimeout(() => {
        contentsScreen.classList.add('visible');
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
        try { sessionStorage.setItem('echo_sw_reload_ts', String(Date.now())); } catch (e) {}
        location.reload();
    });

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
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
                '<button type="button" class="share-fab">' + FAB_ICON + '</button>';
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


/* === ЗАСТАВКА: ЗОВ БЕЗДЕЙСТВИЯ ===
   Нет тапа ~1с — обложка дышит, ~5с — подрагивает, ~10.5с — круги.
   Любое касание снимает зов навсегда. Если интро пропущено
   (дип-линк/прогресс: isStarted уже true) — таймеры срабатывают вхолостую. */
(function coverBeckon() {
    if (!coverScreen) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timers = [];
    const add = (cls) => { if (!isStarted) coverScreen.classList.add(cls); };
    timers.push(setTimeout(() => add('beckon-1'), 1200));
    timers.push(setTimeout(() => add('beckon-2'), 5200));
    timers.push(setTimeout(() => add('beckon-3'), 10500));
    ['touchstart', 'mousedown', 'keydown'].forEach((ev) => {
        document.addEventListener(ev, () => {
            timers.forEach(clearTimeout);
            coverScreen.classList.remove('beckon-1', 'beckon-2', 'beckon-3');
        }, { once: true, passive: true });
    });
})();
