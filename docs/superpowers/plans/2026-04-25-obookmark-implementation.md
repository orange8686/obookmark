# obookmark 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 构建一个 Edge 扩展，定时将书签导出为 `bookmarks.html` 并同步到 WebDAV 服务器。

**架构：** 使用 Manifest V3，包含后台 Service Worker (监听启动) 和 Popup UI (配置与手动触发)。核心逻辑分为书签解析和 WebDAV 上传两个模块。

**技术栈：** JavaScript (Vanilla ES6), Chrome Extensions API (Manifest V3).

---

### 任务 1：初始化项目结构与 Manifest

**文件：**
- 创建：`manifest.json`
- 创建：`icons/icon48.png` (占位图)

- [ ] **步骤 1：编写 `manifest.json`**

```json
{
  "manifest_version": 3,
  "name": "obookmark",
  "version": "1.0.0",
  "description": "Auto-sync bookmarks to WebDAV as bookmarks.html",
  "permissions": ["bookmarks", "storage"],
  "action": {
    "default_popup": "popup/popup.html"
  },
  "background": {
    "service_worker": "background.js"
  },
  "icons": {
    "48": "icons/icon48.png"
  }
}
```

- [ ] **步骤 2：创建图标目录并添加占位图**

运行：`mkdir icons`
（我将为您生成一个简单的 48x48 像素图标或使用占位符）

- [ ] **步骤 3：Commit**

```bash
git add manifest.json
git commit -m "chore: initialize manifest and project structure"
```

---

### 任务 2：实现书签解析逻辑 (Netscape 格式)

**文件：**
- 创建：`lib/parser.js`

- [ ] **步骤 1：编写解析器代码**

```javascript
// lib/parser.js
export function bookmarksToHTML(bookmarkTreeNodes) {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>\n`;

  function walk(nodes, indent) {
    let result = "";
    const spacing = "    ".repeat(indent);
    for (const node of nodes) {
      if (node.url) {
        result += `${spacing}<DT><A HREF="${node.url}" ADD_DATE="${Math.floor(node.dateAdded / 1000)}">${node.title}</A>\n`;
      } else if (node.children) {
        result += `${spacing}<DT><H3 ADD_DATE="${Math.floor(node.dateAdded / 1000)}">${node.title}</H3>\n`;
        result += `${spacing}<DL><p>\n`;
        result += walk(node.children, indent + 1);
        result += `${spacing}</DL><p>\n`;
      }
    }
    return result;
  }

  // 假设根节点是数组，第一个通常是 'root'
  html += walk(bookmarkTreeNodes[0].children, 1);
  html += "</DL><p>";
  return html;
}
```

- [ ] **步骤 2：Commit**

```bash
git add lib/parser.js
git commit -m "feat: implement Netscape bookmark parser"
```

---

### 任务 3：实现 WebDAV 上传逻辑

**文件：**
- 创建：`lib/webdav.js`

- [ ] **步骤 1：编写 WebDAV 上传函数**

```javascript
// lib/webdav.js
export async function uploadToWebDAV(config, content) {
  const { url, username, password } = config;
  const auth = btoa(`${username}:${password}`);
  const targetUrl = url.endsWith('/') ? `${url}bookmarks.html` : `${url}/bookmarks.html`;

  const response = await fetch(targetUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'text/html; charset=UTF-8'
    },
    body: content
  });

  if (!response.ok) {
    throw new Error(`WebDAV upload failed: ${response.statusText}`);
  }
  return true;
}
```

- [ ] **步骤 2：Commit**

```bash
git add lib/webdav.js
git commit -m "feat: implement WebDAV upload client"
```

---

### 任务 4：开发 Popup 设置界面

**文件：**
- 创建：`popup/popup.html`
- 创建：`popup/popup.js`
- 创建：`popup/popup.css`

- [ ] **步骤 1：编写 HTML 结构**

```html
<!-- popup/popup.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <h3>obookmark 设置</h3>
  <div class="field">
    <label>WebDAV URL:</label>
    <input type="text" id="url" placeholder="https://example.com/dav/">
  </div>
  <div class="field">
    <label>用户名:</label>
    <input type="text" id="username">
  </div>
  <div class="field">
    <label>密码:</label>
    <input type="password" id="password">
  </div>
  <button id="save">保存并同步</button>
  <div id="status"></div>
  <script type="module" src="popup.js"></script>
</body>
</html>
```

- [ ] **步骤 2：编写交互逻辑**

```javascript
// popup/popup.js
import { bookmarksToHTML } from '../lib/parser.js';
import { uploadToWebDAV } from '../lib/webdav.js';

document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.storage.local.get(['url', 'username', 'password', 'lastSync']);
  if (data.url) document.getElementById('url').value = data.url;
  if (data.username) document.getElementById('username').value = data.username;
  if (data.password) document.getElementById('password').value = data.password;
  if (data.lastSync) document.getElementById('status').innerText = `上次同步: ${new Date(data.lastSync).toLocaleString()}`;
});

document.getElementById('save').addEventListener('click', async () => {
  const config = {
    url: document.getElementById('url').value,
    username: document.getElementById('username').value,
    password: document.getElementById('password').value
  };

  document.getElementById('status').innerText = '正在同步...';
  
  try {
    await chrome.storage.local.set(config);
    const tree = await chrome.bookmarks.getTree();
    const html = bookmarksToHTML(tree);
    await uploadToWebDAV(config, html);
    const now = Date.now();
    await chrome.storage.local.set({ lastSync: now });
    document.getElementById('status').innerText = `同步成功! ${new Date(now).toLocaleTimeString()}`;
  } catch (err) {
    document.getElementById('status').innerText = `错误: ${err.message}`;
  }
});
```

- [ ] **步骤 3：Commit**

```bash
git add popup/*
git commit -m "feat: implement popup UI and manual sync"
```

---

### 任务 5：实现后台自动同步 (Background SW)

**文件：**
- 创建：`background.js`

- [ ] **步骤 1：编写启动触发逻辑**

```javascript
// background.js
import { bookmarksToHTML } from './lib/parser.js';
import { uploadToWebDAV } from './lib/webdav.js';

async function performSync() {
  const data = await chrome.storage.local.get(['url', 'username', 'password']);
  if (!data.url || !data.username || !data.password) return;

  try {
    const tree = await chrome.bookmarks.getTree();
    const html = bookmarksToHTML(tree);
    await uploadToWebDAV(data, html);
    await chrome.storage.local.set({ lastSync: Date.now() });
    console.log('Auto-sync successful');
  } catch (err) {
    console.error('Auto-sync failed:', err);
  }
}

chrome.runtime.onStartup.addListener(performSync);
```

- [ ] **步骤 2：Commit**

```bash
git add background.js
git commit -m "feat: implement auto-sync on startup"
```

---

### 任务 6：验证与测试

- [ ] **步骤 1：手动测试导出格式**
使用 `popup.js` 导出的内容，保存为 `.html` 后在浏览器中打开，确认书签层级正确。

- [ ] **步骤 2：测试错误反馈**
故意输入错误的 WebDAV 地址，确认 Popup 能正确显示“错误: WebDAV upload failed”。

- [ ] **步骤 3：最终整理**
移除所有 `console.log`。
