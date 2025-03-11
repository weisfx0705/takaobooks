document.addEventListener('DOMContentLoaded', async () => {
    const editForm = document.getElementById('edit-form');
    const editedContent = document.getElementById('edited-content');
    const loading = document.getElementById('loading');
    const restartBtn = document.getElementById('restart-btn');

    // 檢查是否有必要的數據
    const apiKey = localStorage.getItem('apiKey');
    const bookList = localStorage.getItem('bookList');

    if (!apiKey || !bookList) {
        alert('缺少必要的數據，請重新開始');
        window.location.href = 'index.html';
        return;
    }

    // 處理數據
    try {
        const processedData = await processBookList(bookList, apiKey);
        editedContent.value = processedData;
        loading.style.display = 'none';
        editForm.style.display = 'block';
    } catch (error) {
        console.error('API 錯誤:', error);
        
        let errorMessage = '處理數據時發生錯誤：';
        
        if (error.message.includes('API Key 格式無效')) {
            errorMessage += '您的 API Key 格式無效，請確保它以 sk- 開頭且不包含特殊字符。';
        } else if (error.message.includes('429')) {
            errorMessage += 'OpenAI API 請求次數過多，請稍後再試。';
        } else if (error.message.includes('401') || error.message.includes('403')) {
            errorMessage += 'API Key 無效或已過期，請檢查您的 API Key。';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
        loading.style.display = 'none';
        window.location.href = 'index.html';
    }

    // 處理表單提交
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const finalContent = editedContent.value.trim();
        if (!finalContent) {
            alert('請輸入有效的內容');
            return;
        }

        // 保存編輯後的內容
        localStorage.setItem('processedBookList', finalContent);

        // 使用轉場效果
        window.transition.animate(() => {
            // 轉場結束後跳轉到魔法啟動頁面
            window.location.href = 'magic.html';
        });
    });

    // 重新開始按鈕
    restartBtn.addEventListener('click', () => {
        // 不清除數據，只返回索引頁面
        window.location.href = 'index.html';
    });
});

// 使用 OpenAI API 處理圖書清單
async function processBookList(bookList, apiKey) {
    try {
        // 清理和編碼 API Key，確保不包含特殊字符
        const sanitizedApiKey = apiKey.replace(/[^\x20-\x7E]/g, '').trim();
        
        // 檢查 API Key 是否有效
        if (!sanitizedApiKey.startsWith('sk-')) {
            throw new Error('API Key 格式無效');
        }
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sanitizedApiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'system',
                    content: '你是一個專業的圖書分類助手。請幫忙整理以下圖書清單，確保資訊完整且有條理。\n\n要求：\n1. 請保留所有書籍資訊，不要做摘要\n2. 如果清單包含300本以上的書籍，請只保留前300本\n3. 請使用清楚的段落分隔不同類別的書籍\n4. 善用條列符號整理資訊\n5. 適當使用表情符號標示重點\n6. 確保文章結構清晰且易讀\n\n請以最容易閱讀的方式呈現這份書單。'
                }, {
                    role: 'user',
                    content: bookList
                }],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API 錯誤詳情:', errorData);
            throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('處理圖書清單時發生錯誤：', error);
        throw error;
    }
} 