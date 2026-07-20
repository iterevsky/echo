const coverScreen = document.getElementById('cover-screen');
const textScreen = document.getElementById('text-screen');
const glitchText = document.getElementById('glitch-text');
const finalScreen = document.getElementById('final-screen');
const titleScreen = document.getElementById('title-screen');
const contentsScreen = document.getElementById('contents-screen');
const chapterScreen = document.getElementById('chapter-screen');

let isStarted = false;
let touchStartX = 0;

const menuTrigger = document.getElementById('menu-trigger');
const menuOverlay = document.getElementById('menu-overlay');
const menuClose = document.getElementById('menu-close');
const donateCopyBtn = document.getElementById('donate-copy');
const donateCard = document.getElementById('donate-card');

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

const SWIPE_RESISTANCE = 0.005;   // тугость: палец 100px → контент 5px
const SWIPE_HINT_THRESHOLD = 5;  // смещение контента для подсказки
const SWIPE_LONG_THRESHOLD = 12; // смещение контента для перехода
const SWIPE_HINT_TIMEOUT = 2000;
const MAX_PULL_OFFSET = 20;

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
    if (window.__whiteoutActive) return false;
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
    const rawDy = swipeStartY - t.clientY;
    const dx = t.clientX - swipeStartX;

    // Палец пошёл вниз или вбок — сброс
    if (rawDy < 0 || Math.abs(rawDy) < Math.abs(dx) * 1.2) {
        swipeIsTracking = false;
        resetSwipePull();
        return;
    }

    // Ещё не в конце — ничего не делаем, скролл нативный
    if (!isAtBottom()) {
        resetSwipePull();
        return;
    }

    // Только что достигли конца? Фиксируем точку
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
const state = loadState();

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
    cleanupSnowObserver();
    cleanupWhiteout();
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
    cleanupSnowObserver();
    cleanupWhiteout();
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

                // 4. Глитч с затуханием в тьму — 2 секунды
                glitchText.classList.add('glitching');

                // Затухаем text-screen параллельно с глитчем
                setTimeout(() => {
                    textScreen.style.opacity = '0';
                }, 1200);

                // После окончания глитча — чёрный экран
                setTimeout(() => {
                    textScreen.classList.remove('visible');
                    textScreen.style.opacity = '';

                    // Показываем финальный чёрный экран
                    finalScreen.classList.add('visible');

                    // 5. Через 1.5 секунды — показываем название
                    setTimeout(() => {
                        // Затухаем чёрный экран
                        finalScreen.classList.remove('visible');

                        // Показываем название
                        titleScreen.classList.add('visible');

                        // Ждём клик для перехода к оглавлению
                        titleScreen.addEventListener('click', showContents, { once: true });

                    }, 1500);

                }, 2000); // глитч длится 2 секунды

            }, 1800); // мигание

        }, 400); // пауза перед миганием

    }, 700); // задержка после свайпа
}

function showContents() {
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

function openChapter(index) {
 resetSwipeHint();
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

    initSnowObserver();
    initWhiteout();
    saveState({ lastChapter: index, lastVisit: new Date().toISOString(), chapterTitle: chapter.title });


    prevBtn.classList.toggle('inactive', index === 0);
    nextBtn.classList.toggle('inactive', index === chapters.length - 1);

    contentsScreen.classList.remove('visible');
    if (menuTrigger) menuTrigger.classList.remove('visible');


    setTimeout(() => {
        chapterScreen.classList.remove('whiteout-phase');
        chapterScreen.classList.add('visible');
        chapterScreen.scrollTop = 0;
        initVoiceObserver();
    }, 300);
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
})();

                          
/* === МЕХАНИЧЕСКИЙ ГОЛОС: РАНДОМНАЯ АНИМАЦИЯ И ОТСЛЕЖИВАНИЕ === */
let voiceObserver = null;

