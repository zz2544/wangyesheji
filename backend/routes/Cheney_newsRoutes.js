/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：科技新闻路由 /api/news
 */
const Cheney_express = require('express');
const Cheney_router = Cheney_express.Router();
const Cheney_newsController = require('../controllers/Cheney_newsController');

Cheney_router.get('/', Cheney_newsController.Cheney_listNews);
Cheney_router.get('/:id', Cheney_newsController.Cheney_newsDetail);

module.exports = Cheney_router;