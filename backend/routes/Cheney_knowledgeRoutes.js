/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-23 | 大模型：Kimi-K3.1-Pro
 * 作用：知识库路由 /api/knowledge
 */
const Cheney_express = require('express');
const Cheney_router = Cheney_express.Router();
const Cheney_knowledgeController = require('../controllers/Cheney_knowledgeController');
const Cheney_documentService = require('../services/Cheney_documentService');

Cheney_router.post('/upload', Cheney_documentService.Cheney_uploadMiddleware, Cheney_knowledgeController.Cheney_uploadDocument);
Cheney_router.get('/documents', Cheney_knowledgeController.Cheney_listDocuments);
Cheney_router.get('/documents/:id', Cheney_knowledgeController.Cheney_documentDetail);
Cheney_router.delete('/documents/:id', Cheney_knowledgeController.Cheney_removeDocument);
Cheney_router.post('/documents/:id/rebuild', Cheney_knowledgeController.Cheney_rebuildDocument);
Cheney_router.post('/chat', Cheney_knowledgeController.Cheney_chat);

module.exports = Cheney_router;
