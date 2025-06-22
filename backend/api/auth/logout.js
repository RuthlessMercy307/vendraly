const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool(config);

router.post('/', async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await pool.execute(
      'DELETE FROM refresh_tokens WHERE token = ?',
      [crypto.createHash('sha256').update(token).digest('hex')]
    );
    res.clearCookie('refreshToken');
  }

  res.json({ status: 'ok', msg: 'Sesión finalizada' });
});

module.exports = router;
