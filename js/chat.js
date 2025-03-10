document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const voiceButton = document.getElementById('voice-input-btn');
    const clearButton = document.getElementById('clear-chat');

    // 用於控制加載動畫的變數
    let loadingAnimationInterval = null;

    // 加載動畫效果函數
    function animateLoadingDots() {
        if (loadingAnimationInterval) {
            clearInterval(loadingAnimationInterval);
        }
        
        // 骰子表情陣列
        const diceEmojis = ['🎲', '🎯', '🎮', '🎭', '🎪'];
        let currentDiceIndex = 0;
        let dotCount = 0;
        
        loadingAnimationInterval = setInterval(() => {
            // 更新骰子表情
            const diceElement = document.querySelector('.dice-animation');
            if (diceElement) {
                currentDiceIndex = (currentDiceIndex + 1) % diceEmojis.length;
                diceElement.textContent = diceEmojis[currentDiceIndex];
            }
            
            // 更新點點動畫
            const dotsElement = document.querySelector('.loading-dots');
            if (dotsElement) {
                dotCount = (dotCount + 1) % 4;
                dotsElement.textContent = '.'.repeat(dotCount || 1);
            } else {
                // 如果找不到元素，清除定時器
                clearInterval(loadingAnimationInterval);
                loadingAnimationInterval = null;
            }
        }, 500);
    }

    // 清空輸入框的函數
    function clearInput() {
        userInput.value = '';
        userInput.style.height = '';
        autoResizeTextarea();
    }

    // 添加Enter鍵發送功能
    userInput.addEventListener('keydown', (e) => {
        // 如果按下Enter鍵且沒有按下Shift鍵
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 防止默認行為（換行）
            
            // 觸發表單提交
            const message = userInput.value.trim();
            if (message) {
                chatForm.dispatchEvent(new Event('submit')); 
                
                // 確保輸入框被清空
                setTimeout(clearInput, 10);
            }
        }
    });

    // 自動調整輸入框高度
    function autoResizeTextarea() {
        // 先將高度設為自動，以便獲取實際內容高度
        userInput.style.height = 'auto';
        // 設置新高度，但不超過max-height (由CSS控制)
        userInput.style.height = (userInput.scrollHeight) + 'px';
    }
    
    // 監聽輸入事件以調整高度
    userInput.addEventListener('input', autoResizeTextarea);
    
    // 初始化時調整一次高度
    autoResizeTextarea();

    // 檢查必要的數據
    const apiKey = localStorage.getItem('apiKey');
    const processedBookList = localStorage.getItem('processedBookList');

    if (!apiKey || !processedBookList) {
        alert('缺少必要的數據，請重新開始');
        window.location.href = 'index.html';
        return;
    }

    // 顯示歡迎訊息
    addBotMessage(`我是厭世女巫，讓我先提醒你，這裡的占卜完全隨機，我會從12個行星、12個星座和12個宮位裡擲出三顆骰子，不管你問了什麼，這些結果都隨機得像是宇宙對你的嘲笑。想好自己的問題，就可以開始問骰子了。`);

    // 處理表單提交
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // 添加用戶訊息
        addUserMessage(message);
        
        // 清空輸入框文字
        clearInput();

        // 獲取機器人回應
        await getBotResponse(message);
    });
    
    // 確保發送按鈕也能清空文字輸入框
    document.querySelector('.send-btn').addEventListener('click', () => {
        // 觸發表單提交後，再次確保輸入框被清空
        setTimeout(clearInput, 10);
    });

    // 語音輸入
    let recognition = null;
    let isRecording = false;
    let hasSubmitted = false;  // 新增：追蹤是否已經送出過請求
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'zh-TW';

        recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript;
            
            // 如果是最終結果，更新輸入框
            if (result.isFinal) {
                userInput.value = transcript;
                // 自動送出訊息，但只在還沒送出過的情況下
                const message = transcript.trim();
                if (message && !hasSubmitted) {
                    hasSubmitted = true;  // 標記已經送出
                    chatForm.dispatchEvent(new Event('submit'));
                    // 確保輸入框被清空
                    setTimeout(clearInput, 10);
                }
            } else {
                // 如果是中間結果，只更新輸入框
                userInput.value = transcript;
            }
        };

        recognition.onend = () => {
            isRecording = false;
            voiceButton.classList.remove('active');
            hasSubmitted = false;  // 重置送出狀態
        };

        voiceButton.addEventListener('click', () => {
            if (!isRecording) {
                // 開始錄音前清空輸入框
                clearInput();
                hasSubmitted = false;  // 重置送出狀態
                // 開始錄音
                recognition.start();
                isRecording = true;
                voiceButton.classList.add('active');
            } else {
                // 停止錄音
                recognition.stop();
                isRecording = false;
                voiceButton.classList.remove('active');
            }
        });
    } else {
        voiceButton.style.display = 'none';
    }

    // 清除對話
    clearButton.addEventListener('click', () => {
        if (confirm('確定要清除所有對話嗎？')) {
            chatMessages.innerHTML = '';
            addBotMessage(`我是厭世女巫，讓我先提醒你，這裡的占卜完全隨機，我會從12個行星、12個星座和12個宮位裡擲出三顆骰子，不管你問了什麼，這些結果都隨機得像是宇宙對你的嘲笑。想好自己的問題，就可以開始問骰子了。`);
        }
    });

    // 添加用戶訊息
    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = message;
        addMessageTime(messageDiv);
        
        // 將訊息添加到底部
        chatMessages.appendChild(messageDiv);
        
        // 自動滾動到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 添加機器人訊息
    function addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        // 將文字轉換為 HTML 段落
        const paragraphs = message.split('\n\n').filter(p => p.trim());
        const formattedMessage = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
        
        messageDiv.innerHTML = formattedMessage;
        addMessageTime(messageDiv);
        
        // 將訊息添加到底部
        chatMessages.appendChild(messageDiv);
        
        // 自動滾動到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 添加時間戳
    function addMessageTime(messageDiv) {
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        const now = new Date();
        timeSpan.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        messageDiv.appendChild(timeSpan);
    }

    // 隨機擲骰
    function rollDice() {
        return Math.floor(Math.random() * 12) + 1;
    }

    // 獲取機器人回應
    async function getBotResponse(userMessage) {
        // 聲明loadingId變數
        const loadingId = "loading-" + Date.now();
        
        try {
            // 添加加載訊息
            const loadingDiv = document.createElement('div');
            loadingDiv.id = loadingId;
            loadingDiv.className = 'message bot-message loading-message';
            loadingDiv.innerHTML = `
                <div class="loading-container">
                    <span class="dice-animation">🎲</span> 
                    <div class="loading-content">
                        <span class="loading-text">骰子跳動中</span>
                        <span class="loading-dots">...</span>
                    </div>
                </div>
            `;
            chatMessages.appendChild(loadingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // 添加動畫效果
            animateLoadingDots();
            
            // 擲骰子
            const diceResults = {
                planet: rollDice(),
                sign: rollDice(),
                house: rollDice()
            };

            // 獲取所有歷史訊息
            const messages = [];
            const messageElements = chatMessages.querySelectorAll('.message');
            messageElements.forEach(element => {
                const isUser = element.classList.contains('user-message');
                const content = element.textContent.trim();
                messages.push({
                    role: isUser ? 'user' : 'assistant',
                    content: content
                });
            });

            // 添加系統配置信息
            const systemConfig = {
                role: 'system',
                content: `configure_astrology_dice_bot --dice=random --style="厭世女巫" --functions="隨機擲骰, 深度解讀, 用非常厭世口吻，給予勸告與警示" --language=traditional_chinese --output_detail="豐富" --tone="多層次" --insights="深入分析" language=traditional_chinese

功能說明：
1. 隨機擲骰：隨機是最重要的任務！完全不參考提問者的問題、完全不連結提問者的問題，務必先由系統從下表三個類別，隨機12選1，擲出三顆骰子。先告訴用戶你抽到的三組號碼，再去對照出號碼代表的行星（What）、星座（How）和宮位（Where）。絕對不可以！不可以！刻意選擇最符合提問者問題的行星、星座與宮位。隨機性是占卜的最重點。一定要從隨機數字開始。

12個星座：

	1.	白羊座 (Aries)
	2.	金牛座 (Taurus)
	3.	雙子座 (Gemini)
	4.	巨蟹座 (Cancer)
	5.	獅子座 (Leo)
	6.	處女座 (Virgo)
	7.	天秤座 (Libra)
	8.	天蠍座 (Scorpio)
	9.	射手座 (Sagittarius)
	10.	摩羯座 (Capricorn)
	11.	水瓶座 (Aquarius)
	12.	雙魚座 (Pisces)

12個行星：

	1.	太陽 (Sun)
	2.	月亮 (Moon)
	3.	水星 (Mercury)
	4.	金星 (Venus)
	5.	火星 (Mars)
	6.	木星 (Jupiter)
	7.	土星 (Saturn)
	8.	天王星 (Uranus)
	9.	海王星 (Neptune)
	10.	冥王星 (Pluto)
	11.	北交點 (North Node)
	12.	南交點 (South Node)

12宮位：

	1.	第一宮 
	2.	第二宮 
	3.	第三宮 
	4.	第四宮 
	5.	第五宮 
	6.	第六宮 
	7.	第七宮 
	8.	第八宮 
	9.	第九宮 
	10.	第十宮 
	11.	第十一宮 
	12.	第十二宮 


2. 單純用數字抽出隨機的結果之後，這三個部分結合提問者的問題，使用基礎西洋占星知識，構成完整的占星解讀，涵蓋事件的背景、如何發生，以及在哪個領域影響最大。

3. 完整的解讀：每次解讀將會詳細說明三個骰子所代表的意義，確保使用者明白所問問題的背景、行為模式以及事件發展的領域。同時，解讀將基於使用者提問的具體情況進行個性化分析，善用表情符號強化重點。結構如下：
• 行星：說明事件的核心能量或焦點
• 星座：說明該能量的表現方式
• 宮位：說明影響的生活領域

4. 厭世女巫風格的對話：即便是認真的解讀，機器人仍會保持非常厭世、嘲諷的語氣，暗示某些問題的結局或許不如預期，但帶來的洞見會是有價值的。

5. 警示性建言與推薦書籍：在完整解讀後，機器人會根據骰子結果提供適當的警示和建言，提示使用者如何應對即將來臨的挑戰或障礙。這些建言將會以直接且稍帶諷刺的語氣呈現。

6. 最後根據以下書單，挑選三本最符合當前占卜主題的書籍分享給用戶：

可用的書籍清單：
${processedBookList}


7.當用戶問到三餘書店的資訊，你會告訴用戶三餘書店的位置、營業時間、聯絡方式，以及三餘名稱的由來。
你遇到不知道的資訊，你會邀請客人洽詢美麗或帥氣的店員。

 三餘書店
【營業時間】13 : 30～21 : 00
【公休日】星期二
【地址】高雄市新興區中正二路214號 （靠近尚義街）/ 高雄橘線捷運「文化中心站」1號出口

三餘書店在高雄，以人文閱讀、生活創意與藝術表演為主題的獨立書店。
迷路的孩子、愛書的朋友，還有關於高雄的風土，共同親吻也創造時間。歡迎來到三餘書店。
「三餘」指冬天夜晚雨天，三個讀書的閒餘時間。


當前骰子結果：
行星：${diceResults.planet}
星座：${diceResults.sign}
宮位：${diceResults.house}`
            };

            // 準備API請求
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        systemConfig,
                        ...messages,
                        { role: 'user', content: userMessage }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error('API 請求失敗');
            }

            const data = await response.json();
            const botResponse = data.choices[0].message.content;

            // 移除加載訊息
            loadingDiv.remove();

            // 添加機器人回應
            addBotMessage(botResponse);

        } catch (error) {
            console.error('獲取回應時發生錯誤：', error);
            // 移除加載訊息
            const loadingDiv = document.getElementById(loadingId);
            if (loadingDiv) {
                loadingDiv.remove();
            }
            // 顯示錯誤訊息
            addBotMessage('抱歉，發生了一些錯誤。請稍後再試。');
        }
    }
}); 