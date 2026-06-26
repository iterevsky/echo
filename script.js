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
        textScreen.classList.add('show');
        glitchText.classList.add('show');

        // 3. Мигание
        setTimeout(() => {
            glitchText.classList.add('blinking');

            setTimeout(() => {
                glitchText.classList.remove('blinking');

                // 4. Глитч с затуханием в тьму — 2 секунды
                glitchText.classList.add('glitching');

                // Одновременно начинаем затухать сам text-screen
                setTimeout(() => {
                    textScreen.style.transition = 'opacity 1.5s ease';
                    textScreen.style.opacity = '0';
                }, 1200);

                // После окончания глитча — чёрный экран
                setTimeout(() => {
                    // Скрываем text-screen полностью
                    textScreen.style.pointerEvents = 'none';
                    
                    // Показываем финальный чёрный экран
                    finalScreen.classList.add('show');
                    finalScreen.style.opacity = '1';

                    // 5. Через 1.5 секунды — затухаем чёрный экран и показываем название
                    setTimeout(() => {
                        // Подготавливаем titleScreen (делаем видимым, но прозрачным)
                        titleScreen.style.opacity = '0';
                        titleScreen.style.pointerEvents = 'none';
                        titleScreen.classList.add('show');
                        
                        // Затухаем финальный экран
                        finalScreen.style.transition = 'opacity 2s ease';
                        finalScreen.style.opacity = '0';

                        // Параллельно появляется название
                        setTimeout(() => {
                            titleScreen.style.transition = 'opacity 2s ease';
                            titleScreen.style.opacity = '1';
                            titleScreen.style.pointerEvents = 'all';

                            // Ждём клик для перехода к оглавлению
                            titleScreen.addEventListener('click', showContents, { once: true });
                            titleScreen.addEventListener('touchend', showContents, { once: true });

                        }, 500);

                    }, 1500);

                }, 2000); // глитч длится 2 секунды и полностью угасает

            }, 1800); // мигание

        }, 400); // пауза перед миганием

    }, 700); // задержка после свайпа
}

function showContents() {
    // Буквы растают
    titleScreen.classList.add('melting');

    setTimeout(() => {
        titleScreen.style.opacity = '0';
        titleScreen.style.pointerEvents = 'none';

        // Показываем оглавление
        setTimeout(() => {
            contentsScreen.classList.add('show');

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
