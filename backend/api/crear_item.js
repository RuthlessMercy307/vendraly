// api/crear_item.js
const express = require('express');
const router = express.Router();
const connection = require('../db');
const autenticar = require('../middleware/autenticar');

router.post('/', autenticar, (req, res) => {
  const usuario_id = req.usuario.id;
  const {
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
    desconto
  } = req.body;

  // Buscar el negocio_id del usuario logado
  const sqlNegocio = 'SELECT id FROM negocios WHERE usuario_id = ? LIMIT 1';
  connection.query(sqlNegocio, [usuario_id], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar negócio.' });
    if (results.length === 0) return res.status(403).json({ erro: 'Negócio não encontrado.' });

    const negocio_id = results[0].id;

    const sqlInsert = `INSERT INTO produtos (
      negocio_id, nome, tipo, preco_custo, preco_venta, stock_actual,
      stock_minimo, unidade_medida, vencimento, codigo_barras,
      ativo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;

    connection.query(sqlInsert, [
      negocio_id,
      nome,
      tipo,
      preco_custo,
      preco_venda || null,
      stock_atual,
      stock_minimo || 0,
      unidade || null,
      vencimento || null,
      codigo_barras || null
    ], (err, result) => {
      if (err) return res.status(500).json({ erro: 'Erro ao criar produto.' });
      const produto_id = result.insertId;

      // Se houver promoção, salvar também
      if (promocao_ativa == 1 && desconto > 0) {
        const sqlPromocao = `INSERT INTO promocoes (
          produto_id, descricao, desconto_porcentaje,
          data_inicio, data_fim, ativo
        ) VALUES (?, ?, ?, CURDATE(), NULL, 1)`;

        connection.query(sqlPromocao, [
          produto_id,
          `Desconto de ${desconto}%`,
          desconto
        ], (err) => {
          if (err) console.error('Erro ao salvar promoção:', err);
        });
      }

      res.json({ sucesso: true, id: produto_id });
    });
  });
});

module.exports = router;
