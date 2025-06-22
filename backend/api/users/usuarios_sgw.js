// ✅ BACKEND - api/usuarios_sgw.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.get('/', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    // Buscar el negocio donde el usuario es dueño
    const [rows] = await pool.execute(`
      SELECT n.id AS negocio_id
      FROM negocios n
      JOIN relacion_usuario_negocio r ON r.negocio_id = n.id
      WHERE r.usuario_id = ? AND r.rol = 'dueño'
      LIMIT 1
    `, [usuarioId]);

    if (rows.length === 0) {
      return res.status(403).json({ status: 'error', msg: 'No tienes acceso a ningún negocio' });
    }

    const negocioId = rows[0].negocio_id;

    // Obtener los usuarios SGW de ese negocio
    const [usuarios] = await pool.execute(`
      SELECT id, nombre, usuario, rol, estado, creado_en
      FROM usuarios_sgw
      WHERE negocio_id = ?
    `, [negocioId]);

    res.json({ status: 'ok', usuarios });

  } catch (err) {
    console.error('[ERROR usuarios_sgw]:', err);
    res.status(500).json({ status: 'error', msg: 'Error al obtener usuarios SGW' });
  }
});

module.exports = router;
