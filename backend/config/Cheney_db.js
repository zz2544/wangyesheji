/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：MySQL 连接池（凭据统一从 backend/.env 读取，代码中不出现明文密码）
 */
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Cheney_dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

const Cheney_pool = mysql.createPool(Cheney_dbConfig);

/**
 * 执行 SQL，返回结果行数组
 * @param {string} Cheney_sql
 * @param {Array} Cheney_params
 */
async function Cheney_query(Cheney_sql, Cheney_params = []) {
  const [Cheney_rows] = await Cheney_pool.execute(Cheney_sql, Cheney_params);
  return Cheney_rows;
}

/**
 * 用指定的账号密码临时连接一次，用于「数据库连接测试」页面
 */
async function Cheney_testConnection({ user, password, host, port, database }) {
  const Cheney_conn = await mysql.createConnection({
    host: host || Cheney_dbConfig.host,
    port: Number(port || Cheney_dbConfig.port),
    user,
    password,
    database: database || undefined,
    charset: 'utf8mb4',
    connectTimeout: 5000
  });
  try {
    const [Cheney_versionRows] = await Cheney_conn.query('SELECT VERSION() AS cheney_version');
    const [Cheney_dbRows] = await Cheney_conn.query('SELECT DATABASE() AS cheney_database');
    return {
      cheney_version: Cheney_versionRows[0].cheney_version,
      cheney_database: Cheney_dbRows[0].cheney_database
    };
  } finally {
    await Cheney_conn.end();
  }
}

module.exports = { Cheney_pool, Cheney_query, Cheney_testConnection, Cheney_dbConfig };