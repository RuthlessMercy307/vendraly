const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.get('/', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    // Buscar negocio donde el usuario es dueño
    const [negocios] = await pool.execute(`
      SELECT n.id, n.nombre, n.descripcion, n.tipo, n.estado
      FROM negocios n
      JOIN relacion_usuario_negocio r ON r.negocio_id = n.id
      WHERE r.usuario_id = ? AND r.rol = 'dueño'
      LIMIT 1
    `, [usuarioId]);

    if (negocios.length > 0) {
      return res.json({ status: 'ok', negocio: negocios[0] });
    }

    // Si no hay negocio, verificar si el usuario tiene una suscripción activa
    const [subs] = await pool.execute(`
      SELECT id FROM suscripciones_usuario
      WHERE usuario_id = ? AND estado = 'activo'
      LIMIT 1
    `, [usuarioId]);

    if (subs.length > 0) {
      return res.json({ status: 'ok', negocio: null }); // Permitimos registrar
    }

    // No tiene suscripción válida ni negocio
    return res.status(403).json({ status: 'error', msg: 'No tienes permiso para registrar negocio' });

  } catch (err) {
    console.error('[ERROR negocio_actual]:', err);
    res.status(500).json({ status: 'error', msg: 'Error al obtener datos del negocio' });
  }
});

module.exports = router;
