const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.put(
  '/',
  verificarToken,
  body('nuevo_password').isLength({ min: 6 }),
  body('codigo').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', msg: 'Datos inválidos' });
    }

    const { nuevo_password, codigo } = req.body;
    const userId = req.usuario.id;

    const [rows] = await pool.execute(
      'SELECT id FROM codigos_recuperacion WHERE usuario_id = ? AND codigo = ?',
      [userId, codigo]
    );
    if (rows.length === 0) {
      return res.status(400).json({ status: 'error', msg: 'Código inválido' });
    }

    const passwordHash = await bcrypt.hash(nuevo_password, 10);
    await pool.execute('UPDATE usuarios SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
    await pool.execute('DELETE FROM codigos_recuperacion WHERE usuario_id = ?', [userId]);

    res.json({ status: 'ok', msg: 'Contraseña actualizada' });
  }
);

module.exports = router;
