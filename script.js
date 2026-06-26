const coverScreen = document.getElementById('cover-screen');
const textScreen = document.getElementById('text-screen');
const glitchText = document.getElementById('glitch-text');
const finalScreen = document.getElementById('final-screen');

let isStarted = false;

// Обработка касания/клика
function handleStart(e) {
    if (isStarted) return;
    // Предотвращаем стандартное поведение только если это не скролл
    if (e.type === 'touchstart') {
        // Для тач — просто запоминаем, что коснулись
    }
}

function handleEnd(e) {
    if (isStarted) return;
    startSequence();
}

// Touch события
document.addEventListener('touchstart', handleStart, { passive: true });
document.addEventListener('touchend', handleEnd, { passive: true });

// Клик мышью
document.addEventListener('click', (e) => {
    if (isStarted) return;
    startSequence();
});

// Также свайп вверх
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (isStarted) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    if (diff > 50) {
        startSequence();
    }
}, { passive: true });

function startSequence() {
    if (isStarted) return;
    isStarted = true;
    
    // 1. Убираем картинку вверх
    coverScreen.classList.add('hide-up');
    
    // 2. Показываем текстовый экран
    setTimeout(() => {
        textScreen.classList.add('show-screen');
        glitchText.classList.add('text-visible');
        
        // 3. Мигание текста (~2 секунды)
        setTimeout(() => {
            glitchText.classList.add('blinking');
            
            setTimeout(() => {
                glitchText.classList.remove('blinking');
                
                // 4. Глитч-эффект (2 секунды)
                glitchText.classList.add('glitching');
                
                setTimeout(() => {
                    glitchText.classList.remove('glitching');
                    glitchText.classList.remove('text-visible');
                    
                    // 5. Убираем текстовый экран
                    textScreen.style.opacity = '0';
                    
                    setTimeout(() => {
                        // 6. Показываем финальный чёрный экран
                        finalScreen.classList.add('final-show');
                        
                        // Здесь можно добавить содержимое книги
                        // setTimeout(() => { window.location.href = 'book.html'; }, 1000);
                    }, 500);
                    
                }, 2000); // Длительность глитча
                
            }, 2000); // Длительность мигания
            
        }, 300); // Небольшая пауза перед миганием
        
    }, 600); // Задержка после свайпа
}
