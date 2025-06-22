require('dotenv').config();
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool(config);
const SECRET = process.env.JWT_SECRET;

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  // ❌ Validar campos vacíos
  if (!email || !password) {
    return res.status(400).json({ status: 'error', msg: 'Faltan campos obligatorios' });
  }

  // ❌ Validar formato de email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ status: 'error', msg: 'Email inválido' });
  }

  try {
    const hashed = crypto.createHash('sha256').update(password).digest('hex');

    const [users] = await pool.execute(
      'SELECT id, nombre, rol, email_verificado FROM usuarios WHERE email = ? AND password_hash = ?',
      [email, hashed]
    );

    if (users.length === 0) {
      return res.status(401).json({ status: 'error', msg: 'Credenciales inválidas' });
    }

    const user = users[0];

    if (!user.email_verificado || parseInt(user.email_verificado) !== 1) {
      return res.status(403).json({ status: 'no_verificado', msg: 'Correo no verificado' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
        verificado: true
      },
      SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      status: 'ok',
      msg: `Bienvenido ${user.nombre}`,
      token
    });

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ status: 'error', msg: 'Error en el servidor' });
  }
});

module.exports = router;
