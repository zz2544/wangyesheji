<!-- 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash -->
# Cheney_database.md · 数据库建库建表与测试数据记录

> 数据库：MySQL 8.0.30　|　库名：`cheney_vibe_db`　|　字符集：`utf8mb4`
>
> 本文件按执行顺序追加，只增不删。仅凭本文件即可在新机器上完整重建数据库。
> 数据库账号密码不写入本文件，统一配置在 `backend/.env` 的 `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_NAME`。

## 一、重建方式

### 方式 A：命令行执行项目 SQL 文件

`backend/sql/Cheney_init.sql` 与本文件“二、完整 SQL”内容一致，可直接执行：

```bash
mysql -uroot -p < backend/sql/Cheney_init.sql
```

如果只拿到本文件，把“二、完整 SQL”的四个代码块按顺序复制到 `Cheney_init.sql`，再执行上面的命令即可。

### 方式 B：项目脚本（读取 `.env`，推荐）

```bash
cd backend
npm run init-db
```

脚本 `backend/scripts/Cheney_initDb.js` 会读取 `backend/sql/Cheney_init.sql`，用 `multipleStatements: true` 一次性执行。`backend/sql/Cheney_init.sql` 与本文件“二、完整 SQL”保持一致。

> 注意：脚本包含 `DROP TABLE IF EXISTS`，会重建 `Cheney_news`、`Cheney_gallery` 两张表并重新插入测试数据；不会删除其他数据库。

---

## 二、完整 SQL（按执行顺序）

### 1. 建库与切换

```sql
CREATE DATABASE IF NOT EXISTS cheney_vibe_db
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE cheney_vibe_db;
```

### 2. 科技新闻表 Cheney_news

```sql
DROP TABLE IF EXISTS Cheney_news;
CREATE TABLE Cheney_news (
  Cheney_id            INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻主键',
  Cheney_title         VARCHAR(120) NOT NULL COMMENT '标题',
  Cheney_summary       VARCHAR(500) NOT NULL COMMENT '摘要',
  Cheney_source        VARCHAR(60)  NOT NULL COMMENT '来源媒体',
  Cheney_author        VARCHAR(40)  NOT NULL COMMENT '作者',
  Cheney_category      VARCHAR(30)  NOT NULL COMMENT '分类',
  Cheney_cover         VARCHAR(255) DEFAULT NULL COMMENT '封面图地址',
  Cheney_publish_time  DATETIME     NOT NULL COMMENT '发布时间',
  Cheney_views         INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '阅读量',
  Cheney_created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入库时间',
  PRIMARY KEY (Cheney_id),
  KEY Cheney_idx_news_publish (Cheney_publish_time),
  KEY Cheney_idx_news_category (Cheney_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科技新闻表';
```

### 3. 科技新闻测试数据（10 条）

