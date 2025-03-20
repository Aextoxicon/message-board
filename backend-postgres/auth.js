// auth.js - 用户认证模块
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

  // 注册用户
  async function register(uid, username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const result = await pool.query(
        'INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3) RETURNING *',
        [uid, username, hashedPassword]
      );
      return { success: true, message: 'User registered successfully', user: result.rows[0] };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.detail || 'An error occurred during registration.' };
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
