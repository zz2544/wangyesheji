/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：图文列表数据访问层（Model）
 */
const { Cheney_query } = require('../config/Cheney_db');

const Cheney_TABLE = 'Cheney_gallery';

/** 查询图文列表：支持关键词、标签、分页 */
async function Cheney_findGallery({ keyword = '', tag = '', page = 1, pageSize = 20 } = {}) {
  const Cheney_where = [];
  const Cheney_params = [];

  if (keyword) {
    Cheney_where.push('(Cheney_title LIKE ? OR Cheney_intro LIKE ?)');
    Cheney_params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (tag) {
    Cheney_where.push('Cheney_tags LIKE ?');
    Cheney_params.push(`%${tag}%`);
  }

  const Cheney_whereSql = Cheney_where.length ? `WHERE ${Cheney_where.join(' AND ')}` : '';
  const Cheney_offset = (Number(page) - 1) * Number(pageSize);

  const Cheney_countRows = await Cheney_query(
    `SELECT COUNT(*) AS cheney_total FROM ${Cheney_TABLE} ${Cheney_whereSql}`,
    Cheney_params
  );

  const Cheney_list = await Cheney_query(
    `SELECT Cheney_id, Cheney_title, Cheney_image, Cheney_intro, Cheney_place,
            Cheney_shoot_date, Cheney_tags, Cheney_sort
       FROM ${Cheney_TABLE} ${Cheney_whereSql}
      ORDER BY Cheney_sort DESC, Cheney_shoot_date DESC
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

/** 按主键查询单条图文 */
async function Cheney_findGalleryById(id) {
  const Cheney_rows = await Cheney_query(
    `SELECT Cheney_id, Cheney_title, Cheney_image, Cheney_intro, Cheney_place,
            Cheney_shoot_date, Cheney_tags, Cheney_sort, Cheney_created_at
       FROM ${Cheney_TABLE} WHERE Cheney_id = ?`,
    [id]
  );
  return Cheney_rows[0] || null;
}

module.exports = { Cheney_findGallery, Cheney_findGalleryById };