const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet'); // 引入 helmet 中间件处理http头
const allowedOrigins = ['YOURS_FRONTEND_URL']; // 这里写你前端网址

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

// MongoDB 连接配置
const uri = process.env.MONGO; //.env里面设定数据库连接字符串
const client = new MongoClient(uri);
let db;

// 连接 MongoDB
const connectDB = async () => {
  try {
    await client.connect();
    db = client.db('DATABASE_NAME'); // 数据库名称,不需要手动去mongosh创建
    console.log('MongoDB connected'); // 添加日志：打印数据库连接成功
  } catch (err) {
    console.error('MongoDB connection error:', err); // 添加日志：打印数据库连接错误
  }
};

// 启动时连接数据库
connectDB();

// 提交评论
app.post('/api/comments', async (req, res) => {
  console.log('Received POST request:', req.body); // 添加日志：打印请求体
  const { name, comment } = req.body;
  if (!name || !comment) {
    console.error('Name and comment are required'); // 添加日志：打印缺失字段错误
    return res.status(400).json({ message: 'Name and comment are required' });
  }
  try {
    const result = await db.collection('comments').insertOne({ //db.collection('comments')里面的comments是一个例子，你可以换成你喜欢的集合名称
      name,
      comment,
      timestamp: new Date(),
    });
    console.log('Comment inserted:', result); // 添加日志：打印插入结果
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating comment:', err); // 添加日志：打印数据库错误
    res.status(500).json({ message: 'Server error' });
  }
});

// 获取评论
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await db.collection('comments').find().sort({ timestamp: -1 }).toArray(); //db.collection('comments')里面的comments是一个例子，你可以换成你喜欢的集合名称，和上面一样
    console.log('Fetched comments:', comments); // 添加日志：打印获取的评论
    res.status(200).json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err); // 添加日志：打印数据库错误
    res.status(500).json({ message: 'Server error' });
  }
});

// 启动服务器
app.listen(5000, '0.0.0.0', () => { //端口你看情况自定义
  console.log(`Server running at http://0.0.0.0:5000`); // 添加日志：打印服务器启动信息
});