```sql
INSERT INTO Cheney_news
  (Cheney_title, Cheney_summary, Cheney_source, Cheney_author, Cheney_category, Cheney_cover, Cheney_publish_time, Cheney_views)
VALUES
  ('国产 3nm 车规级智驾芯片量产落地', '国内首条 3nm 车规级智能驾驶芯片产线在合肥完成良率爬坡，单颗芯片算力 512 TOPS，已获三家车企定点，预计 2027 年一季度装车。', '星穹科技观察', '张硕', '芯片', 'images/Cheney_news_chip.svg', '2026-11-18 09:20:00', 18642),
  ('开源大模型推理框架推出 2.0 版本', '新版本将长上下文推理的显存占用降低 46%，并支持多卡流水线并行，在单机 8 卡环境下吞吐提升 2.3 倍，已同步发布量化工具链。', '开源前线', '李文博', '人工智能', 'images/Cheney_news_ai.svg', '2026-11-17 15:05:00', 15320),
  ('6G 通感一体外场试验达成 100Gbps', '试验网在 26GHz 频段实现单用户下行 100Gbps、感知测距精度 3 厘米，为低空经济与车路协同提供了新的接入方案。', '通信世界', '王婷', '通信', 'images/Cheney_news_6g.svg', '2026-11-16 11:40:00', 9873),
  ('鸿蒙原生应用数量突破 30 万款', '鸿蒙生态设备激活量超过 12 亿台，原生应用与元服务合计突破 30 万款，其中企业办公与工业控制类应用同比增长 180%。', '终端生态周刊', '陈子航', '操作系统', 'images/Cheney_news_os.svg', '2026-11-15 08:55:00', 22140),
  ('全国一体化算力网新增八个枢纽节点', '新增节点重点布局西部绿电区域，跨域调度时延控制在 20 毫秒以内，算力交易平台上线后可按小时粒度结算。', '数据中心评论', '周颖', '基础设施', 'images/Cheney_news_cloud.svg', '2026-11-14 19:10:00', 7654),
  ('固态电池中试线能量密度达 420Wh/kg', '中试线良品率提升至 92%，支持 12 分钟快充至 80%，循环 1200 次容量保持率 88%，量产时间表指向 2028 年。', '新能源观察', '赵鹏', '新能源', 'images/Cheney_news_battery.svg', '2026-11-13 10:30:00', 13289),
  ('量子纠错码逻辑比特错误率再降一个量级', '研究团队在超导平台上实现距离 7 的表面码逻辑比特，错误率降至 10⁻⁴ 量级，为容错量子计算迈出关键一步。', '科研速递', '孙一鸣', '前沿科学', 'images/Cheney_news_quantum.svg', '2026-11-12 16:45:00', 6208),
  ('浏览器端 WebGPU 渲染管线性能追平原生', '在 4K 分辨率的复杂场景测试中，WebGPU 方案帧率达 78 FPS，较上一代 WebGL 提升近三倍，且功耗下降 18%。', '前端技术月刊', '张硕', 'Web 开发', 'images/Cheney_news_webgpu.svg', '2026-11-11 14:20:00', 11456),
  ('智能体框架标准化接口草案公开征求意见', '草案统一了工具调用、记忆读写与会话恢复三类接口，多家厂商已完成兼容性验证，正式标准预计明年上半年发布。', '标准与产业', '刘欣然', '人工智能', 'images/Cheney_news_agent.svg', '2026-11-10 09:05:00', 8321),
  ('低空物流无人机在 12 城进入常态化运营', '日均起降架次超过 4600 次，平均配送时长 18 分钟，事故率控制在百万架次 0.3 以内，配套空域管理系统同步上线。', '智慧交通日报', '杨澜', '智能硬件', 'images/Cheney_news_drone.svg', '2026-11-09 07:50:00', 5987);
```

### 4. 图文列表信息表 Cheney_gallery

```sql
DROP TABLE IF EXISTS Cheney_gallery;
CREATE TABLE Cheney_gallery (
  Cheney_id           INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图文主键',
  Cheney_title        VARCHAR(120) NOT NULL COMMENT '标题',
  Cheney_image        VARCHAR(255) NOT NULL COMMENT '图片地址',
  Cheney_intro        VARCHAR(500) NOT NULL COMMENT '简介',
  Cheney_place        VARCHAR(60)  NOT NULL COMMENT '地点/场景',
  Cheney_shoot_date   DATE         NOT NULL COMMENT '拍摄/发布日期',
  Cheney_tags         VARCHAR(120) NOT NULL COMMENT '标签（逗号分隔）',
  Cheney_sort         INT          NOT NULL DEFAULT 0 COMMENT '展示排序（越大越前）',
  Cheney_created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入库时间',
  PRIMARY KEY (Cheney_id),
  KEY Cheney_idx_gallery_sort (Cheney_sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图文列表信息表';
```

### 5. 图文测试数据（10 条）

