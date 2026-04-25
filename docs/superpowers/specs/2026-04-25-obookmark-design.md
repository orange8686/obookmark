# obookmark 设计规格说明书

## 1. 项目概述
`obookmark` 是一款为 Microsoft Edge 浏览器设计的扩展插件，旨在自动化备份用户的收藏夹。它将书签导出为标准的 Netscape HTML 格式（命名为 `bookmarks.html`），并利用 WebDAV 协议将其同步到用户指定的远程服务器。

## 2. 核心功能
- **定时导出：** 在浏览器启动时自动触发书签导出。
- **格式转换：** 将浏览器内部书签树转换为标准的 `bookmarks.html` 格式，确保跨平台兼容性。
- **WebDAV 同步：** 使用 `PUT` 方法将文件上传至指定的 WebDAV 路径。
- **配置管理：** 提供弹出式窗口（Popup）用于设置 WebDAV 服务器地址、用户名、密码。
- **状态监控：** 记录并显示上次同步的时间及结果。

## 3. 技术架构 (Manifest V3)

### 3.1 核心组件
- **Background Service Worker (`background.js`):**
    - 监听 `runtime.onStartup` 事件触发同步。
    - 维护同步逻辑的核心流程。
- **Popup UI (`popup.html/js`):**
    - 提供 WebDAV 凭据的输入表单。
    - 显示当前同步状态和手动同步按钮。
- **Bookmark Parser (`parser.js`):**
    - 递归处理 `chrome.bookmarks.getTree()` 返回的对象，生成 HTML 字符串。
- **Storage:**
    - 使用 `chrome.storage.local` 持久化用户配置和同步日志。

### 3.2 权限要求
- `bookmarks`: 读取收藏夹内容。
- `storage`: 存储 WebDAV 路径及认证信息。

### 3.3 数据安全
- 账号密码仅存储在用户本地浏览器的 `chrome.storage.local` 中。
- 同步过程使用标准的 HTTPS 请求，支持 Basic Authentication。

## 4. 交互流程
1. **用户配置：** 用户点击扩展图标 -> 填写 WebDAV 信息 -> 点击“测试并保存”。
2. **自动触发：** 浏览器启动 -> Service Worker 唤醒 -> 执行备份逻辑。
3. **书签解析：** 将 JSON 书签树转换为符合 Netscape-bookmark-file-1 规范的 HTML。
4. **上传：** 构造 WebDAV `PUT` 请求 -> 发送文件流 -> 检查响应状态（200/201/204）。
5. **反馈：** 成功则更新 `lastSyncTime`；失败则记录错误并更新 UI。

## 5. 约束与限制
- **浏览器环境：** 仅支持支持 Manifest V3 的 Chromium 内核浏览器（重点为 Edge）。
- **同步时机：** 浏览器关闭时的 `onSuspend` 事件在某些情况下可能无法保证 HTTP 请求完成，因此重点依赖 `onStartup` 补偿同步。
