// api/item.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.get('/', verificarToken, async (req, res) => {
  const { id } = req.query;
  console.log('[GET /api/item] ID recibido:', id);

  if (!id) return res.status(400).json({ status: 'error', msg: 'ID requerido' });

  try {
    const [rows] = await pool.execute(`
      SELECT * FROM productos WHERE id = ? LIMIT 1
    `, [id]);

    if (rows.length === 0) {
      console.log('[GET /api/item] No encontrado');
      return res.status(404).json({ status: 'error', msg: 'Producto no encontrado' });
    }

    console.log('[GET /api/item] Resultado:', rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error('[ERROR /api/item]', err);
    res.status(500).json({ status: 'error', msg: 'Erro ao buscar produto' });
  }
});


module.exports = router;
