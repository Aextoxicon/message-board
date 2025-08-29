const dotenv = require('dotenv');
const { Pool } = require('pg'); // 引入 PostgreSQL 的 Pool

// PostgreSQL 连接配置
const pool = new Pool({
  connectionString: process.env.COMMENTS_DATABASE_URL,
});

// 测试连接
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err); // 添加日志：打印数据库连接错误
  } else {
    console.log('PostgreSQL connected'); // 添加日志：打印数据库连接成功
  }
});

// 函数：删除 title 和 comment 同时重复的记录，保留 id 最小的一条
async function deleteDuplicateRecords() {
  try {
    const client = await pool.connect();
    const query = `
      DELETE FROM comments
      WHERE id IN (
        SELECT id
        FROM (
          SELECT
            id,
            ROW_NUMBER() OVER(PARTITION BY title, comment ORDER BY id) as rn
          FROM comments
        ) t
        WHERE t.rn > 1
      );
    `;
    const result = await client.query(query);
    console.log(`Deleted ${result.rowCount} duplicate records.`);
    client.release();
  } catch (err) {
    console.error('Error deleting duplicate records:', err);
  }
}

// 每小时执行一次删除重复记录的任务 (60 minutes * 60 seconds * 1000 milliseconds)
const intervalTime = 60 * 60 * 1000;
setInterval(deleteDuplicateRecords, intervalTime);

// 导出数据库连接池
module.exports = pool;
