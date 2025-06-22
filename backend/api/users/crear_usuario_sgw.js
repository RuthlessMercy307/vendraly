// ✅ BACKEND - api/crear_usuario_sgw.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.post('/', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { nombre, usuario, password, rol } = req.body;

  if (!nombre || !usuario || !password) {
    return res.status(400).json({ status: 'error', msg: 'Faltan campos obligatorios' });
  }

  try {
    // Buscar negocio del usuario dueño
    const [rows] = await pool.execute(`
      SELECT n.id AS negocio_id
      FROM negocios n
      JOIN relacion_usuario_negocio r ON r.negocio_id = n.id
      WHERE r.usuario_id = ? AND r.rol = 'dueño'
      LIMIT 1
    `, [usuarioId]);

    if (rows.length === 0) {
      return res.status(403).json({ status: 'error', msg: 'No tienes permiso para este negocio' });
    }

    const negocioId = rows[0].negocio_id;

    // Verificar si ya existe el usuario
    const [check] = await pool.execute(`SELECT id FROM usuarios_sgw WHERE usuario = ?`, [usuario]);
    if (check.length > 0) {
      return res.status(400).json({ status: 'error', msg: 'Este nombre de usuario ya está en uso' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario SGW
    await pool.execute(`
      INSERT INTO usuarios_sgw (negocio_id, nombre, usuario, password_hash, rol)
      VALUES (?, ?, ?, ?, ?)
    `, [negocioId, nombre, usuario, passwordHash, rol || 'mesero']);

    res.json({ status: 'ok', msg: 'Usuario creado exitosamente' });

  } catch (err) {
    console.error('[ERROR crear_usuario_sgw]:', err);
    res.status(500).json({ status: 'error', msg: 'Error al crear usuario' });
  }
});

module.exports = router;
