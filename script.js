const coverScreen = document.getElementById('cover-screen');
const textScreen = document.getElementById('text-screen');
const glitchText = document.getElementById('glitch-text');
const finalScreen = document.getElementById('final-screen');
const titleScreen = document.getElementById('title-screen');
const contentsScreen = document.getElementById('contents-screen');
const chapterScreen = document.getElementById('chapter-screen');

let isStarted = false;
let currentChapter = 0;

const STORAGE_KEY = 'echo_state';

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

// === ОБРАБОТЧИКИ НАВИГАЦИИ ВНУТРИ ГЛАВЫ ===
document.querySelector('.nav-prev').addEventListener('click', () => {
    if (currentChapter > 0) openChapter(currentChapter - 1);
});
document.querySelector('.nav-next').addEventListener('click', () => {
    if (currentChapter < chapters.length - 1) openChapter(currentChapter + 1);
});
document.querySelector('.nav-contents').addEventListener('click', () => {
    chapterScreen.classList.remove('visible');
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
        chapterScreen.classList.remove('visible');
        setTimeout(() => contentsScreen.classList.add('visible'), 500);
    }
});

// === ИНТРО: КАСАНИЕ / КЛИК / СВАЙП ===
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (isStarted) return;
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (diff > 50) startSequence();
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
    textEl.innerHTML = chapter.text;

    prevBtn.classList.toggle('inactive', index === 0);
    nextBtn.classList.toggle('inactive', index === chapters.length - 1);

    contentsScreen.classList.remove('visible');

    setTimeout(() => {
        chapterScreen.classList.add('visible');
        chapterScreen.scrollTop = 0;
    }, 300);

    saveState({ lastChapter: index });
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
