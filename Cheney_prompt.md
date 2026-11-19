<!-- 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash -->
# Cheney_prompt.md · 开发提示词记录

> 记录格式：**时间 | 提示词全文 | 大模型名称**。本文件只追加，禁止覆盖已有内容。
>
> 说明：本项目首次搭建发生在 2026-11-19 13:34–13:40，当时记录文件尚未建立。下面第 1–5 条为依据《全栈项目开发步骤》、AGENTS.md 与已生成文件补录的阶段指令，保留原始需求与验收标准；第 6 条为 13:54 收到的原文，后续指令将继续在文件末尾追加。

---

## 2026-11-19 13:34 | 项目初始化与首页

**提示词全文：**

```text
请初始化本项目（项目名：星穹科技资讯站；姓名：张硕；学号：24006380115；课程：高级网页设计；项目类别：自选）：
1、按 AGENTS.md 在 D:\高级网页设计\vibe_fullstack 创建 frontend/、backend/ 目录骨架，前端只用原生 HTML/CSS/JS，禁止第三方库和 CDN；
2、后端 Node.js + Express，RESTful + MVC，所有接口以 /api/ 开头，端口固定 115，express.static 托管 frontend/，开启 CORS；
3、MySQL 使用 root / 123456，库名 cheney_vibe_db，凭据只写 backend/.env 并加入 .gitignore；
4、创建前端首页 index.html，包含姓名、学号、项目名称、项目类别（自选）和所有已完成页面的超链接，带 canvas 星空背景动画，主体为页面导航，页面美观；
5、创建 readme.md，写明学号、姓名、运行方式与接口一览；
6、创建启动项目.bat，双击后进入 backend 执行 node app.js，窗口保持不关闭。
```

**大模型名称：** DeepSeek-V4.1-Flash

---

## 2026-11-19 13:35 | 数据库连接测试页

**提示词全文：**

```text
创建数据库连接测试页 database.html：提供用户名、密码、主机、端口、数据库名输入框和“测试连接”按钮；调用后端 POST /api/database/test，由后端真实连接 MySQL 并返回版本号、当前库、耗时、表信息；成功和失败都要有明确提示；默认 root / 123456；接口返回的数据和错误信息输出到浏览器控制台；首页添加入口；同步追加接口记录。
```

**大模型名称：** DeepSeek-V4.1-Flash

---

## 2026-11-19 13:36 | 科技新闻列表与详情

**提示词全文：**

```text
完成科技新闻功能：建立 Cheney_news 表（字段含标题、摘要、来源、作者、分类、封面、发布时间、阅读量），插入至少 10 条真实业务测试数据；后端按 RESTful + MVC 提供 GET /api/news（支持 keyword/category/page/pageSize）和 GET /api/news/:id（阅读量 +1）；前端新建 news.html 与 news-detail.html，用 fetch 渲染列表和详情，页面展示接口链接与返回 JSON；首页加入新闻入口；同步三份记录文件。
```

**大模型名称：** DeepSeek-V4.1-Flash

---

## 2026-11-19 13:37 | 图文列表

**提示词全文：**

```text
完成图文列表功能：新建 Cheney_gallery 表（标题、图片、简介、地点、拍摄日期、标签、排序），插入 10 条测试数据；图片使用 frontend/images/ 下本地自绘 SVG，保证离线可用；后端提供 GET /api/gallery（支持 keyword/tag/page/pageSize）和 GET /api/gallery/:id；前端新建 gallery.html 调用接口渲染，展示接口链接与返回 JSON；首页加入图文入口；同步三份记录文件。
```

**大模型名称：** DeepSeek-V4.1-Flash

---

## 2026-11-19 13:40 | 统一端口与补齐项目文档

**提示词全文：**

```text
请把项目端口统一为 115（AGENTS.md、app.js、启动项目.bat、readme 全部一致），补齐 .env、.gitignore、AGENTS.md 与 readme.md；检查所有页面、接口和静态资源可正常访问；清理 8325 端口的旧日志。
```

**大模型名称：** DeepSeek-V4.1-Flash

---

## 2026-11-19 13:54 | 继续完成 vibe_fullstack 项目

**提示词全文：**

```text
@D:\高级网页设计\vibe_fullstack/ @C:\Users\ABC\Desktop\全栈开发提示词.txt @C:\Users\ABC\Desktop\全栈项目开发步骤.html 继续在vibe文件完成
```

**大模型名称：** DeepSeek-V4.1-Flash