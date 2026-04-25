# obookmark 交互与安全优化实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 实现手动同步触发、分离式设置保存逻辑、防复制安全增强以及自动黑暗模式适配。

**架构：** 移除背景静默触发；在 Popup 中引入状态监听器控制按钮可用性；使用 CSS 媒体查询适配主题。

**技术栈：** JavaScript (ES6), CSS Variables, Chrome Extensions API.

---

### 任务 1：重构同步触发策略 (Background)

**文件：**
- 修改：`background.js`

- [ ] **步骤 1：移除自动同步逻辑**
保留 `performSync` 函数（以备将来其他手动调用），但彻底删除 `chrome.runtime.onStartup.addListener` 及其相关触发逻辑。

- [ ] **步骤 2：Commit**
`git add background.js && git commit -m "refactor: 移除后台自动同步触发逻辑"`

---

### 任务 3：重构 Popup 界面 (HTML/CSS)

**文件：**
- 修改：`popup/popup.html`
- 修改：`popup/popup.css`

- [ ] **步骤 1：修改 HTML 结构**
1. 移除 `unlock` 按钮。
2. 增加两个按钮：`id="save-btn"` (保存设置) 和 `id="sync-btn"` (立即同步)。
3. 在密码输入框添加 `oncopy="return false;"`。

- [ ] **步骤 2：实现黑暗模式适配 (CSS)**
使用 CSS 变量定义颜色，并使用 `@media (prefers-color-scheme: dark)` 覆盖。
添加 `.btn-disabled` 样式用于置灰状态。

```css
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --input-bg: #ffffff;
  --btn-save: #4caf50;
  --btn-sync: #2196f3;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1e1e1e;
    --text-color: #e0e0e0;
    --input-bg: #2d2d2d;
    --btn-save: #388e3c;
    --btn-sync: #1976d2;
  }
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
/* 输入框不可复制 */
.secure-input {
  user-select: none;
}
```

- [ ] **步骤 3：Commit**
`git add popup/* && git commit -m "style: 实现黑暗模式适配并调整按钮布局"`

---

### 任务 4：实现“脏值检测”与分离保存逻辑

**文件：**
- 修改：`popup/popup.js`

- [ ] **步骤 1：重构逻辑**
1. 定义 `savedConfig` 变量记录从 storage 加载的初始值。
2. 监听输入框的 `input` 事件，对比当前值与 `savedConfig`。
3. 若有差异，令 `save-btn` 亮起；若无差异或已点击保存，则置灰。
4. `sync-btn` 点击时，直接执行同步流程，不触发保存。

- [ ] **步骤 2：Commit**
`git add popup/popup.js && git commit -m "feat: 实现输入状态感应与分离同步逻辑"`

---

### 任务 5：验证与清理

- [ ] **步骤 1：测试同步流程**
确认点击“立即同步”能成功上传，且不影响保存设置的状态。

- [ ] **步骤 2：测试黑暗模式**
切换 Edge 浏览器的外观设置，确认扩展界面自动跟随。

- [ ] **步骤 3：测试防复制**
确认无法通过全选或右键复制密码框中的内容。
