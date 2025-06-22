const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');

const pool = mysql.createPool(config);
const SECRET = process.env.JWT_SECRET;

router.post('/', async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ status: 'error', msg: 'Faltan campos obrigatórios' });
  }

  try {
    const [rows] = await pool.execute(`
      SELECT id, negocio_id, nombre, password_hash, rol, estado
      FROM usuarios_sgw
      WHERE usuario = ? AND estado = 'activo'
      LIMIT 1
    `, [usuario]);

    if (rows.length === 0) {
      return res.status(401).json({ status: 'error', msg: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ status: 'error', msg: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({
      id: user.id,
      nombre: user.nombre,
      negocio_id: user.negocio_id,
      rol: user.rol
      // NOTA: no se incluye `verificado`
    }, SECRET, { expiresIn: '1d' });

    res.json({
      status: 'ok',
      msg: `Bienvenido ${user.nombre}`,
      token
    });

  } catch (err) {
    console.error('[LOGIN_SGW ERROR]', err);
    res.status(500).json({ status: 'error', msg: 'Error en el servidor' });
  }
});

module.exports = router;
