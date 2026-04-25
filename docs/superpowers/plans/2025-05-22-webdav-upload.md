# 实现 WebDAV 上传逻辑 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 实现 WebDAV 上传功能，将书签 HTML 文件同步到 WebDAV 服务器。

**架构：** 在 `lib/webdav.js` 中导出一个 `uploadToWebDAV(config, content)` 函数。该函数通过 Fetch API 发送 PUT 请求，并使用 HTTP Basic Authentication 进行身份验证。

**技术栈：** JavaScript (ES Modules), Fetch API.

---

### 任务 1：实现 WebDAV 上传函数

**文件：**
- 创建：`lib/webdav.js`

- [x] **步骤 1：编写 WebDAV 上传逻辑**

实现 `uploadToWebDAV` 函数，处理 URL 拼接（确保以 `bookmarks.html` 结尾），构造 Authorization 头部，并发送 PUT 请求。

```javascript
export async function uploadToWebDAV(config, content) {
  const { url, username, password } = config;
  
  // 确保 URL 以 bookmarks.html 结尾
  let targetUrl = url;
  if (!targetUrl.endsWith('bookmarks.html')) {
    if (!targetUrl.endsWith('/')) {
      targetUrl += '/';
    }
    targetUrl += 'bookmarks.html';
  }

  // 构造 Basic Auth 头部
  const auth = btoa(`${username}:${password}`);
  
  const response = await fetch(targetUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'text/html; charset=UTF-8'
    },
    body: content
  });

  if (!response.ok) {
    throw new Error(`WebDAV upload failed: ${response.status} ${response.statusText}`);
  }

  return response;
}
```

- [x] **步骤 2：Commit**

```bash
git add lib/webdav.js
git commit -m "feat: implement WebDAV upload logic"
```
