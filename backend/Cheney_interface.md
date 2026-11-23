<!-- 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash -->
# Cheney_interface.md · 后端接口记录

> 项目：星穹科技资讯站　|　服务地址：`http://localhost:115`　|　接口前缀：`/api`
>
> 本文件按“创建/修改时间”追加记录，只增不删。所有接口均支持跨域（CORS），统一返回 `{ code, msg, data }`：`code=0` 成功，非 0 失败。

## 0. 通用约定

| 项目 | 说明 |
| --- | --- |
| 响应结构 | `{ "code": 0, "msg": "提示信息", "data": {...} }` |
| 成功 | HTTP 200，`code=0` |
| 参数错误 | HTTP 400，`code=400`，`data={}` |
| 资源不存在 | HTTP 404，`code=404`，`data={}` |
| 数据库连接失败 | HTTP 200，`code=1001`，`data={}`（便于前端统一渲染） |
| 服务器异常 | HTTP 500，`code=500`，`data={}` |
| 时间格式 | `dateStrings: true`，日期时间返回 `YYYY-MM-DD HH:mm:ss`，日期返回 `YYYY-MM-DD` |

---

## 1. 服务健康检查

- **接口路径**：`/api/health`
- **HTTP 方法**：`GET`
- **请求参数**：无
- **修改时间**：2026-11-19 13:35
- **响应示例**：

```json
{
  "code": 0,
  "msg": "服务运行正常",
  "data": {
    "cheney_service": "星穹科技资讯站后端",
    "cheney_time": "2026/11/19 14:06:00",
    "cheney_version": "1.0.0"
  }
}
```

---

## 2. 数据库连接测试

- **接口路径**：`/api/database/test`
- **HTTP 方法**：`POST`
- **Content-Type**：`application/json`
- **请求参数**：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `user` | string | 是 | MySQL 用户名 |
| `password` | string | 是 | MySQL 密码 |
| `host` | string | 否 | 主机，缺省取 `.env` 的 `DB_HOST` |
| `port` | number/string | 否 | 端口，缺省取 `.env` 的 `DB_PORT` |
| `database` | string | 否 | 数据库名，缺省不指定 |

- **请求示例**：

```json
{
  "user": "root",
  "password": "******",
  "host": "127.0.0.1",
  "port": "3306",
  "database": "cheney_vibe_db"
}
```

- **成功响应**（HTTP 200）：

```json
{
  "code": 0,
  "msg": "连接成功，MySQL 版本 8.0.30，耗时 11 ms",
  "data": {
    "cheney_version": "8.0.30",
    "cheney_database": "cheney_vibe_db",
    "cheney_cost": 11,
    "cheney_tables": [
      { "cheney_table": "cheney_gallery", "cheney_rows": 10 },
      { "cheney_table": "cheney_news", "cheney_rows": 10 }
    ]
  }
}
```

- **失败响应**（账号密码错误，HTTP 200）：

```json
{
  "code": 1001,
  "msg": "连接失败：ER_ACCESS_DENIED_ERROR · Access denied for user 'root'@'localhost' (using password: YES)",
  "data": {}
}
```

- **参数缺失**（HTTP 400）：

```json
{ "code": 400, "msg": "用户名和密码不能为空", "data": {} }
```

- **实现说明**：使用 `mysql2/promise` 临时连接，5 秒连接超时；成功后读取 `VERSION()`、`DATABASE()`，再查询 `information_schema.TABLES` 获取当前库表名与估算行数，最后关闭连接。
- **修改时间**：2026-11-19 13:35（2026-11-19 14:06 复核）

---

## 3. 当前数据库信息

- **接口路径**：`/api/database/info`
- **HTTP 方法**：`GET`
- **请求参数**：无（读取 `backend/.env`，不返回密码）
- **成功响应**（HTTP 200）：

```json
{
  "code": 0,
  "msg": "当前数据库信息获取成功",
  "data": {
    "cheney_host": "127.0.0.1",
    "cheney_port": 3306,
    "cheney_user": "root",
    "cheney_database": "cheney_vibe_db",
    "cheney_charset": "utf8mb4",
    "cheney_tables": [
      { "cheney_table": "cheney_gallery", "cheney_rows": 10 },
      { "cheney_table": "cheney_news", "cheney_rows": 10 }
    ],
    "cheney_newsCount": 10,
    "cheney_galleryCount": 10
  }
}
```

