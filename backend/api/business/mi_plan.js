const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.get('/', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const [rows] = await pool.execute(`
      SELECT p.id, p.nombre, p.descripcion, p.limite_negocios, p.limite_usuarios, p.precio_mensual
      FROM usuarios u
      JOIN planes p ON u.plan_id = p.id
      WHERE u.id = ?
    `, [usuarioId]);

    if (rows.length === 0) {
      return res.json({ status: 'error', msg: 'No tienes un plan activo' });
    }

    res.json({ status: 'ok', plan: rows[0] });

  } catch (err) {
    console.error('[ERROR mi_plan]:', err);
    res.status(500).json({ status: 'error', msg: 'Error al obtener plan' });
  }
});

module.exports = router;
