const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.get('/', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    // 🔹 Obtener negocios donde el usuario es dueño
    const [negocios] = await pool.execute(`
      SELECT n.id, n.nombre, n.descripcion, n.tipo, n.estado
      FROM negocios n
      JOIN relacion_usuario_negocio r ON r.negocio_id = n.id
      WHERE r.usuario_id = ? AND r.rol = 'dueño'
    `, [usuarioId]);

    // 🔹 Buscar suscripción activa del usuario (nuevo modelo)
    const [subs] = await pool.execute(`
      SELECT p.id, p.nombre, p.descripcion, p.limite_negocios, p.limite_usuarios, p.precio_mensual
      FROM suscripciones_usuario su
      JOIN planes p ON su.plan_id = p.id
      WHERE su.usuario_id = ? AND su.estado = 'activo'
      LIMIT 1
    `, [usuarioId]);

    const plan = subs.length > 0 ? subs[0] : null;

    // 🔹 Si no tiene plan activo, devolver lista de planes
    let planesDisponibles = [];
    if (!plan) {
      const [planes] = await pool.execute(`
        SELECT id, nombre, descripcion, limite_negocios, limite_usuarios, precio_mensual
        FROM planes
        WHERE nombre NOT LIKE '%tester%'
        ORDER BY precio_mensual ASC
      `);
      planesDisponibles = planes;
    }

    res.json({
      status: 'ok',
      negocios,
      plan_activo: plan,
      planes: planesDisponibles
    });

  } catch (err) {
    console.error('[ERROR portafolio_datos]:', err);
    res.status(500).json({ status: 'error', msg: 'Error al obtener portafolio' });
  }
});

module.exports = router;