- **说明**：Windows 下 MySQL 默认 `lower_case_table_names=1`，`information_schema` 返回的表名为小写；业务 SQL 仍统一书写 `Cheney_news` / `Cheney_gallery`。
- **修改时间**：2026-11-19 13:35（2026-11-19 14:06 复核）

---

## 4. 科技新闻列表

- **接口路径**：`/api/news`
- **HTTP 方法**：`GET`
- **请求参数**：

| 参数 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `keyword` | string | 否 | 空 | 标题或摘要模糊匹配 |
| `category` | string | 否 | 空 | 分类精确匹配，如 `人工智能` |
| `page` | number | 否 | 1 | 页码，小于 1 时按 1 处理 |
| `pageSize` | number | 否 | 10 | 每页条数，范围 1–50 |

- **请求示例**：`GET /api/news?keyword=芯片&category=芯片&page=1&pageSize=3`
- **成功响应**（HTTP 200，示例截取 1 条）：

```json
{
  "code": 0,
  "msg": "新闻列表获取成功",
  "data": {
    "cheney_total": 10,
    "cheney_page": 1,
    "cheney_pageSize": 1,
    "cheney_list": [
      {
        "Cheney_id": 1,
        "Cheney_title": "国产 3nm 车规级智驾芯片量产落地",
        "Cheney_summary": "国内首条 3nm 车规级智能驾驶芯片产线在合肥完成良率爬坡，单颗芯片算力 512 TOPS，已获三家车企定点，预计 2027 年一季度装车。",
        "Cheney_source": "星穹科技观察",
        "Cheney_author": "张硕",
        "Cheney_category": "芯片",
        "Cheney_cover": "images/Cheney_news_chip.svg",
        "Cheney_publish_time": "2026-11-18 09:20:00",
        "Cheney_views": 18643
      }
    ]
  }
}
```

- **排序**：`Cheney_publish_time DESC`。
- **修改时间**：2026-11-19 13:36（2026-11-19 14:06 复核）

---

## 5. 科技新闻详情

- **接口路径**：`/api/news/:id`
- **HTTP 方法**：`GET`
- **请求参数**：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `id` | path | number | 是 | 新闻主键，正整数 |

- **请求示例**：`GET /api/news/1`
- **成功响应**（HTTP 200）：

```json
{
  "code": 0,
  "msg": "新闻详情获取成功",
  "data": {
    "Cheney_id": 1,
    "Cheney_title": "国产 3nm 车规级智驾芯片量产落地",
    "Cheney_summary": "国内首条 3nm 车规级智能驾驶芯片产线在合肥完成良率爬坡，单颗芯片算力 512 TOPS，已获三家车企定点，预计 2027 年一季度装车。",
    "Cheney_source": "星穹科技观察",
    "Cheney_author": "张硕",
    "Cheney_category": "芯片",
    "Cheney_cover": "images/Cheney_news_chip.svg",
    "Cheney_publish_time": "2026-11-18 09:20:00",
    "Cheney_views": 18644,
    "Cheney_created_at": "2026-11-19 13:34:48"
  }
}
```

- **副作用**：每次成功读取后执行 `UPDATE Cheney_news SET Cheney_views = Cheney_views + 1`，响应中的 `Cheney_views` 为 +1 后的值。
- **错误响应**：

```json
{ "code": 400, "msg": "新闻 ID 不合法", "data": {} }
```

```json
{ "code": 404, "msg": "新闻不存在", "data": {} }
```

- **修改时间**：2026-11-19 13:36（2026-11-19 14:06 复核）

---

## 6. 图文列表

- **接口路径**：`/api/gallery`
- **HTTP 方法**：`GET`
- **请求参数**：

| 参数 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `keyword` | string | 否 | 空 | 标题或简介模糊匹配 |
| `tag` | string | 否 | 空 | 标签模糊匹配（`Cheney_tags LIKE %tag%`） |
| `page` | number | 否 | 1 | 页码，小于 1 时按 1 处理 |
| `pageSize` | number | 否 | 20 | 每页条数，范围 1–50 |

- **请求示例**：`GET /api/gallery?tag=量子&page=1&pageSize=10`
- **成功响应**（HTTP 200，示例截取 1 条）：

