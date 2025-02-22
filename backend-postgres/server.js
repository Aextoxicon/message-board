const express = require('express');
const { Pool } = require('pg'); // 引入 PostgreSQL 的 Pool
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet'); // 引入 helmet 中间件
const allowedOrigins = ['https://cjysth.pages.dev', 'https://cjysth.equinox.us.kg'];
// 加载环境变量
dotenv.config();
// 初始化 Express 应用
const app = express();
// 使用 helmet 中间件
app.use(helmet());
// 使用 body-parser 中间件
app.use(bodyParser.json());
// 使用 cors 中间件
app.use(
  cors({
    origin: function (origin, callback) {
      console.log('Request origin:', origin); // 添加日志：打印请求来源
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error('CORS blocked:', origin); // 添加日志：打印被阻止的来源
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);
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
// 提交评论
app.post('/api/comments', async (req, res) => {
  console.log('Received POST request:', req.body); // 添加日志：打印请求体
  const { title, comment } = req.body;
  if (!title || !comment) {
    console.error('Title and comment are required'); // 添加日志：打印缺失字段错误
    return res.status(400).json({ message: 'Title and comment are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO comments (title, comment) VALUES ($1, $2) RETURNING *',
      [title, comment]
    );
    console.log('Comment inserted:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// 获取评论
app.get('/api/comments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comments ORDER BY timestamp DESC');
    console.log('Fetched comments:', result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 启动服务器（serverless）
module.exports = app;

// 在普通服务器启动
if (require.main === module) {
  app.listen(5000, 0.0.0.0, () => {
    console.log(`Server is running on port 0.0.0.0:5000`);
  });
}