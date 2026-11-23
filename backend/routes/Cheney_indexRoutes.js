/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：/api 总路由（Router），聚合各业务路由
 */
const Cheney_express = require('express');
const Cheney_router = Cheney_express.Router();

const Cheney_newsRoutes = require('./Cheney_newsRoutes');
const Cheney_galleryRoutes = require('./Cheney_galleryRoutes');
const Cheney_databaseRoutes = require('./Cheney_databaseRoutes');
const Cheney_knowledgeRoutes = require('./Cheney_knowledgeRoutes');

/** GET /api/health —— 服务健康检查 */
Cheney_router.get('/health', (req, res) => {
  res.json({
    code: 0,
    msg: '服务运行正常',
    data: {
      cheney_service: '星穹科技资讯站后端',
      cheney_time: new Date().toLocaleString('zh-CN', { hour12: false }),
      cheney_version: '1.0.0'
    }
  });
});

Cheney_router.use('/news', Cheney_newsRoutes);
Cheney_router.use('/gallery', Cheney_galleryRoutes);
Cheney_router.use('/database', Cheney_databaseRoutes);
Cheney_router.use('/knowledge', Cheney_knowledgeRoutes);

module.exports = Cheney_router;