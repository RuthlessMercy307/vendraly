const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool(config);

router.get('/', async (req, res) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string' || token.length < 10) {
    return res.json({ status: 'error', msg: 'Token faltante o inválido' });
  }

  try {
    const [rows] = await pool.execute(`
      SELECT u.email_verificado
      FROM tokens_verificacion tv
      JOIN usuarios u ON u.id = tv.usuario_id
      WHERE tv.token = ?
    `, [token]);

    if (rows.length === 0) {
      return res.json({ status: 'no_encontrado', msg: 'Token inválido o expirado' });
    }

    const verificado = rows[0].email_verificado === 1;

    return res.json({
      status: 'ok',
      verificado,
      msg: verificado
        ? 'Correo ya verificado'
        : 'Correo aún no verificado'
    });

  } catch (err) {
    console.error('[VERIFICAR TOKEN ESTADO]', err);
    res.status(500).json({ status: 'error', msg: 'Error del servidor' });
  }
});

module.exports = router;
