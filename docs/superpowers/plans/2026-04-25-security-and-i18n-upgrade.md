# obookmark 安全与多语言升级实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 实现多语言支持，并通过“安全锁屏”和“存储混淆”强化隐私信息安全。

**架构：** 使用 `chrome.i18n` 管理文本；使用自定义 `crypto.js` 处理数据脱敏；在 Popup 中实现“锁定/解锁”状态机。

**技术栈：** JavaScript (Vanilla ES6), Chrome i18n API.

---

### 任务 1：配置 i18n 环境与多语言包

**文件：**
- 修改：`manifest.json`
- 创建：`_locales/en/messages.json`
- 创建：`_locales/zh_CN/messages.json`

- [ ] **步骤 1：更新 `manifest.json`**
添加 `"default_locale": "zh_CN"`。

- [ ] **步骤 2：创建中英语言包**
定义以下 key：`extName`, `extDesc`, `settingsTitle`, `urlLabel`, `usernameLabel`, `passwordLabel`, `saveBtn`, `statusSaving`, `statusSuccess`, `statusError`, `unlockBtn`。

- [ ] **步骤 3：Commit**
`git add . && git commit -m "feat: configure i18n and add locale files"`

---

### 任务 2：实现凭据混淆工具模块

**文件：**
- 创建：`lib/crypto.js`

- [ ] **步骤 1：编写混淆函数**
实现 `obfuscate(text)` 和 `deobfuscate(text)`。
使用 `btoa` 和一个简单的字符串转换逻辑，确保存存在 storage 里的不是原始明文。

```javascript
// lib/crypto.js
const SALT = "ob-salt-2026";
export function obfuscate(str) {
  if (!str) return "";
  return btoa(unescape(encodeURIComponent(str + SALT)));
}
export function deobfuscate(obfuscated) {
  if (!obfuscated) return "";
  const raw = decodeURIComponent(escape(atob(obfuscated)));
  return raw.endsWith(SALT) ? raw.slice(0, -SALT.length) : raw;
}
```

- [ ] **步骤 2：Commit**
`git add lib/crypto.js && git commit -m "feat: add credential obfuscation utility"`

---

### 任务 3：重构 Popup UI 以支持 i18n 和安全锁

**文件：**
- 修改：`popup/popup.html`
- 修改：`popup/popup.css`

- [ ] **步骤 1：修改 HTML**
1. 为所有文本元素添加 `data-i18n` 属性。
2. 为用户名和密码输入框容器添加“解锁”按钮（ID: `unlock-btn`）。
3. 为输入框添加 `readonly` 和 `locked` class 初始状态。

- [ ] **步骤 2：更新 CSS**
1. 添加 `.locked` 状态下的背景色（浅灰）和 `user-select: none`。
2. 设计解锁按钮的悬浮和点击反馈。

- [ ] **步骤 3：Commit**
`git add popup/* && git commit -m "style: update popup UI for i18n and security lock"`

---

### 任务 4：重构 Popup 逻辑 (锁定状态机与 i18n)

**文件：**
- 修改：`popup/popup.js`

- [ ] **步骤 1：实现 i18n 加载器**
启动时调用 `chrome.i18n.getMessage` 替换 `data-i18n` 元素的内容。

- [ ] **步骤 2：实现锁定逻辑**
1. `updateUILockState(isLocked)`: 控制输入框的 `readOnly` 属性和按钮文字/图标。
2. 页面加载时：如果已保存配置，则自动进入“锁定”状态，并对用户名进行掩码处理（如 `adm***`）。

- [ ] **步骤 3：集成解密逻辑**
在读取 storage 时解密，在写入前加密。

- [ ] **步骤 4：Commit**
`git add popup/popup.js && git commit -m "feat: implement popup lock state machine and i18n logic"`

---

### 任务 5：更新后台与 WebDAV 模块

**文件：**
- 修改：`background.js`
- 修改：`lib/webdav.js` (如果需要适配解密数据)

- [ ] **步骤 1：更新 `background.js`**
在调用同步前，使用 `deobfuscate` 还原凭据。

- [ ] **步骤 2：Commit**
`git add . && git commit -m "feat: update background service to support deobfuscation"`

---

### 任务 6：验证与测试

- [ ] **步骤 1：测试语言切换**
将 Edge 语言切换为英文，确认界面文本正确变为英文。

- [ ] **步骤 2：测试安全锁定**
保存后刷新 Popup，确认无法直接全选复制用户名和密码。点击“解锁”后方可编辑。

- [ ] **步骤 3：最终 Commit**
清理测试代码。