function generateAggressiveGlitch(el) {
    const animId = 'voice-glitch-' + Math.random().toString(36).substr(2, 9);
    
    const palettes = [
        ['#ff0040', '#00A8E8'],
        ['#c41e3a', '#00A8E8'],
        ['#ff6b00', '#0040ff'],
        ['#9b59b6', '#2ecc71'],
        ['#e74c3c', '#3498db'],
        ['#ff0000', '#00ffff'],
        ['#ff3366', '#33ccff']
    ];
    const [c1, c2] = palettes[Math.floor(Math.random() * palettes.length)];
    const maxShift = 2 + Math.floor(Math.random() * 3);
    const maxSkew = 2 + Math.floor(Math.random() * 4);
    const duration = (2.4 + Math.random() * 2.6).toFixed(2);
    
    const steps = 20;
    let frames = '';
    for (let i = 0; i <= steps; i++) {
        const pct = Math.round((i / steps) * 100);
        const tx = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * maxShift + 1);
        const ty = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
        const sk = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * maxSkew + 1);
        const op = (0.5 + Math.random() * 0.5).toFixed(2);
        const sc = (0.95 + Math.random() * 0.10).toFixed(2);
        const br = (0.6 + Math.random() * 0.8).toFixed(2);
        const bl = Math.random() > 0.5 ? (Math.random() * 2).toFixed(1) : 0;
        const hasShadow = Math.random() > 0.25;
        const ts = hasShadow 
            ? `${Math.floor(Math.random()*4+1)}px 0 ${c1}, -${Math.floor(Math.random()*4+1)}px 0 ${c2}`
            : 'none';
        
        frames += `            ${pct}% { transform: translate(${tx}px, ${ty}px) skewX(${sk}deg) scale(${sc}); opacity: ${op}; text-shadow: ${ts}; filter: brightness(${br}) blur(${bl}px); }\n`;
    }
    
    const keyframes = `@keyframes ${animId} {\n${frames}        }`;
    
    const style = document.createElement('style');
    style.textContent = keyframes;
    style.dataset.voiceGlitch = animId;
    document.head.appendChild(style);
    
    el.style.animation = `${animId} ${duration}s steps(1) forwards`;
    
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
        el.style.animation = '';
        if (style.parentNode) style.remove();
    }, parseFloat(duration) * 1000);
}

function generateStandardGlitch(el) {
    const animId = 'voice-standard-' + Math.random().toString(36).substr(2, 9);
    
    // Те же RGB-палитры, что у aggressive
    const palettes = [
        ['#ff0040', '#00A8E8'],
        ['#c41e3a', '#00A8E8'],
        ['#ff6b00', '#0040ff'],
        ['#9b59b6', '#2ecc71'],
        ['#e74c3c', '#3498db'],
        ['#ff0000', '#00ffff'],
        ['#ff3366', '#33ccff']
    ];
    const [c1, c2] = palettes[Math.floor(Math.random() * palettes.length)];
    
    // Ослабленные параметры
    const maxShift = 1 + Math.floor(Math.random() * 2);   // 1–2px (было 2–4)
    const maxSkew = 1 + Math.floor(Math.random() * 2);    // 1–2deg (было 2–5)
    const duration = (2.4 + Math.random() * 2.6).toFixed(2); // та же длительность
    
    const steps = 20;
    let frames = '';
    
    for (let i = 0; i <= steps; i++) {
        const pct = Math.round((i / steps) * 100);
        
        // Микро-сдвиги
        const tx = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * maxShift + 1);
        const ty = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);
        const sk = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * maxSkew + 1);
        
        // Opacity: в основном высокая, иногда провал
        const op = (0.6 + Math.random() * 0.4).toFixed(2);
        
        // Scale почти 1.0
        const sc = (0.98 + Math.random() * 0.04).toFixed(2);
        
        // Яркость
        const br = (0.8 + Math.random() * 0.4).toFixed(2);
        
        // Blur лёгкий
        const bl = Math.random() > 0.6 ? (Math.random() * 1.5).toFixed(1) : 0;
        
        // === КЛЮЧЕВОЕ: цвет ===
        // В 60% кадров — белый текст (как обычный)
        // В 40% — цветная вспышка (как aggressive)
        const colorRoll = Math.random();
        let color, ts;
        
        if (colorRoll < 0.6) {
            // Белый/светлый — базовый текст
            color = '#e8e6e3';
            ts = 'none';
        } else {
            // Цветная вспышка — глитч
            color = Math.random() > 0.5 ? c1 : c2;
            ts = `${Math.floor(Math.random()*3+1)}px 0 ${c2}, -${Math.floor(Math.random()*3+1)}px 0 ${c1}`;
        }
        
        frames += `            ${pct}% { transform: translate(${tx}px, ${ty}px) skewX(${sk}deg) scale(${sc}); opacity: ${op}; color: ${color}; text-shadow: ${ts}; filter: brightness(${br}) blur(${bl}px); }\n`;
    }
    
    const keyframes = `@keyframes ${animId} {\n${frames}        }`;
    
    const style = document.createElement('style');
    style.textContent = keyframes;
    style.dataset.voiceGlitch = animId;
    document.head.appendChild(style);
    
    // steps(1) — мигание, как у aggressive
    el.style.animation = `${animId} ${duration}s steps(1) forwards`;
    
    // БЕЗ ударной волны
    // БЕЗ вибрации
    
    setTimeout(() => {
        el.style.animation = '';
        if (style.parentNode) style.remove();
    }, parseFloat(duration) * 1000);
}

