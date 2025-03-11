document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const welcomeMessage = document.getElementById('welcome-message');
    
    // 檢查是否有自定義歡迎詞
    const customWelcome = localStorage.getItem('welcomeMessage');
    if (customWelcome) {
        welcomeMessage.textContent = customWelcome;
    }
    
    // 點擊開始按鈕時的效果
    startButton.addEventListener('click', () => {
        // 使用轉場效果
        window.transition.animate(() => {
            window.location.href = 'chat.html';
        });
    });
    
    // 魔法光點效果
    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        document.body.appendChild(sparkle);
        
        // 動畫
        sparkle.style.animation = 'sparkle 1s ease-in-out';
        sparkle.addEventListener('animationend', () => {
            sparkle.remove();
        });
    }
    
    // 滑鼠移動時產生光點
    document.addEventListener('mousemove', (e) => {
        if (Math.random() < 0.1) { // 控制光點產生的頻率
            createSparkle(e.clientX, e.clientY);
        }
    });
}); 