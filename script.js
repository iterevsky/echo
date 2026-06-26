const coverScreen = document.getElementById('cover-screen');
const textScreen = document.getElementById('text-screen');
const glitchText = document.getElementById('glitch-text');
const finalScreen = document.getElementById('final-screen');

let isSwiped = false;

// Обработка свайпа (для телефона)
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (isSwiped) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    // Свайп вверх (разница > 50 пикселей)
    if (diff > 50) {
        startSequence();
    }
});

// Обработка прокрутки мышью (для компьютера)
document.addEventListener('wheel', (e) => {
    if (isSwiped) return;
    
    if (e.deltaY < 0) { // Прокрутка вверх
        startSequence();
    }
});

// Также можно кликнуть по картинке (для удобства)
coverScreen.addEventListener('click', () => {
    if (!isSwiped) startSequence();
});

function startSequence() {
    isSwiped = true;
    
    // 1. Убираем картинку вверх
    coverScreen.classList.add('hide');
    
    // 2. Показываем текстовый экран
    setTimeout(() => {
        textScreen.classList.add('show');
        
        // 3. Мигание текста (2 секунды)
        glitchText.classList.add('blinking');
        
        setTimeout(() => {
            glitchText.classList.remove('blinking');
            
            // 4. Глитч-эффект (2 секунды)
            glitchText.classList.add('glitching');
            
            setTimeout(() => {
                // 5. Убираем текст, показываем финальный экран
                textScreen.style.opacity = '0';
                textScreen.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    finalScreen.classList.add('show');
                    
                    // Здесь можно добавить переход к содержимому книги
                    // Например: window.location.href = 'book.html';
                }, 500);
                
            }, 2000); // Длительность глитча
            
        }, 2000); // Длительность мигания
        
    }, 600); // Небольшая задержка после свайпа
}
