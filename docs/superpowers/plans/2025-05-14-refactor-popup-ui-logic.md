# 重构 Popup UI 与逻辑 (i18n + 安全锁屏) 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在 `popup` 中实现 i18n 多语言支持和安全锁屏逻辑，提高用户体验和数据安全性。

**架构：**
1. **i18n：** 使用 `data-i18n` 属性标记需要翻译的元素，并在页面加载时通过 `chrome.i18n.getMessage` 替换。
2. **安全锁屏：** 
   - 默认进入锁定状态（如果已存在配置）。
   - 锁定状态下，输入框禁用，用户名脱敏显示。
   - 提供“解锁”按钮，点击后恢复明文并允许编辑。
   - 数据保存前使用 `obfuscate` 混淆。

**技术栈：** HTML, CSS, JavaScript (ES Modules), Chrome Extension API (i18n, storage).

---

### 任务 1：UI 改造 (popup.html & popup.css)

**文件：**
- 修改：`popup/popup.html`
- 修改：`popup/popup.css`

- [ ] **步骤 1：在 `popup.html` 中添加 `data-i18n` 属性**
  - 为 `h1`, `label`, `button`, `placeholder` 等添加 `data-i18n`。
  - 添加“解锁”按钮。

- [ ] **步骤 2：在 `popup.css` 中增加锁屏状态样式**
  - 添加 `.locked` 相关的样式（禁选、背景色等）。
  - 优化按钮和输入框在锁定状态下的视觉效果。

- [ ] **步骤 3：Commit**
  ```bash
  git add popup/popup.html popup/popup.css
  git commit -m "style: add i18n attributes and locked state styles to popup"
  ```

---

### 任务 2：实现 i18n 与锁屏逻辑 (popup.js)

**文件：**
- 修改：`popup/popup.js`

- [ ] **步骤 1：引入 `lib/crypto.js` 并初始化 i18n**
  - 使用 `import { obfuscate, deobfuscate } from '../lib/crypto.js';`。
  - 编写 `applyI18n()` 函数遍历 `data-i18n` 并翻译。

- [ ] **步骤 2：实现脱敏逻辑 `maskValue(str)`**
  - 例如 `adm***`。

- [ ] **步骤 3：实现锁屏与解锁逻辑**
  - `lockUI(result)`: 禁用输入框，脱敏显示，显示解锁按钮。
  - `unlockUI()`: 恢复明文，启用输入框。

- [ ] **步骤 4：重构保存逻辑**
  - 保存前调用 `obfuscate`。

- [ ] **步骤 5：验证 i18n 加载**
  - 确认页面加载时文字已翻译。

- [ ] **步骤 6：Commit**
  ```bash
  git add popup/popup.js
  git commit -m "feat: implement i18n and security lock logic in popup"
  ```

---

### 任务 3：最终验证

- [ ] **步骤 1：手动/自动化检查**
  - 检查中文环境下是否正确显示。
  - 检查配置存在时是否自动锁定。
  - 检查解锁后数据是否完整。
  - 检查保存后的 `chrome.storage.local` 是否为混淆值。

- [ ] **步骤 2：完成任务报告**