```json
{
  "code": 0,
  "msg": "图文列表获取成功",
  "data": {
    "cheney_total": 10,
    "cheney_page": 1,
    "cheney_pageSize": 1,
    "cheney_list": [
      {
        "Cheney_id": 1,
        "Cheney_title": "晶圆厂的无灯车间",
        "Cheney_image": "images/Cheney_gallery_1.svg",
        "Cheney_intro": "12 英寸晶圆在氮气环境中流转，整条产线只在光刻区使用黄光照明，自动化搬运车昼夜不停。",
        "Cheney_place": "合肥 · 晶圆厂",
        "Cheney_shoot_date": "2026-11-18",
        "Cheney_tags": "半导体,智能制造",
        "Cheney_sort": 100
      }
    ]
  }
}
```

- **排序**：`Cheney_sort DESC, Cheney_shoot_date DESC`。
- **修改时间**：2026-11-19 13:37（2026-11-19 14:06 复核）

---

## 7. 图文详情

- **接口路径**：`/api/gallery/:id`
- **HTTP 方法**：`GET`
- **请求参数**：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `id` | path | number | 是 | 图文主键，正整数 |

- **请求示例**：`GET /api/gallery/1`
- **成功响应**（HTTP 200）：

```json
{
  "code": 0,
  "msg": "图文详情获取成功",
  "data": {
    "Cheney_id": 1,
    "Cheney_title": "晶圆厂的无灯车间",
    "Cheney_image": "images/Cheney_gallery_1.svg",
    "Cheney_intro": "12 英寸晶圆在氮气环境中流转，整条产线只在光刻区使用黄光照明，自动化搬运车昼夜不停。",
    "Cheney_place": "合肥 · 晶圆厂",
    "Cheney_shoot_date": "2026-11-18",
    "Cheney_tags": "半导体,智能制造",
    "Cheney_sort": 100,
    "Cheney_created_at": "2026-11-19 13:34:48"
  }
}
```

- **错误响应**：

```json
{ "code": 400, "msg": "图文 ID 不合法", "data": {} }
```

```json
{ "code": 404, "msg": "图文不存在", "data": {} }
```

- **修改时间**：2026-11-19 13:37（2026-11-19 14:06 复核）

---

## 8. 兜底与错误处理

- 未知接口：`GET /api/not-exist` → HTTP 404

```json
{ "code": 404, "msg": "接口不存在：/api/not-exist", "data": {} }
```

- 非 `/api` 的未知页面：返回 `frontend/index.html`（HTTP 404），保证浏览器端路由不白屏。
- 未捕获异常：HTTP 500

```json
{ "code": 500, "msg": "服务器内部错误：具体异常信息", "data": {} }
```

- **修改时间**：2026-11-19 13:35（2026-11-19 14:06 复核）

---

## 9. 知识库文件上传

- **接口路径**：`/api/knowledge/upload`
- **HTTP 方法**：`POST`
- **Content-Type**：`multipart/form-data`，字段名 `file`
- **请求体**：单个文件，支持 PDF / TXT / DOC / DOCX / PPT / PPTX，最大 20MB
- **修改时间**：2026-11-23 14:32（实测通过）

成功响应（HTTP 201）：

```json
{
  "code": 0,
  "msg": "知识库文件上传并解析成功",
  "data": {
    "Cheney_id": 3,
    "Cheney_original_name": "Cheney_product_faq.docx",
    "Cheney_extension": "docx",
    "Cheney_size": 5677,
    "Cheney_status": "ready",
    "Cheney_error": null,
    "Cheney_chunk_count": 6,
    "Cheney_created_at": "2026-11-23 14:38:01",
    "Cheney_updated_at": "2026-11-23 14:38:01"
  }
}
```

错误响应：扩展名不支持（HTTP 415）、文件超 20MB（HTTP 400）、签名不正确（HTTP 400）、Office 转换失败（HTTP 400，返回 `data.cheney_id` 供重建）。

---

## 10. 知识库文件列表

- **接口路径**：`/api/knowledge/documents`
- **HTTP 方法**：`GET`
- **请求参数**：无
- **成功响应**（HTTP 200）：

```json
{
  "code": 0,
  "msg": "知识库文件列表获取成功",
  "data": {
    "cheney_total": 2,
    "cheney_list": [
      {
        "Cheney_id": 3,
        "Cheney_original_name": "Cheney_product_faq.docx",
        "Cheney_extension": "docx",
        "Cheney_size": 5677,
        "Cheney_status": "ready",
        "Cheney_error": null,
        "Cheney_chunk_count": 6,
        "Cheney_created_at": "2026-11-23 14:38:01",
        "Cheney_updated_at": "2026-11-23 14:38:01"
      }
    ]
  }
}
```

- **修改时间**：2026-11-23 14:32（实测通过）

