const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.get('/', verificarToken, async (req, res) => {
  try {
    const [proyectos] = await pool.execute(`
      SELECT 
        p.id, p.titulo, p.tipo, p.descripcion_corta, p.descripcion_larga,
        p.categoria, p.usuario_id, p.nombre_usuario, p.fecha_publicacion,
        p.acumulado, p.necesario, p.retorno, p.plazo,
        p.porcentaje_disponible, p.porcentaje_vendido, p.precio_porcentaje
      FROM proyectos p
      WHERE p.estado = 'activo'
      ORDER BY p.fecha_publicacion DESC
    `);

    res.json({
      status: 'ok',
      cantidad: proyectos.length,
      proyectos
    });

  } catch (err) {
    console.error('[ERROR EN /api/proyectos_activos]', err.message || err);
    res.status(500).json({
      status: 'error',
      msg: 'Ocurrió un problema al obtener los proyectos activos.'
    });
  }
});

module.exports = router;
