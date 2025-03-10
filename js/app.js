document.addEventListener('DOMContentLoaded', () => {
    // 登入相關功能
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    
    // 顯示登入視窗
    loginModal.style.display = 'flex';
    
    // 處理登入表單提交
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === 'takao' && password === 'takaobooks') {
            // 登入成功，隱藏登入視窗
            loginModal.style.display = 'none';
        } else {
            // 登入失敗，跳轉到 magic.html
            window.location.href = 'magic.html';
        }
    });

    const form = document.getElementById('setup-form');
    const textInput = document.getElementById('text-input');
    const apiKeyInput = document.getElementById('api-key');
    const rememberApiKey = document.getElementById('remember-api-key');
    const clearApiKeyBtn = document.getElementById('clear-api-key');

    // 檢查是否有已儲存的 API Key
    const savedApiKey = localStorage.getItem('savedApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    // 清除 API Key 按鈕
    clearApiKeyBtn.addEventListener('click', () => {
        if (confirm('確定要清除已儲存的 API Key 嗎？')) {
            localStorage.removeItem('savedApiKey');
            apiKeyInput.value = '';
            rememberApiKey.checked = true;
        }
    });

    // 處理表單提交
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const apiKey = apiKeyInput.value.trim();
        const bookList = textInput.value.trim();

        if (!apiKey) {
            alert('請輸入 OpenAI API Key');
            return;
        }

        if (!bookList) {
            alert('請貼上圖書清單文字');
            return;
        }

        // 如果選擇記住 API Key，就儲存起來
        if (rememberApiKey.checked) {
            localStorage.setItem('savedApiKey', apiKey);
        } else {
            localStorage.removeItem('savedApiKey');
        }

        // 保存數據到 localStorage
        localStorage.setItem('apiKey', apiKey);
        localStorage.setItem('bookList', bookList);

        // 跳轉到編輯頁面
        window.location.href = 'edit.html';
    });
});

// 語音輸入相關功能
let recognition = null;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'zh-TW';
} 