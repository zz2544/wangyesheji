/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：科技新闻数据访问层（Model）
 */
const { Cheney_query } = require('../config/Cheney_db');

const Cheney_TABLE = 'Cheney_news';

/** 查询新闻列表：支持关键词、分类、分页 */
async function Cheney_findNews({ keyword = '', category = '', page = 1, pageSize = 10 } = {}) {
  const Cheney_where = [];
  const Cheney_params = [];

  if (keyword) {
    Cheney_where.push('(Cheney_title LIKE ? OR Cheney_summary LIKE ?)');
    Cheney_params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (category) {
    Cheney_where.push('Cheney_category = ?');
    Cheney_params.push(category);
  }

  const Cheney_whereSql = Cheney_where.length ? `WHERE ${Cheney_where.join(' AND ')}` : '';
  const Cheney_offset = (Number(page) - 1) * Number(pageSize);

  const Cheney_countRows = await Cheney_query(
    `SELECT COUNT(*) AS cheney_total FROM ${Cheney_TABLE} ${Cheney_whereSql}`,
    Cheney_params
  );

  const Cheney_list = await Cheney_query(
    `SELECT Cheney_id, Cheney_title, Cheney_summary, Cheney_source, Cheney_author,
            Cheney_category, Cheney_cover, Cheney_publish_time, Cheney_views
       FROM ${Cheney_TABLE} ${Cheney_whereSql}
      ORDER BY Cheney_publish_time DESC
      LIMIT ${Number(pageSize)} OFFSET ${Cheney_offset}`,
    Cheney_params
  );

  return {
    cheney_total: Cheney_countRows[0].cheney_total,
    cheney_page: Number(page),
    cheney_pageSize: Number(pageSize),
    cheney_list: Cheney_list
  };
}

/** 按主键查询单条新闻 */
async function Cheney_findNewsById(id) {
  const Cheney_rows = await Cheney_query(
    `SELECT Cheney_id, Cheney_title, Cheney_summary, Cheney_source, Cheney_author,
            Cheney_category, Cheney_cover, Cheney_publish_time, Cheney_views, Cheney_created_at
       FROM ${Cheney_TABLE} WHERE Cheney_id = ?`,
    [id]
  );
  return Cheney_rows[0] || null;
}

/** 阅读量 +1 */
async function Cheney_increaseViews(id) {
  await Cheney_query(`UPDATE ${Cheney_TABLE} SET Cheney_views = Cheney_views + 1 WHERE Cheney_id = ?`, [id]);
}

module.exports = { Cheney_findNews, Cheney_findNewsById, Cheney_increaseViews };