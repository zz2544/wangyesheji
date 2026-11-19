/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：数据库连接测试控制器（Controller），供 frontend/database.html 调用
 */
const { Cheney_ok, Cheney_fail } = require('../config/Cheney_response');
const { Cheney_testConnection, Cheney_query, Cheney_dbConfig } = require('../config/Cheney_db');

/**
 * POST /api/database/test
 * 请求体：{ user, password, host?, port?, database? }
 */
async function Cheney_testDb(req, res, next) {
  try {
    const { user = '', password = '', host = '', port = '', database = '' } = req.body || {};

    if (!user || !password) {
      return res.status(400).json(Cheney_fail('用户名和密码不能为空', 400));
    }

    const Cheney_startAt = Date.now();
    const Cheney_info = await Cheney_testConnection({ user, password, host, port, database });
    const Cheney_cost = Date.now() - Cheney_startAt;

    let Cheney_tables = [];
    try {
      Cheney_tables = await Cheney_query(
        `SELECT TABLE_NAME AS cheney_table, TABLE_ROWS AS cheney_rows
           FROM information_schema.TABLES
          WHERE TABLE_SCHEMA = DATABASE()
          ORDER BY TABLE_NAME`
      );
    } catch (Cheney_ignore) {
      Cheney_tables = [];
    }

    res.json(
      Cheney_ok(
        {
          cheney_version: Cheney_info.cheney_version,
          cheney_database: Cheney_info.cheney_database,
          cheney_cost: Cheney_cost,
          cheney_tables: Cheney_tables
        },
        `连接成功，MySQL 版本 ${Cheney_info.cheney_version}，耗时 ${Cheney_cost} ms`
      )
    );
  } catch (Cheney_err) {
    // 账号密码错误、服务未启动等，统一按业务失败返回，便于前端提示
    res.status(200).json(
      Cheney_fail(`连接失败：${Cheney_err.code ? Cheney_err.code + ' · ' : ''}${Cheney_err.message}`, 1001)
    );
  }
}

/**
 * GET /api/database/info —— 返回 .env 中配置的当前库信息（不含密码）
 */
async function Cheney_dbInfo(req, res, next) {
  try {
    const Cheney_stats = await Cheney_query(
      `SELECT TABLE_NAME AS cheney_table, TABLE_ROWS AS cheney_rows
         FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = ?
        ORDER BY TABLE_NAME`,
      [Cheney_dbConfig.database]
    );

    const Cheney_newsCount = await Cheney_query('SELECT COUNT(*) AS cheney_count FROM Cheney_news');
    const Cheney_galleryCount = await Cheney_query('SELECT COUNT(*) AS cheney_count FROM Cheney_gallery');

    res.json(
      Cheney_ok(
        {
          cheney_host: Cheney_dbConfig.host,
          cheney_port: Cheney_dbConfig.port,
          cheney_user: Cheney_dbConfig.user,
          cheney_database: Cheney_dbConfig.database,
          cheney_charset: Cheney_dbConfig.charset,
          cheney_tables: Cheney_stats,
          cheney_newsCount: Cheney_newsCount[0].cheney_count,
          cheney_galleryCount: Cheney_galleryCount[0].cheney_count
        },
        '当前数据库信息获取成功'
      )
    );
  } catch (Cheney_err) {
    next(Cheney_err);
  }
}

module.exports = { Cheney_testDb, Cheney_dbInfo };