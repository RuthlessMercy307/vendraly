// api/receita_produto_lista.js
const mysql = require('mysql2/promise');
const config = require('../config');
const pool = mysql.createPool(config);
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { produto_id } = req.query;

    if (!produto_id) {
      return res.status(400).json({ erro: 'ID do produto é obrigatório' });
    }

    const [ingredientes] = await pool.execute(`
      SELECT
        rp.id,
        rp.insumo_id,
        p.nome AS nome_insumo,
        rp.quantidade_utilizada,
        rp.unidade
      FROM recetas_productos rp
      JOIN productos p ON rp.insumo_id = p.id
      WHERE rp.produto_id = ?
    `, [produto_id]);

    res.json(ingredientes);
  } catch (err) {
    console.error('Erro ao buscar receita do produto:', err);
    res.status(500).json({ erro: 'Erro ao carregar ingredientes' });
  }
});

module.exports = router;
