const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.post('/', verificarToken, async (req, res) => {
  try {
    const {
      id,
      nome,
      tipo,
      preco_custo,
      preco_venda,
      stock_atual,
      stock_minimo,
      unidade,
      vencimento,
      codigo_barras,
      promocao_ativa,
      desconto,
      descripcion
    } = req.body;

    if (!nome || !tipo || preco_custo === undefined || isNaN(preco_custo)) {
      return res.status(400).json({ status: 'error', msg: 'Dados obrigatórios inválidos' });
    }

    const negocio_id = req.usuario.negocio_id;
    if (!negocio_id) return res.status(403).json({ status: 'error', msg: 'Acesso negado (sem negócio vinculado)' });

    const custo = parseFloat(preco_custo) || 0;
    const venda = preco_venda !== undefined ? parseFloat(preco_venda) : null;
    const estoque = parseInt(stock_atual) || 0;
    const estoque_min = parseInt(stock_minimo) || 0;
    const desconto_pct = parseFloat(desconto) || 0;
    const promocao = promocao_ativa == 1 ? 1 : 0;
    const desc = descripcion || null;

    if (id) {
      await pool.execute(`
        UPDATE productos SET
          nombre = ?, tipo = ?, precio_costo = ?, precio_venta = ?,
          stock_actual = ?, stock_minimo = ?, unidad_medida = ?,
          vencimiento = ?, codigo_barras = ?, descripcion = ?, activo = 1
        WHERE id = ? AND negocio_id = ?
      `, [
        nome, tipo, custo, venda,
        estoque, estoque_min, unidade,
        vencimento || null, codigo_barras || null, desc,
        id, negocio_id
      ]);

      if (promocao) {
        await pool.execute(`
          INSERT INTO promociones (producto_id, descripcion, descuento_porcentaje, activo)
          VALUES (?, ?, ?, 1)
          ON DUPLICATE KEY UPDATE
          descripcion = VALUES(descripcion),
          descuento_porcentaje = VALUES(descuento_porcentaje),
          activo = 1
        `, [id, 'Promoción activa', desconto_pct]);
      } else {
        await pool.execute(`UPDATE promociones SET activo = 0 WHERE producto_id = ?`, [id]);
      }

    } else {
      if (codigo_barras) {
        const [duplicado] = await pool.execute(`
          SELECT id FROM productos
          WHERE codigo_barras = ? AND negocio_id = ? LIMIT 1
        `, [codigo_barras, negocio_id]);

        if (duplicado.length > 0) {
          return res.status(409).json({ status: 'error', msg: 'Código de barras já cadastrado' });
        }
      }

      const [result] = await pool.execute(`
        INSERT INTO productos (
          negocio_id, nombre, tipo, precio_costo, precio_venta,
          stock_actual, stock_minimo, unidad_medida,
          vencimiento, codigo_barras, descripcion, activo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        negocio_id, nome, tipo, custo, venda,
        estoque, estoque_min, unidade,
        vencimento || null, codigo_barras || null, desc
      ]);

      const novoId = result.insertId;

      if (promocao) {
        await pool.execute(`
          INSERT INTO promociones (producto_id, descripcion, descuento_porcentaje, activo)
          VALUES (?, ?, ?, 1)
        `, [novoId, 'Promoción activa', desconto_pct]);
      }
    }

    return res.json({ status: 'ok' });

  } catch (err) {
    console.error('[ERROR salvar_item.js]', err);
    res.status(500).json({ status: 'error', msg: 'Erro ao salvar produto' });
  }
});

module.exports = router;
