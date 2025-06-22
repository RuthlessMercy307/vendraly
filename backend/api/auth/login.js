require('dotenv').config();
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { body, validationResult } = require('express-validator');
const config = require('../config');

const pool = mysql.createPool(config);
const SECRET = process.env.JWT_SECRET;

router.post(
  '/',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', msg: 'Datos inválidos' });
    }

    const { email, password } = req.body;

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

      const accessToken = jwt.sign(
        {
          id: user.id,
          nombre: user.nombre,
          rol: user.rol,
          verificado: true
        },
        SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = crypto.randomBytes(40).toString('hex');
      await pool.execute(
        'INSERT INTO refresh_tokens (usuario_id, token) VALUES (?, ?)',
        [user.id, crypto.createHash('sha256').update(refreshToken).digest('hex')]
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        status: 'ok',
        msg: `Bienvenido ${user.nombre}`,
        token: accessToken
      });

    } catch (err) {
      console.error('[LOGIN ERROR]', err);
      res.status(500).json({ status: 'error', msg: 'Error en el servidor' });
    }
  }
);

module.exports = router;
