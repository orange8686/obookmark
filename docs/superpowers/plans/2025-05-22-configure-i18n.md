# 配置 i18n 环境与多语言包 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 配置 obookmark 扩展的 i18n 环境，并提供中英文多语言包。

**架构：** 使用 Chrome 扩展的标准 i18n 机制，通过 `_locales` 目录管理语言包，并在 `manifest.json` 中定义默认语言。

**技术栈：** Chrome Extension i18n API, JSON

---

### 任务 1：更新 manifest.json

**文件：**
- 修改：`D:\Agent\obookmark\manifest.json`

- [ ] **步骤 1：读取并分析 manifest.json**
- [ ] **步骤 2：添加 default_locale**
在根级别添加 `"default_locale": "zh_CN"`。

- [ ] **步骤 3：验证 manifest.json 格式**
确保 JSON 格式正确。

### 任务 2：创建多语言包文件

**文件：**
- 创建：`D:\Agent\obookmark\_locales/en/messages.json`
- 创建：`D:\Agent\obookmark\_locales/zh_CN/messages.json`

- [ ] **步骤 1：创建目录结构**
创建 `_locales/en/` 和 `_locales/zh_CN/` 目录。

- [ ] **步骤 2：编写英文语言包 (en)**
包含 `extName`, `extDesc`, `settingsTitle`, `urlLabel`, `usernameLabel`, `passwordLabel`, `saveBtn`, `statusSaving`, `statusSuccess`, `statusError`, `unlockBtn` 的翻译。

- [ ] **步骤 3：编写中文语言包 (zh_CN)**
包含相同的键值对，对应中文翻译。

- [ ] **步骤 4：验证文件内容**
确保 JSON 格式正确且键值对完整。

### 任务 3：提交变更

**文件：**
- Git 提交

- [ ] **步骤 1：执行 git add**
添加所有修改和新创建的文件。

- [ ] **步骤 2：执行 git commit**
使用 `chinese-commit-conventions` 规范进行提交。
类型：`chore`
范围：`i18n`
描述：`配置 i18n 环境并添加中英文语言包`
