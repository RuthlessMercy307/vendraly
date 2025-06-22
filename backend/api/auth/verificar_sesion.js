require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const config = require('../config');

const router = express.Router();
const pool = mysql.createPool(config);
const SECRET = process.env.JWT_SECRET;

router.get('/', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ logged_in: false });
  }

  const token = authHeader.split(' ')[1];

  if (!token || token.length < 10) {
    return res.json({ logged_in: false });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    const [rows] = await pool.execute(
      `SELECT nombre, rol, email_verificado FROM usuarios WHERE id = ?`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.json({ logged_in: false });
    }

    const user = rows[0];

    if (!user.email_verificado) {
      return res.json({ logged_in: false, reason: 'not_verified' });
    }

    return res.json({
      logged_in: true,
      id: decoded.id,
      nombre: user.nombre,
      rol: user.rol,
      verificado: true
    });

  } catch (err) {
    console.warn('[JWT VERIFICACIÓN FALLIDA]:', err.message || err);
    return res.json({ logged_in: false });
  }
});

module.exports = router;