function generateWhisperGlitch(el) {
    const animId = 'voice-whisper-' + Math.random().toString(36).substr(2, 9);
    
    const duration = (3.0 + Math.random() * 2.0).toFixed(2); // 3.0–5.0 с
    
    // 12 очень мягких кадров
    const steps = 12;
    let frames = '';
    
    for (let i = 0; i <= steps; i++) {
        const pct = Math.round((i / steps) * 100);
        
        // Пульсация opacity: 0.15–0.65 (полупрозрачный, как шёпот)
        const op = (0.15 + Math.random() * 0.5).toFixed(2);
        
        // Микро-дрожание: max 0.5px
        const tx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5).toFixed(2);
        
        // letter-spacing: иногда расширяется, как будто слова разваливаются
        const ls = Math.random() > 0.7 ? (Math.random() * 0.03).toFixed(3) : 0;
        
        // blur: 0–2px (размытость шёпота)
        const bl = (Math.random() * 2.0).toFixed(2);
        
        // Цвет: почти исчезающий
        const colors = ['#8a8680', '#6b6760', '#9a9690', '#b8b5b0'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        frames += `            ${pct}% { transform: translateX(${tx}px); opacity: ${op}; color: ${color}; letter-spacing: ${ls}em; filter: blur(${bl}px); }\n`;
    }
    
    const keyframes = `@keyframes ${animId} {\n${frames}        }`;
    
    const style = document.createElement('style');
    style.textContent = keyframes;
    style.dataset.voiceGlitch = animId;
    document.head.appendChild(style);
    
    el.style.animation = `${animId} ${duration}s ease-in-out forwards`;
    
    // БЕЗ ударной волны
    // БЕЗ вибрации
    
    setTimeout(() => {
        el.style.animation = '';
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
                
// Вибрация только для агрессивного режима
if (entry.target.dataset.voiceMode !== 'standard' && 
    entry.target.dataset.voiceMode !== 'whisper' &&
    navigator.vibrate) {
    navigator.vibrate([30, 60, 30]);
}

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
   SNOW ENGINE + WHITEOUT + PROGRESS
   ============================================================ */

/* --- SnowEngine: Canvas-метель --- */
class SnowEngine {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'snow-canvas';
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:7;';
        document.body.appendChild(this.canvas);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.particles = [];
        this.currentLevel = 'none';
        this.targetConfig = this.getConfig('none');
        this.currentConfig = { ...this.targetConfig };

        this.touch = { x: -1000, y: -1000, active: false, fadeEnd: 0 };
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mq.addEventListener) {
            mq.addEventListener('change', (e) => this.onMotionChange(e));
        } else {
            mq.addListener((e) => this.onMotionChange(e));
        }

        if (!this.isReducedMotion) {
            this.animate();
        } else {
            this.canvas.style.display = 'none';
        }
    }

    onMotionChange(e) {
        this.isReducedMotion = e.matches;
        if (this.isReducedMotion) {
            this.canvas.style.display = 'none';
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.canvas.style.display = 'block';
            this.animate();
        }
    }

    resize() {
        const w = window.innerWidth || document.documentElement.clientWidth || 320;
        const h = window.innerHeight || document.documentElement.clientHeight || 480;
        this.canvas.width = w;
        this.canvas.height = h;
    }

    getConfig(level) {
        const map = {
            none:     { count: 0,   sizeMin: 0, sizeMax: 0, speedMin: 0,   speedMax: 0,   opacityMin: 0,   opacityMax: 0   },
            light:    { count: 60,  sizeMin: 1, sizeMax: 2, speedMin: 0.3, speedMax: 0.8, opacityMin: 0.3, opacityMax: 0.5 },
            medium:   { count: 150, sizeMin: 1, sizeMax: 2, speedMin: 0.5, speedMax: 1.2, opacityMin: 0.4, opacityMax: 0.6 },
            heavy:    { count: 350, sizeMin: 2, sizeMax: 3, speedMin: 1.0, speedMax: 2.0, opacityMin: 0.5, opacityMax: 0.8 },
            blizzard: { count: 500, sizeMin: 2, sizeMax: 4, speedMin: 1.5, speedMax: 3.0, opacityMin: 0.6, opacityMax: 0.9 },
            whiteout: { count: 600, sizeMin: 2, sizeMax: 5, speedMin: 2.0, speedMax: 4.0, opacityMin: 0.7, opacityMax: 1.0 }
        };
        return map[level] || map.none;
    }

    setLevel(level) {
        this.currentLevel = level;
        this.targetConfig = this.getConfig(level);
        if (!this.targetConfig) this.targetConfig = this.getConfig('none');
    }

    setTouch(x, y, active) {
        this.touch.x = x;
        this.touch.y = y;
        this.touch.active = active;
        if (active) this.touch.fadeEnd = Date.now() + 800;
    }

    lerp(a, b, t) { return a + (b - a) * t; }

    updateParticles() {
        const k = 0.05;
        this.currentConfig.count      = this.lerp(this.currentConfig.count,      this.targetConfig.count,      k);
        this.currentConfig.sizeMin    = this.lerp(this.currentConfig.sizeMin,    this.targetConfig.sizeMin,    k);
        this.currentConfig.sizeMax    = this.lerp(this.currentConfig.sizeMax,    this.targetConfig.sizeMax,    k);
        this.currentConfig.speedMin   = this.lerp(this.currentConfig.speedMin,   this.targetConfig.speedMin,   k);
        this.currentConfig.speedMax   = this.lerp(this.currentConfig.speedMax,   this.targetConfig.speedMax,   k);
        this.currentConfig.opacityMin = this.lerp(this.currentConfig.opacityMin, this.targetConfig.opacityMin, k);
        this.currentConfig.opacityMax = this.lerp(this.currentConfig.opacityMax, this.targetConfig.opacityMax, k);

        const targetCount = Math.round(this.currentConfig.count);
        while (this.particles.length < targetCount) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                sizeRatio: Math.random(),
                speedRatio: Math.random(),
                opacityRatio: Math.random(),
                offset: Math.random() * Math.PI * 2
            });
        }
        while (this.particles.length > targetCount) this.particles.pop();

        for (let p of this.particles) {
            const speed = this.currentConfig.speedMin + p.speedRatio * (this.currentConfig.speedMax - this.currentConfig.speedMin);
            p.y += speed;
            p.x += Math.sin(p.y * 0.01 + p.offset) * 0.3;
            if (p.y > this.canvas.height) {
                p.y = -10;
                p.x = Math.random() * this.canvas.width;
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.particles.length === 0) return;

        const now = Date.now();
        const touchActive = this.touch.active || now < this.touch.fadeEnd;
        const tx = this.touch.x;
        const ty = this.touch.y;
        const rx = 70;
        const ry = 45;

        for (let p of this.particles) {
            const size = this.currentConfig.sizeMin + p.sizeRatio * (this.currentConfig.sizeMax - this.currentConfig.sizeMin);
            const opacity = this.currentConfig.opacityMin + p.opacityRatio * (this.currentConfig.opacityMax - this.currentConfig.opacityMin);

            let drawOpacity = opacity;
            // Снег равномерный — никакого centerGap

            // Просвет пальцем/мышью (эллипс, без sqrt)
            if (touchActive && drawOpacity > 0) {
                const dx = p.x - tx;
                const dy = p.y - ty;
                const distSq = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
                if (distSq < 1.0) {
                    drawOpacity = 0;
                } else if (distSq < 2.25) {
                    const grad = (distSq - 1.0) / 1.25;
                    drawOpacity *= Math.max(0, grad);
                }
            }

            if (drawOpacity <= 0.01) continue;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(232, 230, 227, ${drawOpacity})`;
            this.ctx.fill();
        }
    }

    animate() {
        if (this.isReducedMotion) return;
        this.updateParticles();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    clear() {
        this.setLevel('none');
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

/* --- SnowObserver --- */
let snowObserver = null;
let snowEngine = null;
const visibleSnowParagraphs = new Set();

function initSnowObserver() {
    if (!snowEngine) snowEngine = new SnowEngine();

    cleanupSnowObserver();

    const chapterText = document.querySelector('.chapter-text');
    if (!chapterText) return;

    const snowParagraphs = chapterText.querySelectorAll('p[class*="snow-"]');
    if (snowParagraphs.length === 0) {
        snowEngine.setLevel('none');
        return;
    }

    const levelMap = {
        'snow-none': 0, 'snow-light': 1, 'snow-medium': 2,
        'snow-heavy': 3, 'snow-blizzard': 4, 'snow-whiteout': 5
    };
    const getLevelValue = (el) => {
        for (let cls of el.classList) {
            if (levelMap[cls] !== undefined) return levelMap[cls];
        }
        return 0;
    };
    const getLevelName = (val) => {
        const names = ['none','light','medium','heavy','blizzard','whiteout'];
        return names[val] || 'none';
    };

    snowObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) visibleSnowParagraphs.add(entry.target);
            else visibleSnowParagraphs.delete(entry.target);
        });

        let maxLevel = 0;
        visibleSnowParagraphs.forEach(el => {
            const val = getLevelValue(el);
            if (val > maxLevel) maxLevel = val;
        });

        if (visibleSnowParagraphs.size > 0) {
            snowEngine.setLevel(getLevelName(maxLevel));
        } else {
            snowEngine.setLevel('none');
        }
    }, {
        root: chapterScreen,
        rootMargin: '-20% 0px -20% 0px',
        threshold: 0
    });

    snowParagraphs.forEach(p => snowObserver.observe(p));
}

function cleanupSnowObserver() {
    if (snowObserver) {
        snowObserver.disconnect();
        snowObserver = null;
    }
    visibleSnowParagraphs.clear();
    if (snowEngine) snowEngine.setLevel('none');
}

/* --- WhiteoutSequence (ручной запуск по клику) --- */
let whiteoutClickHandler = null;

function initWhiteout() {
    const chapterText = document.querySelector('.chapter-text');
    if (!chapterText) return;

    const whiteoutP = chapterText.querySelector('p.snow-whiteout');
    if (!whiteoutP) return;

    const paragraphs = Array.from(chapterText.querySelectorAll('p'));
    const idx = paragraphs.indexOf(whiteoutP);
    if (idx === -1) return;

    // Скрываем все абзацы ПОСЛЕ snow-whiteout
    for (let i = idx + 1; i < paragraphs.length; i++) {
        paragraphs[i].classList.add('post-whiteout-hidden');
    }

        whiteoutClickHandler = (e) => {
        if (window.__whiteoutActive) return;
        if (e.target.closest('.photo-link')) return;
        e.preventDefault();
        e.stopPropagation();
        if (typeof closeMenu === 'function') closeMenu();
        triggerWhiteoutSequence();
    };


    whiteoutP.addEventListener('click', whiteoutClickHandler);
}

function cleanupWhiteout() {
    const chapterText = document.querySelector('.chapter-text');
    const chapterScreenEl = document.getElementById('chapter-screen');
    if (chapterScreenEl) chapterScreenEl.classList.remove('whiteout-phase');
    if (!chapterText) return;

    const whiteoutP = chapterText.querySelector('p.snow-whiteout');
    if (whiteoutP && whiteoutClickHandler) {
        whiteoutP.removeEventListener('click', whiteoutClickHandler);
        whiteoutClickHandler = null;
    }

    chapterText.querySelectorAll('.post-whiteout-hidden').forEach(el => {
        el.classList.remove('post-whiteout-hidden');
        el.style.cssText = '';
    });

    if (whiteoutP) {
        whiteoutP.style.cssText = '';
        whiteoutP.style.display = '';
    }

    const overlay = document.getElementById('whiteout-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
    }

    window.__whiteoutActive = false;
}

function getOrCreateWhiteoutOverlay() {
    let el = document.getElementById('whiteout-overlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'whiteout-overlay';
        el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:1000;opacity:0;pointer-events:none;transition:opacity 0.4s ease;';
        document.body.appendChild(el);
    }
    return el;
}

function triggerWhiteoutSequence() {
    if (window.__whiteoutActive) return;
    window.__whiteoutActive = true;

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const overlay = getOrCreateWhiteoutOverlay();
    const chapterText = document.querySelector('.chapter-text');
    const chapterScreenEl = document.getElementById('chapter-screen');
    if (!chapterText || !chapterScreenEl) { window.__whiteoutActive = false; return; }
    chapterScreenEl.classList.add('whiteout-phase');


    const paragraphs = Array.from(chapterText.querySelectorAll('p'));
    const whiteoutP = chapterText.querySelector('p.snow-whiteout');
    const idx = paragraphs.indexOf(whiteoutP);
    if (idx === -1) { window.__whiteoutActive = false; return; }

    // Reduced motion — мгновенно
    if (isReduced) {
        for (let i = 0; i < idx; i++) {
            paragraphs[i].style.cssText = 'opacity:0;height:0;margin:0;padding:0;overflow:hidden;';
        }
        whiteoutP.style.display = 'none';
        for (let i = idx + 1; i < paragraphs.length; i++) {
            paragraphs[i].classList.remove('post-whiteout-hidden');
            paragraphs[i].style.cssText = '';
        }
        if (paragraphs[idx + 1]) {
            paragraphs[idx + 1].scrollIntoView({ behavior: 'auto', block: 'center' });
        }
        window.__whiteoutActive = false;
        return;
    }

    // Блокировка
    const blockScroll = (e) => e.preventDefault();
    chapterScreenEl.addEventListener('wheel', blockScroll, { passive: false });
    chapterScreenEl.addEventListener('touchmove', blockScroll, { passive: false });
    chapterScreenEl.style.overflow = 'hidden';

    const blockKey = (e) => {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Escape',' '].includes(e.key)) {
            e.preventDefault();
            e.stopPropagation();
        }
    };
    document.addEventListener('keydown', blockKey, true);

    // Фаза 1: абзац падает (0–700 мс)
    whiteoutP.style.transition = 'transform 0.7s ease-in, filter 0.7s ease-in, opacity 0.7s ease-in';
    whiteoutP.style.transform = 'translateY(40px) scale(0.98)';
    whiteoutP.style.filter = 'blur(6px)';
    whiteoutP.style.opacity = '0';

    // Фаза 2: белый экран (700 мс)
    setTimeout(() => {
        overlay.style.transition = 'opacity 0.4s ease';
        overlay.style.opacity = '1';
        if (snowEngine) snowEngine.setLevel('none');
    }, 700);

    // Фаза 3: старый текст исчезает (3200 мс — пока экран белый)
    setTimeout(() => {
        for (let i = 0; i < idx; i++) {
            const p = paragraphs[i];
            p.style.transition = 'all 0.5s ease';
            p.style.opacity = '0';
            p.style.transform = 'translateY(-30px)';
            p.style.filter = 'blur(4px)';
            p.style.height = '0';
            p.style.margin = '0';
            p.style.padding = '0';
            p.style.overflow = 'hidden';
        }
    }, 3200);

    // Фаза 4: белый уходит (3600 мс)
    setTimeout(() => {
        overlay.style.transition = 'opacity 1.0s ease';
        overlay.style.opacity = '0';
    }, 3600);

    // Фаза 5: пробуждение (4600 мс)
    setTimeout(() => {
        whiteoutP.style.display = 'none';

        for (let i = idx + 1; i < paragraphs.length; i++) {
            paragraphs[i].classList.remove('post-whiteout-hidden');
            paragraphs[i].style.cssText = '';
        }

        const nextP = paragraphs[idx + 1];
        if (nextP) {
            nextP.style.opacity = '0';
            nextP.style.transform = 'translateY(20px)';
            nextP.style.filter = 'blur(2px)';
            nextP.offsetHeight;
            nextP.style.transition = 'opacity 0.8s ease, transform 0.8s ease, filter 0.8s ease';
            nextP.style.opacity = '1';
            nextP.style.transform = 'translateY(0)';
            nextP.style.filter = 'blur(0)';

            setTimeout(() => nextP.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }

        chapterScreenEl.removeEventListener('wheel', blockScroll);
        chapterScreenEl.removeEventListener('touchmove', blockScroll);
        chapterScreenEl.style.overflow = 'auto';
        document.removeEventListener('keydown', blockKey, true);
        window.__whiteoutActive = false;
    }, 4600);
}

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
        setTimeout(() => openChapter(saved.lastChapter), 400);
    });

    overlay.querySelector('.progress-restart').addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        contentsScreen.classList.remove('progress-dimmed');
        location.reload();
    });
}

/* --- Интерактивный просвет --- */
let mouseDown = false;

document.addEventListener('touchstart', (e) => {
    const cs = document.getElementById('chapter-screen');
    if (!cs || !cs.classList.contains('visible') || !snowEngine) return;
    const t = e.touches[0];
    let ty = t.clientY - 50;
    if (ty < 50) ty = 45;
    snowEngine.setTouch(t.clientX, ty, true);
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    const cs = document.getElementById('chapter-screen');
    if (!cs || !cs.classList.contains('visible') || !snowEngine) return;
    const t = e.touches[0];
    let ty = t.clientY - 50;
    if (ty < 50) ty = 45;
    snowEngine.setTouch(t.clientX, ty, true);
}, { passive: true });

document.addEventListener('touchend', () => {
    if (snowEngine) snowEngine.setTouch(-1000, -1000, false);
}, { passive: true });

document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const cs = document.getElementById('chapter-screen');
    if (!cs || !cs.classList.contains('visible') || !snowEngine) return;
    mouseDown = true;
    snowEngine.setTouch(e.clientX, e.clientY - 28, true);
});

document.addEventListener('mousemove', (e) => {
    if (!mouseDown || !snowEngine) return;
    snowEngine.setTouch(e.clientX, e.clientY - 28, true);
});

document.addEventListener('mouseup', () => {
    mouseDown = false;
    if (snowEngine) snowEngine.setTouch(-1000, -1000, false);
});

initSwipeHandlers();
