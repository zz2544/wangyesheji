# 星穹科技资讯站 · 基于 Vibe Coding 的全栈项目

- 学号：24006380115
- 姓名：张硕
- 课程：高级网页设计
- 项目类别：自选
- 技术栈：原生 HTML/CSS/JS（无任何第三方库、无 CDN） + Node.js/Express（RESTful + MVC） + MySQL 8.0
- 访问地址：<http://localhost:8115>

## 目录结构

```
vibe_fullstack/
├── AGENTS.md                  # 项目规则（宪法）
├── Cheney_prompt.md           # 提示词记录（只追加）
├── readme.md                  # 本文件
├── 启动项目.bat               # 一键启动后端（端口 8115）
├── frontend/                  # 前端静态资源（express.static 托管）
│   ├── index.html             # 首页：姓名/学号/项目名/类别 + canvas 动画 + 页面导航
│   ├── database.html          # 数据库连接测试页
│   ├── news.html              # 科技新闻列表页
│   ├── news-detail.html       # 新闻详情页（按 ?id= 读取单条新闻）
│   ├── gallery.html           # 图文列表页
│   ├── favicon.svg            # 站点图标（本地自绘）
│   ├── css/                   # 样式（Cheney_ 前缀）
│   ├── js/                    # 脚本（Cheney_ 前缀）
│   ├── images/                # 本地图片（20 张自绘 SVG）
│   └── fonts/                 # 字体图标目录（当前使用系统字体）
└── backend/                   # 后端 Node.js + Express
    ├── app.js                 # 入口：CORS + JSON + /api 路由 + 静态托管
    ├── .env                   # 数据库凭据（已加入 .gitignore）
    ├── config/                # 连接池与统一响应
    ├── models/                # 数据访问层（M）
    ├── controllers/           # 控制器层（C）
    ├── routes/                # 路由层
    ├── scripts/               # 初始化数据库脚本
    ├── sql/                   # 完整重建 SQL（与 Cheney_database.md 一致）
    ├── Cheney_interface.md    # 接口记录（只追加）
    └── Cheney_database.md     # 建库建表与测试数据 SQL（只追加）
```

## 运行方式

1. 确认 MySQL 服务已启动（Windows 服务名 `MySQL80`），数据库 `cheney_vibe_db` 已建好。
2. 新机器可执行 `backend/Cheney_database.md` 中的 SQL 一键重建库、表与 20 条测试数据。
3. 在 `backend` 目录执行 `npm install` 安装依赖（本机已安装）。
4. 双击根目录 `启动项目.bat`，或在 `backend` 目录执行 `node app.js`。
5. 浏览器访问 <http://localhost:8115>，控制台可见接口请求与返回日志。

> **端口说明（重要）**
>
> 作业规定端口为 **115**，但 115 是 Chromium 内核（Chrome / Edge）登记在案的保留端口（SFTP），
> 浏览器直接访问会报 `ERR_UNSAFE_PORT`，无法打开页面。
> 因此本项目实际监听 **8115**（由 `backend/.env` 的 `PORT` 指定），功能与接口路径完全不变。
> 双击 `启动项目.bat` 时，脚本会自动用 Edge 打开 `http://127.0.0.1:8115/`。
>
> 如果浏览器没有自动打开，请手动执行（路径按本机 Edge 安装位置调整）：
>
> ```bat
> "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --user-data-dir="%LOCALAPPDATA%\CheneyEdgeProfile" http://127.0.0.1:8115/
> ```

## 知识库 RAG 问答

访问 <http://localhost:8115/knowledge.html> 可上传、解析和管理知识文件，并进行带引用的智能问答。

- 支持 PDF、TXT、DOC、DOCX、PPT、PPTX，单文件最大 20MB。
- DOCX/PPTX 使用 Office Open XML 解析；旧版 DOC/PPT 依赖本机 Microsoft Word/PowerPoint 转换。
- 文档文本切分后存入 `Cheney_kb_chunks`，通过本地 TF-IDF 检索 TopK，再调用 DeepSeek 生成答案。
- `backend/knowledge-samples/` 提供产品与售后两份演示知识文件。
- 在 `backend/.env` 配置以下变量后重启服务：

```dotenv
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_MODEL=deepseek-chat
OPENAI_API_KEY=你的密钥
```

未配置密钥时仍可使用上传、管理和检索功能，模型问答会返回明确的 503 配置提示。后端终端完整打印发送给 DeepSeek 的 JSON 和接收的原始响应，不打印 API Key。

## 接口一览

| 接口 | 方法 | 参数 | 说明 |
| --- | --- | --- | --- |
| `/api/health` | GET | 无 | 服务健康检查 |
| `/api/database/test` | POST | `user`、`password` 必填；`host`、`port`、`database` 可选 | 按传入账号真实连接 MySQL，成功/失败均有明确提示 |
| `/api/database/info` | GET | 无 | 当前 `.env` 配置的库信息与表统计（不含密码） |
| `/api/news` | GET | `keyword`、`category`、`page`、`pageSize` | 科技新闻列表，按发布时间倒序，`pageSize` 上限 50 |
| `/api/news/:id` | GET | 路径参数 `id` | 科技新闻详情，每次访问阅读量 +1 |
| `/api/gallery` | GET | `keyword`、`tag`、`page`、`pageSize` | 图文列表，按排序值与拍摄日期倒序，`pageSize` 上限 50 |
| `/api/gallery/:id` | GET | 路径参数 `id` | 图文详情 |
| `/api/knowledge/upload` | POST | multipart 字段 `file` | 上传并解析知识文件，单文件最大 20MB |
| `/api/knowledge/documents` | GET | 无 | 知识文件列表与解析状态 |
| `/api/knowledge/documents/:id` | GET | 路径参数 `id` | 文件详情与知识分块 |
| `/api/knowledge/documents/:id` | DELETE | 路径参数 `id` | 删除文件、分块和服务器原文件 |
| `/api/knowledge/documents/:id/rebuild` | POST | 路径参数 `id` | 从原文件重新解析分块 |
| `/api/knowledge/chat` | POST | `question` 必填；`documentId`、`topK` 可选 | 本地检索 + DeepSeek RAG 问答，返回引用 |

统一响应格式：`{ "code": 0, "msg": "提示信息", "data": {...} }`，`code=0` 成功，非 0 失败。
参数错误返回 HTTP 400 与 `code=400`，资源不存在返回 HTTP 404 与 `code=404`；数据库连接测试失败返回 HTTP 200 与 `code=1001`，便于前端统一渲染提示。

## 记录文件

| 文件 | 内容 |
| --- | --- |
| `Cheney_prompt.md` | 每次开发指令的时间、提示词全文、大模型名称 |
| `backend/Cheney_interface.md` | 每个接口的路径、方法、参数示例、响应示例、修改时间 |
| `backend/Cheney_database.md` | 按执行顺序记录的建库、建表、INSERT SQL，可独立重建数据库 |