/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：图文列表控制器（Controller）
 */
const { Cheney_ok, Cheney_fail } = require('../config/Cheney_response');
const Cheney_galleryModel = require('../models/Cheney_galleryModel');

/** GET /api/gallery?keyword=&tag=&page=&pageSize= */
async function Cheney_listGallery(req, res, next) {
  try {
    const { keyword = '', tag = '', page = 1, pageSize = 20 } = req.query;
    const Cheney_pageNum = Math.max(1, parseInt(page, 10) || 1);
    const Cheney_sizeNum = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 20));

    const Cheney_data = await Cheney_galleryModel.Cheney_findGallery({
      keyword: String(keyword).trim(),
      tag: String(tag).trim(),
      page: Cheney_pageNum,
      pageSize: Cheney_sizeNum
    });

    res.json(Cheney_ok(Cheney_data, '图文列表获取成功'));
  } catch (Cheney_err) {
    next(Cheney_err);
  }
}

/** GET /api/gallery/:id */
async function Cheney_galleryDetail(req, res, next) {
  try {
    const Cheney_id = parseInt(req.params.id, 10);
    if (!Cheney_id || Cheney_id <= 0) {
      return res.status(400).json(Cheney_fail('图文 ID 不合法', 400));
    }
    const Cheney_item = await Cheney_galleryModel.Cheney_findGalleryById(Cheney_id);
    if (!Cheney_item) {
      return res.status(404).json(Cheney_fail('图文不存在', 404));
    }
    res.json(Cheney_ok(Cheney_item, '图文详情获取成功'));
  } catch (Cheney_err) {
    next(Cheney_err);
  }
}

module.exports = { Cheney_listGallery, Cheney_galleryDetail };