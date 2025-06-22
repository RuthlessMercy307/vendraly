const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool(config);

router.get('/', async (req, res) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).send('❌ Token faltante o inválido.');
  }

  try {
    const [rows] = await pool.execute(
      `SELECT usuario_id, expiracion, usado FROM tokens_verificacion WHERE token = ?`,
      [token]
    );

    if (rows.length === 0) {
      return res.send('❌ Token inválido o inexistente.');
    }

    const { usuario_id, expiracion, usado } = rows[0];

    if (usado) {
      return res.send('⚠️ Este enlace ya fue utilizado.');
    }

    if (!expiracion || new Date(expiracion) < new Date()) {
      return res.send('⏰ Este enlace ha expirado.');
    }

    // Actualizar estado de verificación y marcar token como usado
    await pool.execute(
      'UPDATE usuarios SET email_verificado = 1 WHERE id = ?',
      [usuario_id]
    );

    await pool.execute(
      'UPDATE tokens_verificacion SET usado = 1 WHERE token = ?',
      [token]
    );

    console.log(`✅ Usuario ${usuario_id} verificado correctamente`);
    res.send('✅ Correo verificado con éxito. Ya puedes iniciar sesión.');

  } catch (err) {
    console.error('[VERIFICAR EMAIL ERROR]', err);
    res.status(500).send('❌ Error del servidor al verificar tu correo.');
  }
});

module.exports = router;
