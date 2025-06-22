// api/receita_produto.js
const mysql = require('mysql2/promise');
const config = require('../config');
const pool = mysql.createPool(config);
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { produto_id, insumo_id, quantidade_utilizada } = req.body;

    if (!produto_id || !insumo_id || !quantidade_utilizada) {
      return res.status(400).json({ erro: 'Dados incompletos' });
    }

    // Verifica se produto e insumo existem
    const [produto] = await pool.execute('SELECT id FROM productos WHERE id = ?', [produto_id]);
    const [insumo] = await pool.execute('SELECT id FROM productos WHERE id = ?', [insumo_id]);

    if (!produto.length || !insumo.length) {
      return res.status(404).json({ erro: 'Produto ou insumo não encontrado' });
    }

    // Verifica se já existe esse insumo na receita (evita duplicados)
    const [existe] = await pool.execute(
      'SELECT id FROM recetas_productos WHERE produto_id = ? AND insumo_id = ?',
      [produto_id, insumo_id]
    );

    if (existe.length) {
      return res.status(400).json({ erro: 'Insumo já registrado na receita. Edite em vez de duplicar.' });
    }

    // Insere ingrediente na receita
    await pool.execute(`
      INSERT INTO recetas_productos (produto_id, insumo_id, quantidade_utilizada, unidade)
      VALUES (?, ?, ?, 'g')
    `, [produto_id, insumo_id, quantidade_utilizada]);

    res.json({ sucesso: true });

  } catch (err) {
    console.error('Erro ao adicionar ingrediente na receita:', err);
    res.status(500).json({ erro: 'Erro interno ao salvar receita' });
  }
});

module.exports = router;
