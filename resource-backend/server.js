const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet'); // 安全中间件
const pool = require('./db'); // 引入数据库模块
const auth = require('./auth'); // 引入用户认证模块
const Joi = require('joi');

// 初始化 Express 应用
const app = express();

const corsAllow = ['https://test.aextoxicon.site', 'https://test1.aextoxicon.site', 'https://thesb.pages.dev'];

// 封装中间件配置
function setMid(app) {
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(
  cors({
    origin: function (origin, callback) {
      console.log('Request origin:', origin); // 打印请求来源
        if (!origin || corsAllow.includes(origin)) {
          callback(null, true);
        } else {
          console.error('CORS blocked:', origin); // 打印被阻止的来源
          callback(new Error('Not allowed by CORS'));
        }
      },
    })
  ); // 应用 CORS 中间件
}

// 检查必要环境变量
function checkEnv() {
  const requiredVars = ['COMMENTS_DATABASE_URL', 'JWT_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
}

// 在主程序中调用
checkEnv();
setMid(app);

// 用户注册
app.post('/register', async (req, res) => {
  const schema = Joi.object({
    uid: Joi.string().alphanum().min(3).max(30).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const result = await auth.register(value.uid, value.username, value.password);
  if (result.success) {
    res.status(201).json({ message: result.message });
  } else {
    res.status(400).json({ message: result.message });
  }
});

// 用户登录
app.post('/login', async (req, res) => {
  const schema = Joi.object({
    uid: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const result = await auth.login(value.uid, value.password);
  if (result.success) {
    res.header('auth-token', result.token).json({ token: result.token });
  } else {
    res.status(400).json({ message: result.message });
  }
});

// 提交评论
function handleError(res, err) {
  console.error(err);
  res.status(500).json({ message: '服务器内部错误' });
}

// 在路由中调用
app.post('/api/comments', async (req, res) => {
  const { title, comment } = req.body;
  if (!title || !comment) {
    return res.status(400).json({ message: '请输入标题和内容' });
  }

  try {
    const timestamp = new Date().toISOString();
    const result = await pool.query(
      'INSERT INTO comments (title, comment, timestamp) VALUES ($1, $2, $3) RETURNING *',
      [title, comment, timestamp]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleError(res, err);
  }
});

// 获取评论（分页）
async function fetchComments(page, limit) {
  const offset = (page - 1) * limit;
  const countQuery = 'SELECT COUNT(*) AS total FROM comments';
  const dataQuery = `SELECT * FROM comments ORDER BY timestamp DESC LIMIT $1 OFFSET $2`;

  try {
    const countResult = await pool.query(countQuery);
    const totalItems = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalItems / limit);

    const dataResult = await pool.query(dataQuery, [limit, offset]);
    return {
      data: dataResult.rows,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
        itemsPerPage: limit,
      },
    };
  } catch (err) {
    throw new Error('Error fetching comments');
  }
}

// 在路由中调用
app.get('/api/comments', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const result = await fetchComments(page, limit);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '获取错误' });
  }
});

// 获取单个评论
app.get('/api/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '评论不存在' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '获取评论失败' });
  }
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