```sql
INSERT INTO Cheney_gallery
  (Cheney_title, Cheney_image, Cheney_intro, Cheney_place, Cheney_shoot_date, Cheney_tags, Cheney_sort)
VALUES
  ('晶圆厂的无灯车间', 'images/Cheney_gallery_1.svg', '12 英寸晶圆在氮气环境中流转，整条产线只在光刻区使用黄光照明，自动化搬运车昼夜不停。', '合肥 · 晶圆厂', '2026-11-18', '半导体,智能制造', 100),
  ('液冷数据中心走廊', 'images/Cheney_gallery_2.svg', '冷板式液冷把单机柜功率密度推到 40kW 以上，机房送回水温差稳定在 4℃ 左右，PUE 降至 1.15。', '乌兰察布 · 数据中心', '2026-11-16', '算力,绿色能源', 95),
  ('城市低空配送航线', 'images/Cheney_gallery_3.svg', '无人机沿规划航线穿楼而过，塔台系统实时下发避让指令，一单从商家到用户平均 18 分钟。', '深圳 · 南山', '2026-11-15', '低空经济,无人机', 90),
  ('固态电池中试线', 'images/Cheney_gallery_4.svg', '叠片与热压设备在干燥房中连续运行，能量密度 420Wh/kg 的电芯从这一条产线走向整车验证。', '常州 · 电池基地', '2026-11-13', '新能源,电池', 85),
  ('量子计算低温机柜', 'images/Cheney_gallery_5.svg', '稀释制冷机把核心器件降到 10 毫开尔文，层层金线与外壳包裹着几十个超导量子比特。', '北京 · 量子实验室', '2026-11-12', '前沿科学,量子', 80),
  ('鸿蒙多设备协同演示台', 'images/Cheney_gallery_6.svg', '手机、平板、车机与手表共享同一份剪贴板与任务流，跨设备投递延迟低于 40 毫秒。', '东莞 · 生态实验室', '2026-11-11', '操作系统,生态', 75),
  ('6G 通感一体外场基站', 'images/Cheney_gallery_7.svg', '26GHz 毫米波阵列天线同时承担通信与感知任务，对低空目标可实现厘米级测距。', '上海 · 外场试验网', '2026-11-09', '通信,6G', 70),
  ('山区光伏矩阵', 'images/Cheney_gallery_8.svg', '坡地上的双轴跟踪支架随日照调整角度，单站年发电量较固定支架提升 21%。', '宁夏 · 光伏基地', '2026-11-08', '新能源,光伏', 65),
  ('智慧工厂的数字孪生大屏', 'images/Cheney_gallery_9.svg', '产线节拍、设备健康度与在制品库存实时映射到三维模型，异常工位在 3 秒内高亮告警。', '苏州 · 智能制造园', '2026-11-06', '工业互联网,数字孪生', 60),
  ('自动驾驶测试场夜间场景', 'images/Cheney_gallery_10.svg', '雨雾与逆光工况下的感知验证，激光雷达与视觉融合在夜间仍能识别 120 米外的小目标。', '武汉 · 测试场', '2026-11-04', '智能驾驶,传感器', 55);
```

---

## 三、重建后的校验 SQL

```sql
USE cheney_vibe_db;

SHOW TABLES;
-- 预期：cheney_gallery、cheney_news（Windows 下表名默认小写；业务 SQL 不区分大小写）

SELECT COUNT(*) AS Cheney_news_count FROM Cheney_news;
-- 预期：10

SELECT COUNT(*) AS Cheney_gallery_count FROM Cheney_gallery;
-- 预期：10

SELECT Cheney_id, Cheney_title, Cheney_category, Cheney_publish_time
FROM Cheney_news
ORDER BY Cheney_publish_time DESC
LIMIT 3;
-- 预期：id=1 芯片、id=2 人工智能、id=3 通信

SELECT Cheney_id, Cheney_title, Cheney_place, Cheney_sort
FROM Cheney_gallery
ORDER BY Cheney_sort DESC
LIMIT 3;
-- 预期：晶圆厂的无灯车间（100）、液冷数据中心走廊（95）、城市低空配送航线（90）
```

### 字段说明

| 表 | 字段 | 说明 |
| --- | --- | --- |
| `Cheney_news` | `Cheney_title` | 新闻标题，列表与详情均展示 |
|  | `Cheney_summary` | 摘要，列表页卡片与关键词搜索使用 |
|  | `Cheney_source` / `Cheney_author` | 来源媒体 / 作者 |
|  | `Cheney_category` | 分类，支持 `/api/news?category=` 精确筛选 |
|  | `Cheney_cover` | 封面相对路径，指向 `frontend/images/*.svg` |
|  | `Cheney_publish_time` | 发布时间，列表按其倒序 |
|  | `Cheney_views` | 阅读量，详情接口每次访问 +1 |
| `Cheney_gallery` | `Cheney_image` | 图片相对路径，指向 `frontend/images/*.svg` |
|  | `Cheney_intro` | 简介，列表卡片与关键词搜索使用 |
|  | `Cheney_place` / `Cheney_shoot_date` | 地点 / 拍摄日期 |
|  | `Cheney_tags` | 逗号分隔标签，支持 `/api/gallery?tag=` 模糊筛选 |
|  | `Cheney_sort` | 展示排序，越大越靠前 |

---

## 四、变更记录

| 时间 | 操作 | 说明 |
| --- | --- | --- |
| 2026-11-19 13:34 | 建库 `cheney_vibe_db` | utf8mb4 / utf8mb4_general_ci |
| 2026-11-19 13:34 | 建表 `Cheney_news` + 10 条 INSERT | 科技新闻，含发布时间索引与分类索引 |
| 2026-11-19 13:34 | 建表 `Cheney_gallery` + 10 条 INSERT | 图文列表，含排序索引 |
| 2026-11-19 14:06 | 复核 | `Cheney_news=10`、`Cheney_gallery=10`，接口读取正常 |