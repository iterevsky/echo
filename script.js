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

                // 4. Глитч с затуханием
                glitchText.classList.add('glitching');

                // Глитч длится 2 секунды и сам угасает в тьму
                setTimeout(() => {
                    glitchText.classList.remove('glitching');

                    // 5. Убираем текстовый экран, показываем финальный чёрный
                    textScreen.classList.add('fade-out');

                    setTimeout(() => {
                        finalScreen.classList.add('show');

                        // 6. Показываем название книги
                        setTimeout(() => {
                            finalScreen.style.opacity = '0';
                            finalScreen.style.transition = 'opacity 1.5s ease';

                            setTimeout(() => {
                                titleScreen.classList.add('show');
                                titleScreen.style.pointerEvents = 'all';

                                // Ждём клик для перехода к оглавлению
                                titleScreen.addEventListener('click', showContents, { once: true });
                                titleScreen.addEventListener('touchend', showContents, { once: true });

                            }, 800);

                        }, 1500);

                    }, 600);

                }, 2000); // глитч длится 2 секунды

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
