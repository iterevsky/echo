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
    cleanupVoiceObserver();
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
        cleanupVoiceObserver();
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
    textEl.innerHTML = chapter.text.replace(
    /{{VOICE(?::(\w+))?}}(.*?){{\/VOICE}}/g,
    (match, mode, text) => {
        const voiceMode = mode || 'aggressive';
        return `<span class="voice-glitch" data-voice-mode="${voiceMode}">${text}</span>`;
    }
);



    prevBtn.classList.toggle('inactive', index === 0);
    nextBtn.classList.toggle('inactive', index === chapters.length - 1);

    contentsScreen.classList.remove('visible');

    setTimeout(() => {
        chapterScreen.classList.add('visible');
        chapterScreen.scrollTop = 0;
        initVoiceObserver();
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
    
    // Мягкие палитры: два близких тона для мерцания
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
    
    // ТА ЖЕ длительность, что и aggressive
    const duration = (2.4 + Math.random() * 2.6).toFixed(2);
    
    // ТО ЖЕ количество шагов — для эффекта мигания
    const steps = 20;
    let frames = '';
    
    for (let i = 0; i <= steps; i++) {
        const pct = Math.round((i / steps) * 100);
        
        // Микро-сдвиги (мягче aggressive, но заметно)
        const tx = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2 + 1);
        const ty = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);
        const sk = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2 + 1);
        
        // Мерцание opacity
        const op = (0.4 + Math.random() * 0.6).toFixed(2);
        
        // Микро-масштаб
        const sc = (0.97 + Math.random() * 0.06).toFixed(2);
        
        // Яркость
        const br = (0.7 + Math.random() * 0.5).toFixed(2);
        
        // Blur: 0–1.5px (мягкий)
        const bl = Math.random() > 0.4 ? (Math.random() * 1.5).toFixed(1) : 0;
        
        // Цвет: мягкое переключение между двумя тонами
        const color = Math.random() > 0.5 ? c1 : c2;
        
        // text-shadow: едва заметное двухцветное свечение
        const hasGlow = Math.random() > 0.5;
        const ts = hasGlow 
            ? `${Math.floor(Math.random()*2+1)}px 0 ${c2}, -${Math.floor(Math.random()*2+1)}px 0 ${c1}`
            : 'none';
        
        frames += `            ${pct}% { transform: translate(${tx}px, ${ty}px) skewX(${sk}deg) scale(${sc}); opacity: ${op}; color: ${color}; text-shadow: ${ts}; filter: brightness(${br}) blur(${bl}px); }\n`;
    }
    
    const keyframes = `@keyframes ${animId} {\n${frames}        }`;
    
    const style = document.createElement('style');
    style.textContent = keyframes;
    style.dataset.voiceGlitch = animId;
    document.head.appendChild(style);
    
    // steps(1) — эффект мигания/дробления, как у aggressive
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
