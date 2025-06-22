const mysql = require('mysql2/promise');
const config = require('../config');
const pool = mysql.createPool(config);
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { producto_id, cantidad, precio_unitario, usuario_id } = req.body;

    // Validación básica
    if (!producto_id || !cantidad || !precio_unitario || !usuario_id) {
      return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
    }

    const cantidadNum = parseFloat(cantidad);
    const precioNum = parseFloat(precio_unitario);

    if (isNaN(cantidadNum) || isNaN(precioNum)) {
      return res.status(400).json({ erro: 'Quantidade ou preço inválido' });
    }

    // Verificar si el producto existe
    const [produto] = await pool.execute(`SELECT id FROM productos WHERE id = ? LIMIT 1`, [producto_id]);
    if (produto.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    // Insertar la entrada en la tabla de registros
    await pool.execute(`
      INSERT INTO entradas_inventario (producto_id, cantidad, precio_unitario, registrado_por)
      VALUES (?, ?, ?, ?)
    `, [producto_id, cantidadNum, precioNum, usuario_id]);

    // Actualizar stock actual
    await pool.execute(`
      UPDATE productos SET stock_actual = stock_actual + ?
      WHERE id = ?
    `, [cantidadNum, producto_id]);

    res.json({ sucesso: true });

  } catch (err) {
    console.error('Erro ao registrar entrada:', err);
    res.status(500).json({ erro: 'Erro interno ao registrar entrada' });
  }
});

module.exports = router;
