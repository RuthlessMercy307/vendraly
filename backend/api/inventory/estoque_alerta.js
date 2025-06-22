const mysql = require('mysql2/promise');
const config = require('../config');
const pool = mysql.createPool(config);
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { negocio_id } = req.query;

    if (!negocio_id) {
      return res.status(400).json({ erro: 'Negócio não especificado' });
    }

    const [resultados] = await pool.execute(`
      SELECT id, nombre, stock_actual, stock_minimo, unidad_medida
      FROM productos
      WHERE activo = TRUE
        AND negocio_id = ?
        AND stock_minimo IS NOT NULL
        AND stock_actual <= stock_minimo
    `, [negocio_id]);

    res.json(resultados);
  } catch (err) {
    console.error('Erro ao buscar alertas de estoque:', err);
    res.status(500).json({ erro: 'Erro interno ao buscar alertas' });
  }
});

module.exports = router;
