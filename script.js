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

    prevBtn.classList.toggle('inactive', index === 0);
    nextBtn.classList.toggle('inactive', index === chapters.length - 1);

    contentsScreen.classList.remove('visible');
    if (menuTrigger) menuTrigger.classList.remove('visible');


    setTimeout(() => {
        chapterScreen.classList.add('visible');
        chapterScreen.scrollTop = 0;
        initVoiceObserver();
        initChapter04Effects();
    }, 300);


    saveState({ lastChapter: index });
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

/* === СНЕГ В ГЛАВЕ 04 === */
let snowflakes = [];

function createSnowflake(intensity) {
  const flake = document.createElement('div');
  flake.className = 'snowflake';
  
  const sizeBase = intensity === 'snow-light' ? 2 : intensity === 'snow-medium' ? 3 : 4;
  const size = sizeBase + Math.random() * 2;
  flake.style.width = size + 'px';
  flake.style.height = size + 'px';
  
  flake.style.left = Math.random() * 100 + '%';
  
  const durationBase = intensity === 'snow-light' ? 8 : intensity === 'snow-medium' ? 5 : 3;
  const duration = durationBase + Math.random() * 3;
  flake.style.animationDuration = duration + 's';
  flake.style.animationDelay = -(Math.random() * duration) + 's';
  
  return flake;
}

function startSnow(level) {
  const overlay = document.getElementById('snow-overlay');
  if (!overlay) return;
  
  stopSnow();
  overlay.className = level;
  
  const count = level === 'snow-light' ? 30 : level === 'snow-medium' ? 60 : level === 'snow-heavy' ? 100 : 150;
  
  for (let i = 0; i < count; i++) {
    const flake = createSnowflake(level);
    overlay.appendChild(flake);
    snowflakes.push(flake);
  }
  
  if (level === 'snow-blizzard') {
    const textEl = document.querySelector('.chapter-text');
    if (textEl) textEl.classList.add('snow-active');
  }
}

function stopSnow() {
  const overlay = document.getElementById('snow-overlay');
  if (!overlay) return;
  
  snowflakes.forEach(f => f.remove());
  snowflakes = [];
  overlay.className = '';
  
  const textEl = document.querySelector('.chapter-text');
  if (textEl) textEl.classList.remove('snow-active');
}

function whiteFlash(visibleDuration, callback) {
  const flash = document.getElementById('white-flash');
  if (!flash) return;
  
  flash.classList.add('active');
  
  setTimeout(() => {
    flash.classList.remove('active');
    setTimeout(() => {
      if (callback) callback();
    }, 500);
  }, visibleDuration || 2000);
}

function initChapter04Effects() {
  if (currentChapter !== 3) return;
  
  const chapterScreen = document.getElementById('chapter-screen');
  if (!chapterScreen) return;
  
  const paragraphs = chapterScreen.querySelectorAll('.chapter-text p');
  
  const snowObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const p = entry.target;
        const text = p.textContent;
        
        if (text.includes('небольшие снежинки')) {
          startSnow('snow-light');
        } else if (text.includes('Снег усилился')) {
          startSnow('snow-medium');
        } else if (text.includes('Фонари стали мерцать') || text.includes('пульсировать')) {
          startSnow('snow-heavy');
        } else if (text.includes('Я ускорился') || text.includes('Я бежал')) {
          startSnow('snow-blizzard');
        } else if (text.includes('И упал')) {
          setTimeout(() => {
            const textEl = document.querySelector('.chapter-text');
            if (textEl) textEl.style.opacity = '0';
            
            whiteFlash(2000, () => {
              if (textEl) textEl.style.opacity = '1';
              stopSnow();
            });
          }, 500);
        } else if (text.includes('Но ничего не происходило')) {
          stopSnow();
        }
      }
    });
  }, {
    root: chapterScreen,
    rootMargin: '-30% 0px -30% 0px',
    threshold: 0.3
  });
  
  paragraphs.forEach(p => snowObserver.observe(p));
  window._snowObserver = snowObserver;
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
    if (window._snowObserver) {
    window._snowObserver.disconnect();
    window._snowObserver = null;
    }
    stopSnow();
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
