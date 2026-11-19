/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：科技新闻控制器（Controller）
 */
const { Cheney_ok, Cheney_fail } = require('../config/Cheney_response');
const Cheney_newsModel = require('../models/Cheney_newsModel');

/** GET /api/news?keyword=&category=&page=&pageSize= */
async function Cheney_listNews(req, res, next) {
  try {
    const { keyword = '', category = '', page = 1, pageSize = 10 } = req.query;
    const Cheney_pageNum = Math.max(1, parseInt(page, 10) || 1);
    const Cheney_sizeNum = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));

    const Cheney_data = await Cheney_newsModel.Cheney_findNews({
      keyword: String(keyword).trim(),
      category: String(category).trim(),
      page: Cheney_pageNum,
      pageSize: Cheney_sizeNum
    });

    res.json(Cheney_ok(Cheney_data, '新闻列表获取成功'));
  } catch (Cheney_err) {
    next(Cheney_err);
  }
}

/** GET /api/news/:id */
async function Cheney_newsDetail(req, res, next) {
  try {
    const Cheney_id = parseInt(req.params.id, 10);
    if (!Cheney_id || Cheney_id <= 0) {
      return res.status(400).json(Cheney_fail('新闻 ID 不合法', 400));
    }
    const Cheney_news = await Cheney_newsModel.Cheney_findNewsById(Cheney_id);
    if (!Cheney_news) {
      return res.status(404).json(Cheney_fail('新闻不存在', 404));
    }
    await Cheney_newsModel.Cheney_increaseViews(Cheney_id);
    Cheney_news.Cheney_views += 1;
    res.json(Cheney_ok(Cheney_news, '新闻详情获取成功'));
  } catch (Cheney_err) {
    next(Cheney_err);
  }
}

module.exports = { Cheney_listNews, Cheney_newsDetail };