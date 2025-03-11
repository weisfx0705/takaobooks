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
    const skipToMagicBtn = document.getElementById('skip-to-magic');
    const welcomeMessageInput = document.getElementById('welcome-message');

    // 檢查是否有已儲存的 API Key
    const savedApiKey = localStorage.getItem('savedApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    // 處理直接前往歡迎頁按鈕
    skipToMagicBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        const currentBookList = textInput.value.trim();
        const storedBookList = localStorage.getItem('bookList');
        const welcomeMessage = welcomeMessageInput.value.trim();
        
        // 檢查是否有 API Key
        if (!apiKey) {
            alert('請輸入 OpenAI API Key');
            return;
        }
        
        // 檢查是否有書單（當前輸入的或已儲存的）
        if (!currentBookList && !storedBookList) {
            // 如果用戶確認要使用預設書單或空白書單
            if (confirm('沒有找到已儲存的書單！是否要使用當前預設書單並繼續前往歡迎頁？\n\n（如果您只想更改歡迎詞，請點擊「確定」）')) {
                // 使用當前輸入框中的書單（即使是預設的）
                localStorage.setItem('bookList', currentBookList);
            } else {
                // 用戶取消操作
                return;
            }
        } else if (currentBookList && currentBookList !== storedBookList) {
            // 如果用戶修改了書單但沒點「確認書單」
            if (confirm('您修改了書單但尚未保存！是否要保存當前書單並繼續？')) {
                localStorage.setItem('bookList', currentBookList);
            } else {
                // 使用已儲存的書單（如果有）
                if (!storedBookList) {
                    alert('沒有已儲存的書單！請先填寫書單並點擊「確認書單」。');
                    return;
                }
            }
        }
        
        // 儲存 API Key (如果選擇記住)
        if (rememberApiKey.checked) {
            localStorage.setItem('savedApiKey', apiKey);
        }
        
        // 儲存 API Key 到 session
        localStorage.setItem('apiKey', apiKey);
        
        // 儲存歡迎詞（無論是否為空）
        localStorage.setItem('welcomeMessage', welcomeMessage);
        
        // 直接跳轉到歡迎頁
        window.location.href = 'magic.html';
    });

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