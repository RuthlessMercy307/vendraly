const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const config = require('../config');
const { enviarVerificacion } = require('../utils/mailer');

const pool = mysql.createPool(config);

// Función: crea chat con soporte (ID 8) si no existe aún
async function crearChatConSoporte(nuevoUsuarioId, soporteId = 8) {
  const [existe] = await pool.execute(`
    SELECT c.id FROM conversaciones c
    JOIN miembros_conversacion m1 ON m1.conversacion_id = c.id AND m1.usuario_id = ?
    JOIN miembros_conversacion m2 ON m2.conversacion_id = c.id AND m2.usuario_id = ?
    WHERE c.tipo = 'privado'
    LIMIT 1
  `, [nuevoUsuarioId, soporteId]);

  if (existe.length) return;

  const [conv] = await pool.execute(
    `INSERT INTO conversaciones (tipo, nombre) VALUES ('privado', NULL)`
  );
  const conversacionId = conv.insertId;

  await pool.execute(`
    INSERT INTO miembros_conversacion (conversacion_id, usuario_id)
    VALUES (?, ?), (?, ?)`,
    [conversacionId, nuevoUsuarioId, conversacionId, soporteId]
  );

  const mensaje = '👋 ¡Bienvenido a Vendraly! Si tienes dudas, estamos aquí para ayudarte.';
  const [res] = await pool.execute(
    `INSERT INTO mensajes (conversacion_id, emisor_id, texto)
     VALUES (?, ?, ?)`,
    [conversacionId, soporteId, mensaje]
  );

  const mensajeId = res.insertId;

  await pool.execute(`
    REPLACE INTO ultima_lectura (usuario_id, conversacion_id, ultimo_mensaje_id)
    VALUES (?, ?, ?)`,
    [nuevoUsuarioId, conversacionId, mensajeId]
  );
}

// Registro de usuario
router.post('/', async (req, res) => {
  const { nombre, email, telefono, password } = req.body;

  if (!nombre || !email || !telefono || !password) {
    return res.status(400).json({ status: 'error', msg: 'Faltan campos obligatorios' });
  }

  try {
    const [existing] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.json({ status: 'error', msg: 'El correo ya está registrado' });
    }

    const hashed = crypto.createHash('sha256').update(password).digest('hex');

    const [insertUser] = await pool.execute(
      `INSERT INTO usuarios (nombre, email, password_hash, telefono, rol, fecha_registro)
       VALUES (?, ?, ?, ?, 'usuario', NOW())`,
      [nombre, email, hashed, telefono]
    );
    const usuario_id = insertUser.insertId;

    await pool.execute(
      `INSERT INTO perfil_usuario (usuario_id, estado, saldo)
       VALUES (?, 'en_verificacion', 0.00)`,
      [usuario_id]
    );

    // Insertar token de verificación (si no es el soporte mismo)
    if (email !== 'soporte@vendraly.com') {
      const token = crypto.randomBytes(32).toString('hex');
      await pool.execute(
        'INSERT INTO tokens_verificacion (usuario_id, token) VALUES (?, ?)',
        [usuario_id, token]
      );

      await enviarVerificacion(email, nombre, token).catch(err => {
        console.warn('[EMAIL] No se pudo enviar verificación:', err.message);
      });
    }

    // Crear conversación automática con soporte (ID 8)
    await crearChatConSoporte(usuario_id);

    res.json({ status: 'ok', msg: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.' });

  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    res.status(500).json({ status: 'error', msg: 'Error del servidor' });
  }
});

module.exports = router;
