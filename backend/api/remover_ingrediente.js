// api/remover_ingrediente.js
const mysql = require('mysql2/promise');
const config = require('../config');
const pool = mysql.createPool(config);
const express = require('express');
const router = express.Router();

router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ erro: 'ID do ingrediente é obrigatório' });
    }

    const [verifica] = await pool.execute(`SELECT id FROM recetas_productos WHERE id = ?`, [id]);

    if (verifica.length === 0) {
      return res.status(404).json({ erro: 'Ingrediente não encontrado' });
    }

    await pool.execute(`DELETE FROM recetas_productos WHERE id = ?`, [id]);

    res.json({ sucesso: true, mensagem: 'Ingrediente removido com sucesso' });
  } catch (err) {
    console.error('Erro ao remover ingrediente:', err);
    res.status(500).json({ erro: 'Erro ao remover ingrediente' });
  }
});

module.exports = router;
