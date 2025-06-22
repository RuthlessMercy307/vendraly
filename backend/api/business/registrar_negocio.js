const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.post('/', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { nombre, descripcion, tipo } = req.body;

  if (!nombre || !tipo) {
    return res.status(400).json({ status: 'error', msg: 'Faltan campos requeridos' });
  }

  try {
    // Verificar si tiene plan activo
    const [planActivo] = await pool.execute(`
      SELECT sp.plan_id, p.limite_negocios
      FROM suscripciones_usuario sp
      JOIN planes p ON p.id = sp.plan_id
      WHERE sp.usuario_id = ? AND sp.estado = 'activo'
      LIMIT 1
    `, [usuarioId]);

    if (planActivo.length === 0) {
      return res.status(403).json({ status: 'error', msg: 'No tienes un plan activo' });
    }

    const limite = planActivo[0].limite_negocios;

    // Contar cuántos negocios ya tiene
    const [yaTiene] = await pool.execute(`
      SELECT COUNT(*) AS total
      FROM relacion_usuario_negocio
      WHERE usuario_id = ? AND rol = 'dueño'
    `, [usuarioId]);

    if (yaTiene[0].total >= limite) {
      return res.status(403).json({ status: 'error', msg: 'Ya alcanzaste el límite de negocios permitidos por tu plan' });
    }

    // Crear negocio
    const [neg] = await pool.execute(`
      INSERT INTO negocios (nombre, descripcion, tipo, estado)
      VALUES (?, ?, ?, 'activo')
    `, [nombre, descripcion || '', tipo]);

    const negocioId = neg.insertId;

    // Asociar como dueño
    await pool.execute(`
      INSERT INTO relacion_usuario_negocio (usuario_id, negocio_id, rol, permisos)
      VALUES (?, ?, 'dueño', JSON_OBJECT())
    `, [usuarioId, negocioId]);

    res.json({ status: 'ok', msg: 'Negocio registrado exitosamente' });

  } catch (err) {
    console.error('[ERROR registrar_negocio]:', err);
    res.status(500).json({ status: 'error', msg: 'Error al registrar negocio' });
  }
});

module.exports = router;
