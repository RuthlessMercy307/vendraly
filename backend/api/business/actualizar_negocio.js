const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.put('/', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { nombre, descripcion, tipo } = req.body;

  if (!nombre || !tipo) {
    return res.status(400).json({ status: 'error', msg: 'Faltan campos obligatorios' });
  }

  try {
    // Verificar si ya tiene un negocio
    const [existe] = await pool.execute(`
      SELECT n.id
      FROM negocios n
      JOIN relacion_usuario_negocio r ON r.negocio_id = n.id
      WHERE r.usuario_id = ? AND r.rol = 'dueño'
      LIMIT 1
    `, [usuarioId]);

    if (existe.length > 0) {
      const negocioId = existe[0].id;
      await pool.execute(`
        UPDATE negocios
        SET nombre = ?, descripcion = ?, tipo = ?
        WHERE id = ?
      `, [nombre, descripcion, tipo, negocioId]);

      return res.json({ status: 'ok', msg: 'Negocio actualizado correctamente' });
    }

    // Verificar si puede registrar uno nuevo
    const [planActivo] = await pool.execute(`
      SELECT sp.plan_id, p.limite_negocios
      FROM suscripciones_usuario sp
      JOIN planes p ON p.id = sp.plan_id
      WHERE sp.usuario_id = ? AND sp.estado = 'activo'
      LIMIT 1
    `, [usuarioId]);

    if (planActivo.length === 0) {
      return res.status(403).json({ status: 'error', msg: 'No tienes plan activo para registrar negocio' });
    }

    const limite = planActivo[0].limite_negocios;

    const [cantidad] = await pool.execute(`
      SELECT COUNT(*) AS total
      FROM relacion_usuario_negocio
      WHERE usuario_id = ? AND rol = 'dueño'
    `, [usuarioId]);

    if (cantidad[0].total >= limite) {
      return res.status(403).json({ status: 'error', msg: 'Ya alcanzaste el límite de negocios permitidos' });
    }

    // Crear el negocio
    const [nuevo] = await pool.execute(`
      INSERT INTO negocios (nombre, descripcion, tipo, estado)
      VALUES (?, ?, ?, 'activo')
    `, [nombre, descripcion || '', tipo]);

    const nuevoId = nuevo.insertId;

    await pool.execute(`
      INSERT INTO relacion_usuario_negocio (usuario_id, negocio_id, rol, permisos)
      VALUES (?, ?, 'dueño', JSON_OBJECT())
    `, [usuarioId, nuevoId]);

    res.json({ status: 'ok', msg: 'Negocio creado correctamente' });

  } catch (err) {
    console.error('[ERROR actualizar_negocio]:', err);
    res.status(500).json({ status: 'error', msg: 'Error al registrar o actualizar negocio' });
  }
});

module.exports = router;
