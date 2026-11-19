/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：数据库测试路由 /api/database
 */
const Cheney_express = require('express');
const Cheney_router = Cheney_express.Router();
const Cheney_databaseController = require('../controllers/Cheney_databaseController');

Cheney_router.post('/test', Cheney_databaseController.Cheney_testDb);
Cheney_router.get('/info', Cheney_databaseController.Cheney_dbInfo);

module.exports = Cheney_router;