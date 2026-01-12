# HMEICR 專案建置指南

本指南說明如何設定後端 (Flask + MongoDB) 和前端 (React)。

## 前置需求
- Python 3.11+
- Node.js & npm
- Docker & Docker Compose (選用，方便快速架設後端)

---

## 1. 後端設定

您可以使用 **Docker** (推薦) 或 **手動** 方式執行後端。

### 設定 (.env)
首先，產生必要的環境變數。

1. 在根目錄建立一個 `.env` 檔案。
2. 產生連線金鑰與秘密金鑰：
   ```bash
   # 若尚未安裝 cryptography，請先安裝
   python -m pip install cryptography
   
   # 產生 Fernet 金鑰
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```
3. 將金鑰加入您的 `.env` 檔案：
   ```env
   # .env
   EINVOICE_SECRET_KEY=貼上您產生的金鑰
   MONGO_APP_PASSWORD=password123
   secret_key=您的_flask_secret_key
   ```

### 選項 A: 使用 Docker 執行 (推薦)
這將自動建置並啟動 Flask 伺服器與 MongoDB 資料庫。

```bash
docker-compose up --build
```
伺服器將在 `http://localhost:8080` 啟動。

### 選項 B: 手動執行

1. **啟動 MongoDB**: 確保您本地已執行 MongoDB 實體，並監聽 `27017` 連接埠。
   
2. **安裝依賴套件**:
   ```bash
   pip install -r requirements.txt
   ```

3. **啟動伺服器**:
   ```bash
   python server.py
   ```
伺服器將在 `http://localhost:5000` (預設 Flask 連接埠) 啟動。

---

## 2. 前端設定 (React)

`client` 目錄保留給前端應用程式。以下是使用 Vite 建立 React 應用程式的步驟。

### 初始化 React 應用程式
如果 `client` 資料夾是空的，請初始化它：

```bash
cd client
npm create vite@latest . -- --template react
npm install
```

### 安裝常用依賴套件
一般儀表板應用程式可能需要以下套件：

```bash
npm install axios react-router-dom
# 選用: 安裝 TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 啟動前端
啟動開發伺服器：

```bash
npm run dev
```
前端通常會在 `http://localhost:5173` 啟動。

### 連線至後端
確保您的 React 應用程式 API 呼叫指向後端 URL (例如使用 Docker 時為 `http://localhost:8080`，手動時為 `http://localhost:5000`)。您可能需要在 `vite.config.js` 中設定代理 (proxy) 以避免開發時的跨域 (CORS) 問題：

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 或 http://localhost:5000
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // ... 其他設定
})
```
