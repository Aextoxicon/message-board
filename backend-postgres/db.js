const dotenv = require('dotenv');
const { Pool } = require('pg'); // 引入 PostgreSQL 的 Pool

// PostgreSQL 连接配置
const pool = new Pool({
  connectionString: process.env.PSQL,
});

// 测试连接
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err); // 添加日志：打印数据库连接错误
  } else {
    console.log('PostgreSQL connected'); // 添加日志：打印数据库连接成功
  }
});

// 导出数据库连接池
module.exports = pool;
