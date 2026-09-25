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
const donateCopyBtn = document.getElementById('donate-copy');

let isMenuOpen = false;

let currentChapter = 0;

const STORAGE_KEY = 'echo_state';

/* === СВАЙП ВВЕРХ: ПЕРЕХОД К СЛЕДУЮЩЕЙ ГЛАВЕ === */
let swipeHintState = 'idle'; // 'idle' | 'hint-shown'
let swipeHintTimer = null;
let swipeStartY = 0;
let swipeStartX = 0;
let swipeAnchorY = 0;
let swipeReachedBottom = false;
let swipeMaxPull = 0;
let swipeIsTracking = false;

const SWIPE_RESISTANCE = 0.25;   // тугость: палец 100px → контент 5px
const SWIPE_HINT_THRESHOLD = 5;  // смещение контента для подсказки
const SWIPE_LONG_THRESHOLD = 35; // смещение контента для перехода
const SWIPE_HINT_TIMEOUT = 2000;
const MAX_PULL_OFFSET = 40;

const swipeHintEl = document.getElementById('swipe-hint');

function isAtBottom() {
    if (!chapterScreen) return false;
    const remaining = chapterScreen.scrollHeight - chapterScreen.scrollTop - chapterScreen.clientHeight;
    return remaining <= 2;
}

function showSwipeHint() {
    if (!swipeHintEl) return;
    swipeHintEl.classList.remove('visible');
    void swipeHintEl.offsetWidth;
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
    swipeHintState = 'idle';
    swipeIsTracking = false;
    swipeReachedBottom = false;
    swipeAnchorY = 0;
    swipeMaxPull = 0;
    if (swipeHintTimer) {
        clearTimeout(swipeHintTimer);
        swipeHintTimer = null;
    }
    hideSwipeHint();
    resetSwipePull();
}

function goNextChapter() {
    resetSwipeHint();
    if (currentChapter < chapters.length - 1) {
        openChapter(currentChapter + 1);
    }
}

function canSwipe() {
    if (!chapterScreen || !chapterScreen.classList.contains('visible')) return false;
    if (isMenuOpen) return false;
    if (photoOverlay && photoOverlay.classList.contains('active')) return false;
    if (currentChapter >= chapters.length - 1) return false;
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

    chapterScreen.classList.add('swipe-pulling');
    chapterScreen.style.setProperty('--swipe-pull-offset', (-pullOffset) + 'px');
}

function handleChapterTouchEnd(e) {
    if (!swipeIsTracking) return;
    swipeIsTracking = false;
    resetSwipePull();

    // Действуем только если достигли конца во время жеста
    if (!swipeReachedBottom) return;

    // Длинное давление — сразу переход
    if (swipeMaxPull >= SWIPE_LONG_THRESHOLD) {
        goNextChapter();
        return;
    }

    // Короткое давление — подсказка или переход
    if (swipeMaxPull >= SWIPE_HINT_THRESHOLD) {
        if (swipeHintState === 'hint-shown') {
            goNextChapter();
        } else {
            swipeHintState = 'hint-shown';
            showSwipeHint();
            swipeHintTimer = setTimeout(() => resetSwipeHint(), SWIPE_HINT_TIMEOUT);
        }
    }
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

function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
}
function saveState(patch) {
    const s = loadState();
    Object.assign(s, patch);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// === ПОСТРОЕНИЕ МАССИВА ГЛАВ ИЗ HTML ===
const items = document.querySelectorAll('.contents-item');
const chapters = Array.from(items).map((item, index) => {
    const num = String(index + 1).padStart(2, '0');
    const raw = item.textContent.trim();
    const title = raw.replace(/^\d+\s*[•\s]*/, '').trim();
    const text = chapterTexts[index] || `<p class="placeholder">Глава в процессе написания…</p>`;
    return { number: num, title, text };
});
initProgress();

// === ОБРАБОТЧИКИ НАВИГАЦИИ ВНУТРИ ГЛАВЫ ===
document.querySelector('.nav-prev').addEventListener('click', () => {
    if (currentChapter > 0) openChapter(currentChapter - 1);
});
document.querySelector('.nav-next').addEventListener('click', () => {
    if (currentChapter < chapters.length - 1) openChapter(currentChapter + 1);
});
document.querySelector('.nav-contents').addEventListener('click', () => {
    cleanupVoiceObserver();
    cleanupSwipeHandlers();
    chapterScreen.classList.remove('visible');
    if (menuTrigger) menuTrigger.classList.add('visible');
    setTimeout(() => {
        contentsScreen.classList.add('visible');
    }, 500);
});



// === ДЕЛЕГИРОВАНИЕ НА ОГЛАВЛЕНИЕ ===
contentsScreen.addEventListener('click', (e) => {
    const item = e.target.closest('.contents-item');
    if (!item) return;
    const idx = parseInt(item.dataset.chapter, 10);
    if (!isNaN(idx)) openChapter(idx);
});

// === КЛАВИАТУРА ===
document.addEventListener('keydown', (e) => {
    if (!chapterScreen.classList.contains('visible')) return;
    if (e.key === 'ArrowLeft' && currentChapter > 0) {
        e.preventDefault();
        openChapter(currentChapter - 1);
    }
    if (e.key === 'ArrowRight' && currentChapter < chapters.length - 1) {
        e.preventDefault();
        openChapter(currentChapter + 1);
    }
if (e.key === 'Escape') {
    e.preventDefault();
    if (photoOverlay && photoOverlay.classList.contains('active')) {
        closePhoto();
        return;
    }
    if (isMenuOpen) {
        closeMenu();
        return;
    }
    cleanupVoiceObserver();
    cleanupSwipeHandlers();
    chapterScreen.classList.remove('visible');
    if (menuTrigger) menuTrigger.classList.add('visible');
        setTimeout(() => contentsScreen.classList.add('visible'), 500);
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


            // Поочерёдно проявляем пункты
            const items = document.querySelectorAll('.contents-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('revealed');
                }, 200 + index * 80);
            });

        }, 300);

    }, 1200);
}

