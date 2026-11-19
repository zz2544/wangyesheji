<!-- 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash -->
# frontend/fonts · 字体与图标目录

本项目遵循“零第三方库、零 CDN”的约束，页面全部使用系统字体：

- 中文：`"Microsoft YaHei" / "PingFang SC"`
- 英文与数字：`"Segoe UI" / Consolas`

当前没有引入 iconfont 或自定义字体文件，保留本目录用于以后放置本地字体/图标资源。
若新增字体文件，请在 CSS 中通过相对路径 `fonts/xxx.woff2` 引用，禁止使用外链。