const mysql = require('mysql2/promise');
const config = require('../config');
const pool = mysql.createPool(config);
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const {
      insumo_origem,
      cantidad_origen,
      insumo_resultado,
      cantidad_resultado,
      usuario_id
    } = req.body;

    // Validación de datos
    if (!insumo_origem || !cantidad_origen || !insumo_resultado || !cantidad_resultado || !usuario_id) {
      return res.status(400).json({ erro: 'Dados incompletos' });
    }

    const cantidadOrigem = parseFloat(cantidad_origen);
    const cantidadResultado = parseFloat(cantidad_resultado);

    if (isNaN(cantidadOrigem) || isNaN(cantidadResultado) || cantidadOrigem <= 0 || cantidadResultado <= 0) {
      return res.status(400).json({ erro: 'Quantidades inválidas' });
    }

    // Validar existencia dos insumos
    const [origemData] = await pool.execute(
      'SELECT stock_actual, precio_costo FROM productos WHERE id = ? LIMIT 1',
      [insumo_origem]
    );

    const [resultadoData] = await pool.execute(
      'SELECT id FROM productos WHERE id = ? LIMIT 1',
      [insumo_resultado]
    );

    if (!origemData.length) {
      return res.status(404).json({ erro: 'Insumo de origem não encontrado' });
    }
    if (!resultadoData.length) {
      return res.status(404).json({ erro: 'Insumo de resultado não encontrado' });
    }

    if (origemData[0].stock_actual < cantidadOrigem) {
      return res.status(400).json({ erro: 'Estoque insuficiente do insumo de origem' });
    }

    // Calcular custo por unidade do resultado
    const precoUnitarioOrigem = parseFloat(origemData[0].precio_costo) || 0;
    const custoTotalOrigem = precoUnitarioOrigem * quantidadeOrigem;
    const precoUnitarioResultado = (custoTotalOrigem / cantidadResultado).toFixed(4);

    // Atualizar estoques
    await pool.execute(`
      UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?
    `, [cantidadOrigem, insumo_origem]);

    await pool.execute(`
      UPDATE productos SET stock_actual = stock_actual + ?, precio_costo = ? WHERE id = ?
    `, [cantidadResultado, precoUnitarioResultado, insumo_resultado]);

    // Registrar conversão
    await pool.execute(`
      INSERT INTO conversiones_insumos
      (insumo_origen_id, insumo_resultado_id, cantidad_origen, cantidad_resultado, usuario_id)
      VALUES (?, ?, ?, ?, ?)
    `, [insumo_origem, insumo_resultado, cantidadOrigem, cantidadResultado, usuario_id]);

    res.json({ sucesso: true, preco_resultado: precoUnitarioResultado });

  } catch (err) {
    console.error('Erro na conversão de insumos:', err);
    res.status(500).json({ erro: 'Erro interno na conversão' });
  }
});

module.exports = router;
