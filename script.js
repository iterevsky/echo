const coverScreen = document.getElementById('cover-screen');
const textScreen = document.getElementById('text-screen');
const glitchText = document.getElementById('glitch-text');
const finalScreen = document.getElementById('final-screen');
const titleScreen = document.getElementById('title-screen');
const contentsScreen = document.getElementById('contents-screen');

let isStarted = false;

// Касание / клик везде
document.addEventListener('touchstart', () => {}, { passive: true });
document.addEventListener('touchend', (e) => {
    if (!isStarted) startSequence();
}, { passive: true });

document.addEventListener('click', () => {
    if (!isStarted) startSequence();
});

// Свайп вверх
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (isStarted) return;
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (diff > 50) startSequence();
}, { passive: true });

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
                        titleScreen.addEventListener('touchend', showContents, { once: true });

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

// Данные глав
const chapters = [
    {
        number: "01",
        title: "В начале была метель",
        text: `<p>В начале была метель.</p>
<p>Я разглядывал двор, в котором мне предстояло жить. Обычная панельная девятиэтажка, по бокам и напротив — её копии. Вместе они создавали иллюзию дома-колодца. Только панельного. Во дворе беседка, качели, турники. Дальше виднелся декор, созданный из старых покрышек: они покрашены и наполовину вкопаны в землю.</p>
<p>— Ярослав, соберись, что ты зеваешь по сторонам, — прервал мои размышления голос отца. — Мы так и до вечера не управимся.</p>
<p>— Да я просто логистику оцениваю, пап, — улыбнулся я, стараясь пошутить его терминами. — Смотри, вон в том месте будет удобнее разгружать вещи. Ну, где-то на 27 процентов.</p>`
    },
    {
        number: "02",
        title: "Разложив большую часть",
        text: `<p>Разложив большую часть своих вещей, я решил, что сейчас самое время прогуляться до Волги. Всё равно уборка и разбор вещей продолжатся и завтра. Я вышел из своей комнаты и направился к родителям, чтобы отпроситься.</p>
<p>— Ну как же хорошо! — услышал я голос отца из комнаты. — Неужели будет всё нормально. Больше никаких соседей сверху. Ни музыки, ни хаоса с топаньем и вечеринками. Никакого нарушения порядка.</p>`
    },
    {
        number: "03",
        title: "Воздух казался мне другим",
        text: `<p>Воздух казался мне другим.</p>
<p>Нет, дело вряд ли в чём-то сверхъестественном. Уверен, что всё это было из-за Волги. Большая река, которая протекала вдоль всего города, определённо влияла на влажность и на сам запах воздуха в городе.</p>
<p>Я шёл по центру города немного грустным. Позади остался привычный мне мир, мои знакомые, моя школа, мой дом. Отец говорил, что всё это здорово, но сентиментальная чепуха не должна влиять на жизнь.</p>`
    }
];

let currentChapter = 0;

// Функция открытия главы
function openChapter(index) {
    if (index < 0 || index >= chapters.length) return;
    
    currentChapter = index;
    const chapter = chapters[index];
    
    const screen = document.getElementById('chapter-screen');
    const numberEl = screen.querySelector('.chapter-number');
    const titleEl = screen.querySelector('.chapter-title');
    const textEl = screen.querySelector('.chapter-text');
    const prevBtn = screen.querySelector('.nav-prev');
    const nextBtn = screen.querySelector('.nav-next');
    
    numberEl.textContent = 'Глава ' + chapter.number;
    titleEl.textContent = chapter.title;
    textEl.innerHTML = chapter.text;
    
    // Обновляем навигацию
    prevBtn.classList.toggle('inactive', index === 0);
    nextBtn.classList.toggle('inactive', index === chapters.length - 1);
    
    // Скрываем оглавление, показываем главу
    contentsScreen.classList.remove('visible');
    
    setTimeout(() => {
        screen.classList.add('visible');
        window.scrollTo(0, 0);
    }, 500);
}

// Обработчики навигации
document.querySelector('.nav-prev').addEventListener('click', () => {
    if (currentChapter > 0) openChapter(currentChapter - 1);
});

document.querySelector('.nav-next').addEventListener('click', () => {
    if (currentChapter < chapters.length - 1) openChapter(currentChapter + 1);
});

document.querySelector('.nav-contents').addEventListener('click', () => {
    const screen = document.getElementById('chapter-screen');
    screen.classList.remove('visible');
    
    setTimeout(() => {
        contentsScreen.classList.add('visible');
    }, 500);
});

// Обновляем обработчики пунктов оглавления
// Замени в showContents() эту часть:
// contents-item уже есть, добавляем клик:
document.querySelectorAll('.contents-item').forEach((item, index) => {
    item.addEventListener('click', () => {
        openChapter(index);
    });
});
