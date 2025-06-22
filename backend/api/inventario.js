// ✅ BACKEND - api/inventario.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.get('/', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    // Buscar el negocio del usuario
    let negocioId = null;

    // SGW: el token ya tiene negocio_id embebido
    if (req.usuario.negocio_id) {
      negocioId = req.usuario.negocio_id;
    } else {
      // Admin normal: buscar en relacion_usuario_negocio
      const [negocioData] = await pool.execute(`
        SELECT negocio_id FROM relacion_usuario_negocio
        WHERE usuario_id = ? LIMIT 1
      `, [req.usuario.id]);

      if (negocioData.length === 0) {
        return res.status(403).json({ status: 'error', msg: 'Usuário sem negócio vinculado' });
      }

      negocioId = negocioData[0].negocio_id;
    }


    // Obtener los productos del negocio
    const [produtos] = await pool.execute(`
      SELECT p.id, p.nombre, p.tipo, p.precio_costo, p.precio_venta, p.stock_actual,
             p.stock_minimo, p.unidad_medida, p.vencimiento, p.codigo_barras,
             COALESCE(pr.descuento_porcentaje, 0) AS descuento, pr.activo AS promocao_ativa
      FROM productos p
      LEFT JOIN promociones pr ON pr.producto_id = p.id AND pr.activo = TRUE
      WHERE p.negocio_id = ? AND p.activo = TRUE
      ORDER BY p.nombre ASC
    `, [negocioId]);

    res.json({ status: 'ok', productos: produtos });
  } catch (err) {
    console.error('[inventario.js]', err);
    res.status(500).json({ status: 'error', msg: 'Erro ao carregar inventário' });
  }
});

module.exports = router;
