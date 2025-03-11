# 厭世女巫的書店 - 使用手冊

## 系統概述
這是一個結合占星骰子與書籍推薦的互動系統，讓顧客可以透過提問獲得隨機的占卜結果，並得到相應的書籍推薦。

## 登入資訊
- 管理者帳號：`[私下提供]`
- 管理者密碼：`[私下提供]`

## OpenAI API 設定
- API Key：`[私下提供]` （請見最後面解說）
- 請妥善保管 API Key，不要分享給顧客
- 系統會自動在本地儲存 API Key，方便下次使用


## 使用流程

### 1. 系統初始化
1. 進入系統後，會先看到登入視窗
2. 輸入管理者帳號密碼
3. 登入成功後，進入主設定頁面

### 2. 設定圖書清單
1. 在文字框中貼上最新的推薦圖書清單
2. 確認 API Key 已正確設定
3. 點擊「下一步」進入編輯頁面

### 3. 編輯頁面（Edit）
1. 系統會自動處理並格式化您貼上的圖書清單
2. 檢查清單格式是否正確
3. 還可以填寫歡迎訊息
3. 確認無誤後，點擊「進入歡迎頁」
4. 如果需要修改清單，可以：
   - 點擊「返回」回到上一步
   - 重新貼上更新後的清單

### 4. 歡迎頁面（Magic）
1. 這是顧客看到的第一個頁面
2. 頁面會顯示星空背景和歡迎訊息
3. 點擊「開始占卜」按鈕進入聊天介面
4. 如果登入失敗或發生錯誤，系統也會跳轉到此頁面

### 5. 聊天介面（Chat）
1. 顧客可以：
   - 直接輸入文字提問
   - 使用語音輸入功能（點擊麥克風圖示）
   - 按下 Enter 鍵或點擊發送按鈕送出問題

2. 系統會：
   - 隨機擲出三顆骰子（行星、星座、宮位）
   - 根據骰子結果進行占卜解讀
   - 推薦三本相關書籍

3. 錯誤處理：
   - 如果系統在聊天過程中出現異常
   - 會顯示相應的錯誤訊息
   - 可以點擊「清除對話」重新開始

### 6. 系統維護
- 可以隨時點擊「清除對話」按鈕重新開始
- 系統會自動保存對話歷史
- 如果需要更新圖書清單，可以重新登入系統

## 注意事項
1. 請勿將管理者帳號密碼分享給顧客
2. API Key 僅供內部使用，請勿外流
3. 定期更新圖書清單以確保推薦的書籍都是最新的
4. 如果系統出現異常，可以：
   - 清除瀏覽器快取
   - 重新登入系統
   - 確認 API Key 是否有效

## 技術支援
如遇到技術問題，請聯繫系統開發者：義守大學陳嘉暐


## 系統更新
系統會定期更新，請關注 GitHub 倉庫的更新通知：
https://github.com/weisfx0705/takaobooks 

### OpenAI API Key 說明
OpenAI API Key 是使用 ChatGPT 服務的密鑰，就像是通往 AI 功能的鑰匙。您需要此密鑰才能啟動本系統的智慧推薦功能。

#### 什麼是 OpenAI API Key？
- 這是一串由字母和數字組成的代碼，以 `sk-` 開頭
- 它允許您的應用程式連接到 OpenAI 的 AI 服務
- 使用 API Key 是需要付費的，但費用通常很低（每次對話約幾分錢）

#### 如何獲取 OpenAI API Key？
1. 註冊 OpenAI 帳號：前往 [OpenAI 官網](https://openai.com/)
2. 添加付款方式：需要提供信用卡資訊
3. 創建新的 API Key：在帳戶設定中找到 API 部分

#### 詳細申請教學
請參考以下教學網址，瞭解如何一步步申請 OpenAI API Key：
[OpenAI API Key 申請教學](https://www.wordss.ai/blog/how-to-get-openai-api-key)

#### 注意事項
- API Key 就像密碼，請妥善保管，不要分享給他人
- 如果您認為 API Key 已被洩露，請立即在 OpenAI 網站上重新生成
- 本系統僅在本地儲存 API Key，不會傳送到我們的伺服器