function openChapter(index, opts = {}) {
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
    if (index < 0 || index >= chapters.length) return;


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

   saveState({ lastChapter: index, lastVisit: new Date().toISOString(), chapterTitle: chapter.title });


    prevBtn.classList.toggle('inactive', index === 0);
    nextBtn.classList.toggle('inactive', index === chapters.length - 1);

    contentsScreen.classList.remove('visible');
    if (menuTrigger) menuTrigger.classList.remove('visible');


    setTimeout(() => {
        chapterScreen.classList.add('visible');
        chapterScreen.scrollTop = 0;
        if (opts.restore) {
            const s = loadState();
            const frac = s.readPos && s.readPos[index];
            if (frac) {
                const total = chapterScreen.scrollHeight - chapterScreen.clientHeight;
                chapterScreen.scrollTop = frac * total;
            }
        }
        initVoiceObserver();
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

            item.classList.add('electric-glitch');

            // Убираем эффект после окончания анимации
            setTimeout(() => {
                item.classList.remove('electric-glitch');
            }, GLITCH_DURATION);
        }
    }

    // Запускаем цикл
    setInterval(triggerGlitch, INTERVAL_MS);

    // Аналоговый просад: кратковременное «плывущее» искажение всего оглавления
    function triggerAnalogDrop() {
        if (!contentsScreen.classList.contains('visible')) return;
        contentsScreen.classList.add('analog-drop');
        setTimeout(() => {
            contentsScreen.classList.remove('analog-drop');
        }, 200);
    }

    setInterval(triggerAnalogDrop, 25000 + Math.random() * 15000);
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
function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        if (donateCopyBtn) {
            donateCopyBtn.textContent = 'Скопировано';
            donateCopyBtn.classList.add('copied');
            setTimeout(() => {
                donateCopyBtn.textContent = 'Копировать';
                donateCopyBtn.classList.remove('copied');
            }, 2000);
        }
    } catch (err) {}
    document.body.removeChild(ta);
}

function copyCard(targetId, btn) {
    const cardEl = document.getElementById(targetId);
    if (!cardEl) return;
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
            fallbackCopy(text);
            onSuccess();
        });
    } else {
        fallbackCopy(text);
        onSuccess();
    }
}

document.querySelectorAll('.donate-copy').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        if (target) copyCard(target, btn);
    });
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

/* --- ProgressOverlay --- */
function getOrCreateProgressOverlay() {
    let el = document.getElementById('progress-overlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'progress-overlay';
        el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2000;background:rgba(0,0,0,0.85);opacity:0;pointer-events:none;display:flex;justify-content:center;align-items:center;transition:opacity 0.6s ease;';
        document.body.appendChild(el);
    }
    return el;
}

function initProgress() {
    const saved = loadState();
    if (saved.lastChapter === undefined || saved.lastChapter < 0) return;

    const chapter = chapters[saved.lastChapter];
    if (!chapter) return;

    isStarted = true;
    coverScreen.style.opacity = '0';
    coverScreen.style.pointerEvents = 'none';
    textScreen.style.opacity = '0';
    textScreen.style.pointerEvents = 'none';
    finalScreen.style.opacity = '0';
    finalScreen.style.pointerEvents = 'none';
    titleScreen.style.opacity = '0';
    titleScreen.style.pointerEvents = 'none';

    contentsScreen.classList.add('visible');
    if (menuTrigger) menuTrigger.classList.add('visible');

    const items = document.querySelectorAll('.contents-item');
    items.forEach((item, index) => {
        setTimeout(() => item.classList.add('revealed'), 200 + index * 80);
    });

    contentsScreen.classList.add('progress-dimmed');

    const overlay = getOrCreateProgressOverlay();
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
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';

    overlay.querySelector('.progress-continue').addEventListener('click', () => {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        contentsScreen.classList.remove('progress-dimmed');
        setTimeout(() => openChapter(saved.lastChapter, { restore: true }), 400);
    });

    overlay.querySelector('.progress-restart').addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        contentsScreen.classList.remove('progress-dimmed');
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
    }))).then((results) => results.every(Boolean));
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
preloadFilmFrames().then((ok) => { filmReady = ok; });

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
        buffer.src = FILM_FRAMES[0];
        buffer.style.opacity = '0';
        filmGate.appendChild(buffer);
        clones.push(buffer);

        filmImage.src = FILM_FRAMES[0];
        filmImage.style.opacity = '0';
        void filmImage.offsetWidth;
        filmImage.style.opacity = '1';

        let active = filmImage;
        let idle = buffer;
        let t = 1000;
        for (let i = 1; i < FILM_FRAMES.length; i++) {
            const showFrame = () => {
                idle.src = FILM_FRAMES[i];
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
        filmImage.src = FILM_FRAMES[i];
        if (filmHalo) filmHalo.src = FILM_FRAMES[i];
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

let barHidden = false;
let barLastScroll = 0;
let readPosTimer = null;

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
    fill.style.width = (frac * 100) + '%';
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

    clearTimeout(readPosTimer);
    readPosTimer = setTimeout(() => {
        const total = chapterScreen.scrollHeight - chapterScreen.clientHeight;
        if (total <= 0) return;
        const frac = chapterScreen.scrollTop / total;
        if (frac > 0.02) {
            const s = loadState();
            const readPos = s.readPos || {};
            readPos[currentChapter] = Math.min(frac, 1);
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
