const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool(config);
const SECRET = process.env.JWT_SECRET;

router.post('/', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ status: 'error', msg: 'Token requerido' });
  }

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const [rows] = await pool.execute(
    'SELECT usuario_id FROM refresh_tokens WHERE token = ?',
    [hashed]
  );
  if (rows.length === 0) {
    return res.status(401).json({ status: 'error', msg: 'Token inválido' });
  }

  const userId = rows[0].usuario_id;

  const newAccess = jwt.sign({ id: userId }, SECRET, { expiresIn: '15m' });
  const newRefresh = crypto.randomBytes(40).toString('hex');

  await pool.execute(
    'UPDATE refresh_tokens SET token = ? WHERE usuario_id = ?',
    [crypto.createHash('sha256').update(newRefresh).digest('hex'), userId]
  );

  res.cookie('refreshToken', newRefresh, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ status: 'ok', token: newAccess });
});

module.exports = router;