---

## 11. 知识库文件详情（含分块）

- **接口路径**：`/api/knowledge/documents/:id`
- **HTTP 方法**：`GET`
- **成功响应**（HTTP 200）：

```json
{
  "code": 0,
  "msg": "知识库文件详情获取成功",
  "data": {
    "cheney_document": { /* 文档基础信息 */ },
    "cheney_chunks": [
      { "Cheney_id": 40, "Cheney_document_id": 3, "Cheney_chunk_index": 1, "Cheney_content": "……" }
    ]
  }
}
```

- **修改时间**：2026-11-23 14:32（实测通过）

---

## 12. 删除知识库文件

- **接口路径**：`/api/knowledge/documents/:id`
- **HTTP 方法**：`DELETE`
- **副作用**：数据库文档记录 + 级联分块 + 磁盘原始文件全部删除
- **成功响应**（HTTP 200）：`{ "code": 0, "msg": "知识库文件已删除", "data": { "cheney_id": 3 } }`
- **修改时间**：2026-11-23 14:32（实测通过）

---

## 13. 重新解析知识库文件

- **接口路径**：`/api/knowledge/documents/:id/rebuild`
- **HTTP 方法**：`POST`
- **说明**：从服务器保留的原始文件重新执行解析与分块；用于修复解析程序或重试失败文件
- **成功响应**（HTTP 200）：与上传成功结构相同
- **修改时间**：2026-11-23 14:32（实测通过）

---

## 14. 基于知识库的 RAG 问答

- **接口路径**：`/api/knowledge/chat`
- **HTTP 方法**：`POST`
- **Content-Type**：`application/json`
- **请求参数**：

| 参数 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `question` | string | 是 | — | 问题文本，≤ 2000 字符 |
| `documentId` | number | 否 | 0 | 限定检索的文档 ID；0 表示搜索全部已就绪文件 |
| `topK` | number | 否 | 5 | 最多返回知识块数量，范围 1–8 |

成功响应分三种路径：

**路径 A：未检索到相关知识（`cheney_used_model=false`，不调用大模型）**

```json
{
  "code": 0,
  "msg": "未检索到足够相关知识",
  "data": {
    "cheney_answer": "知识库未找到与该问题相关的内容……",
    "cheney_sources": [],
    "cheney_used_model": false,
    "cheney_model": null
  }
}
```

**路径 B：有相关知识但未配置 API Key（HTTP 503，仍返回检索引用）**

```json
{
  "code": 503,
  "msg": "DeepSeek 尚未配置：请在 backend/.env 中设置 OPENAI_API_KEY 后重启服务",
  "data": {
    "cheney_sources": [
      {
        "cheney_document_id": 2,
        "cheney_document_name": "Cheney_service_policy.pptx",
        "cheney_chunk_index": 3,
        "cheney_score": 0.2999,
        "cheney_excerpt": "……"
      }
    ]
  }
}
```

**路径 C：完整调用 DeepSeek（HTTP 200，真实部署后）**

```json
{
  "code": 0,
  "msg": "知识库问答完成",
  "data": {
    "cheney_answer": "标准软件授权自交付之日起保修十二个月……参考来源：Cheney_service_policy.pptx，知识块 3。",
    "cheney_sources": [/* 同路径 B */],
    "cheney_used_model": true,
    "cheney_model": "deepseek-chat",
    "cheney_usage": { "prompt_tokens": 100, "completion_tokens": 30, "total_tokens": 130 }
  }
}
```

- **修改时间**：2026-11-23 14:50（本地模型模拟 + 控制台收发日志实测通过；真实 DeepSeek 待用户配置 `OPENAI_API_KEY`）
- **后端控制台日志**：每次请求会打印 RAG 检索结果、完整 POST JSON、HTTP 响应和原始响应体；**不打印** API Key。
- **实测验证（真实大模型调用）**：2026-11-23 15:41，端口 8115。
  `POST /api/knowledge/chat` 返回 HTTP 200 / `code=0` / `cheney_used_model=true`，
  模型 `deepseek-v4.1-flash-1017` @ `https://maas.qianwenaiapi.com/compatible-mode/v1`，
  `usage`：prompt 1067、completion 129、total 1196；检索命中 `Cheney_service_policy.pptx` 知识块 1 与 3。
  密钥已迁至 Windows 用户级环境变量 `OPENAI_API_KEY`，`backend/.env` 不再保存明文（可提交模板见 `backend/.env.example`）。
