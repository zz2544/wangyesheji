/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：一键重建数据库（执行 sql/Cheney_init.sql）。用法：npm run init-db
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
  const Cheney_sqlPath = path.join(__dirname, '..', 'sql', 'Cheney_init.sql');
  const Cheney_sqlText = fs.readFileSync(Cheney_sqlPath, 'utf8');

  const Cheney_conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    await Cheney_conn.query(Cheney_sqlText);
    console.log('数据库重建完成：', process.env.DB_NAME);
  } finally {
    await Cheney_conn.end();
  }
})().catch((Cheney_err) => {
  console.error('数据库重建失败：', Cheney_err.message);
  process.exit(1);
});