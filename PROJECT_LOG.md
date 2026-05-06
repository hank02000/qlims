# QLIMS 專案建置日誌

## 專案資訊
- **名稱**：全利進銷存管理系統 (QLIMS)
- **GitHub**：https://github.com/hank02000/qlims
- **Vercel**：https://qlims-gules.vercel.app

---

## 1. 建立專案結構

```
~/GitProject/qlims/
├── api/
│   └── inventory.js      # Serverless API
├── public/
│   └── index.html        # 前端頁面
├── vercel.json           # Vercel 設定
└── package.json          # Node 設定
```

### api/inventory.js
```javascript
const { google } = require('googleapis');

module.exports = async (req, res) => {
  const { GOOGLE_SHEETS_API_KEY, SHEET_ID } = process.env;
  
  if (!GOOGLE_SHEETS_API_KEY || !SHEET_ID) {
    return res.status(500).json({ error: 'API Key not configured' });
  }

  const auth = new google.auth.GoogleAuth({
    key: GOOGLE_SHEETS_API_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: '記錄!A:G',
    });

    const rows = response.data.values || [];
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### public/index.html
簡易的前端查詢頁面

### vercel.json
```json
{
  "functions": {
    "api/inventory.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### package.json
```json
{
  "name": "qlims",
  "version": "1.0.0",
  "description": "全利進銷存管理系統",
  "main": "api/inventory.js",
  "scripts": {
    "start": "vercel"
  },
  "dependencies": {
    "googleapis": "^100.0.0"
  }
}
```

---

## 2. Git 操作

### 初始化 Git
```bash
cd ~/GitProject/qlims
git init
git add .
git commit -m "Initial commit"
```

### SSH Key 設定
```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N "" -q
```

產生的檔案：
- `~/.ssh/id_ed25519` - 私密鑰
- `~/.ssh/id_ed25519.pub` - 公開鑰

### 加入 GitHub
1. 將 `~/.ssh/id_ed25519.pub` 內容複製
2. 去 GitHub → Settings → SSH and GPG keys → New SSH key
3. 貼上公開鑰

### Push 到 GitHub
```bash
git remote add origin git@github.com:hank02000/qlims.git
git push -u origin main
```

---

## 3. Vercel 部署

### 部署流程
1. 登入 https://vercel.com
2. Import GitHub repo: `hank02000/qlims`
3. Deploy

### 環境變數（需設定）
| 變數名 | 值 |
|--------|-----|
| `GOOGLE_SHEETS_API_KEY` | 你的 Google API Key |
| `SHEET_ID` | `1dMKWZWYUmCW4iZCYkA5XDjE9GG5SQ8D82wRqV9XQOkU` |

### 修復的問題
- 錯誤：`sh: line 1: vercel: command not found`
- 原因：`package.json` 有 `"build": "vercel build"` script
- 修復：移除 build script，Vercel 會自動處理

---

## 4. LINE Bot（GAS）

### 功能
- 監聽 LINE 群組訊息
- 解析格式：`#貨號，客戶代號，訂貨內容`
- 支援全形逗號（，）和半形逗號（,）

### Code
```javascript
function doPost(e) {
  const contents = e.postData.contents;
  const json = JSON.parse(contents);
  const events = json.events;
  if (events && events.length > 0) {
    events.forEach(processEvent);
  }
  return HtmlService.createHtmlOutput('OK');
}

function processEvent(event) {
  if (event.source.type !== 'group') return;
  if (event.message.type !== 'text') return;
  
  const messageText = event.message.text;
  if (messageText.indexOf('#') === -1) return;
  
  const parts = messageText.replace('#', '').split(/[，,]/);
  if (parts.length < 3) return;
  
  const 貨號 = parts[0].trim();
  const 客戶代號 = parts[1].trim();
  const 訂貨內容 = parts[2].trim();
  
  appendToSheet(new Date().toLocaleString(), '群組', '用戶', messageText, 貨號, 客戶代號, 訂貨內容);
  replyMessage(event.replyToken, '已記錄：' + 貨號 + ' / ' + 客戶代號 + ' / ' + 訂貨內容);
}

function appendToSheet(timestamp, groupName, userName, message, 貨號, 客戶代號, 訂貨內容) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  sheet.appendRow([timestamp, groupName, userName, message, 貨號, 客戶代號, 訂貨內容]);
}
```

---

## 5. Google Sheets

- **Sheet ID**: `1dMKWZWYUmCW4iZCYkA5XDjE9GG5SQ8D82wRqV9XQOkU`
- **工作表名稱**: `記錄`
- **欄位**: 時間、群組、用戶、原始訊息、貨號、客戶代號、訂貨內容