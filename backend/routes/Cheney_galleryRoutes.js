/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：图文列表路由 /api/gallery
 */
const Cheney_express = require('express');
const Cheney_router = Cheney_express.Router();
const Cheney_galleryController = require('../controllers/Cheney_galleryController');

Cheney_router.get('/', Cheney_galleryController.Cheney_listGallery);
Cheney_router.get('/:id', Cheney_galleryController.Cheney_galleryDetail);

module.exports = Cheney_router;