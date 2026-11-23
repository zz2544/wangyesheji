/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：后端入口。CORS + JSON 解析 + /api 路由 + express.static 托管 frontend/，端口 8115（.env 的 PORT）
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Cheney_indexRoutes = require('./routes/Cheney_indexRoutes');
const { Cheney_fail } = require('./config/Cheney_response');

const Cheney_app = express();
const Cheney_PORT = Number(process.env.PORT || 8115);
const Cheney_frontendDir = path.join(__dirname, '..', 'frontend');

// 支持所有跨域访问
Cheney_app.use(cors());
Cheney_app.options('*', cors());
Cheney_app.use(express.json());
Cheney_app.use(express.urlencoded({ extended: true }));

// 请求日志（控制台可见，便于课堂演示排错）
Cheney_app.use((req, res, next) => {
  const Cheney_time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  console.log(`[${Cheney_time}] ${req.method} ${req.originalUrl}`);
  next();
});

// /api 业务路由
Cheney_app.use('/api', Cheney_indexRoutes);

// 静态托管前端
Cheney_app.use(express.static(Cheney_frontendDir));

// 404：接口返回 JSON，页面返回首页
Cheney_app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json(Cheney_fail(`接口不存在：${req.originalUrl}`, 404));
  }
  res.status(404).sendFile(path.join(Cheney_frontendDir, 'index.html'));
});

// 统一错误处理
Cheney_app.use((err, req, res, next) => {
  const Cheney_status = err.Cheney_status || err.status || 500;
  console.error('服务器错误：', err.message);
  res.status(Cheney_status).json(Cheney_fail(
    err.message || '服务器内部错误',
    Cheney_status,
    err.Cheney_data || {}
  ));
});

Cheney_app.listen(Cheney_PORT, () => {
  console.log('==============================================');
  console.log('  星穹科技资讯站 · 后端已启动');
  console.log(`  姓名：张硕 ｜ 学号：24006380115`);
  console.log(`  首页： http://localhost:${Cheney_PORT}`);
  console.log(`  接口： http://localhost:${Cheney_PORT}/api/news`);
  console.log(`  数据库：${process.env.DB_NAME} @ ${process.env.DB_HOST}`);
  console.log('==============================================');
});