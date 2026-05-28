const { SHA256 } = require('crypto-js');
const db = require('../models');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password harus diisi'
      });
    }

    const user = await db.User.findOne({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    const storedPassword = user.password_hash || user.password || '';
    const plainMatch = password === storedPassword;
    const hashedMatch = storedPassword
      ? SHA256(password).toString() === storedPassword
      : false;

    if (!plainMatch && !hashedMatch) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    return res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        username: user.username,
        role: user.role || 'admin'
      }
    });
  } catch (error) {
    console.error('Auth login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login'
    });
  }
};
