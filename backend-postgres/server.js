// server.js - 主入口文件
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet'); // 安全中间件
const allowedOrigins = ['https://demo.aextoxicon.site'];

// 加载环境变量
dotenv.config();

// 初始化 Express 应用
const app = express();

// 使用中间件
app.use(helmet());
app.use(bodyParser.json());
app.use(
  cors({
    origin: function (origin, callback) {
      console.log('Request origin:', origin); // 打印请求来源
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error('CORS blocked:', origin); // 打印被阻止的来源
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

// 引入数据库连接池配置模块
const pool = require('./db');

// 引入用户认证模块
const auth = require('./auth');

// 用户注册
app.post('/register', async (req, res) => {
  const { uid, username, password } = req.body;
  const result = await auth.register(uid, username, password);
  if (result.success) {
    res.status(201).json({ message: result.message });
  } else {
    res.status(400).json({ message: result.message });
  }
});

// 用户登录
app.post('/login', async (req, res) => {
  const { uid, password } = req.body;
  const result = await auth.login(uid, password);
  if (result.success) {
    res.header('auth-token', result.token).json({ token: result.token });
  } else {
    res.status(400).json({ message: result.message });
  }
});

// 提交评论
app.post('/api/comments', async (req, res) => {
  console.log('Received POST request:', req.body); // 打印请求体
  const { title, comment } = req.body;
  if (!title || !comment) {
    console.error('请输入标题和内容'); // 打印缺失字段错误
    return res.status(400).json({ message: '请输入标题和内容' });
  }
  try {
    const timestamp = new Date().toISOString(); // 使用 toISOString() 方法
    console.log('Timestamp:', timestamp); // 打印 timestamp 字段的值
    const result = await pool.query(
      'INSERT INTO comments (title, comment, timestamp) VALUES ($1, $2, $3) RETURNING *',
      [title, comment, timestamp]
    );
    console.log('Comment inserted:', result.rows[0]); // 打印插入结果
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating comment:', err); // 打印数据库错误
    res.status(500).json({ message: '提交错误' });
  }
});

// 获取评论
app.get('/api/comments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comments ORDER BY timestamp DESC');
    console.log('Fetched comments:', result.rows); // 打印获取的评论
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err); // 打印数据库错误
    res.status(500).json({ message: '获取错误' });
  }
});

// 启动服务器
app.listen(5001, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:5001`);
});