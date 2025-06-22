// ✅ BACKEND - api/activar_plan.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.post('/', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { plan_id } = req.body;

  if (!plan_id) {
    return res.status(400).json({ status: 'error', msg: 'Falta el ID del plan' });
  }

  try {
    // Verificar si ya tiene una suscripción activa
    const [existe] = await pool.execute(`
      SELECT id FROM suscripciones_usuario
      WHERE usuario_id = ? AND estado = 'activo'
    `, [usuarioId]);

    if (existe.length > 0) {
      return res.json({ status: 'error', msg: 'Ya tienes un plan activo' });
    }

    // Verificar que el plan existe
    const [planes] = await pool.execute(`SELECT * FROM planes WHERE id = ?`, [plan_id]);
    if (planes.length === 0) {
      return res.json({ status: 'error', msg: 'Plan no encontrado' });
    }

    // Insertar nueva suscripción
    const [result] = await pool.execute(`
      INSERT INTO suscripciones_usuario (usuario_id, plan_id, fecha_inicio, fecha_renovacion, estado)
      VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 'activo')
    `, [usuarioId, plan_id]);

    res.json({
      status: 'ok',
      msg: '✅ Plan activado correctamente',
      suscripcion_id: result.insertId
    });

  } catch (err) {
    console.error('[ERROR activar_plan]:', err);
    res.status(500).json({ status: 'error', msg: 'Error al activar el plan' });
  }
});

module.exports = router;
