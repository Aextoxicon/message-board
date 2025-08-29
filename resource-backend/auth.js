// auth.js - 用户认证模块
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

  // 注册用户
  async function register(uid, username, password) {
  try {
    // 参数验证
    if (!uid || !username || !password) {
      throw new Error('所有字段都是必填的');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [uid, username, hashedPassword]
    );
    
    return { success: true, message: '用户注册成功' };
    
  } catch (err) {
    console.error('注册错误:', err);
    
    // 根据错误类型返回不同的消息
    let errorMessage = '注册过程中发生错误';
    
    if (err.code === '23505') { // PostgreSQL唯一约束违反
      if (err.constraint.includes('username')) {
        errorMessage = '用户名已存在';
      } else if (err.constraint.includes('id')) {
        errorMessage = '用户ID已存在';
      }
    } else if (err.code === '23502') { // 非空约束违反
      errorMessage = '缺少必填字段';
    }
    
    return { 
      success: false, 
      message: errorMessage,
      errorCode: err.code 
    };
  }
}

  // 用户登录
  async function login(uid, password) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [uid]);
      const user = result.rows[0];
      if (!user) return { success: false, message: 'Invalid UID or password.' };

      const validPass = await bcrypt.compare(password, user.password_hash);
      if (!validPass) return { success: false, message: 'Invalid UID or password.' };

      // 生成并返回 JWT Token
      const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return { success: true, message: 'Login successful', token };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'An error occurred during login.' };
    }
  }
  // 导出方法
  module.exports = {
    register,
    login,
  };
