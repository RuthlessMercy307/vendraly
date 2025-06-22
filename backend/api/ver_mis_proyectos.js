const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.get('/', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, titulo, tipo, estado, necesario, porcentaje_disponible, 
        precio_porcentaje, retorno, plazo, descripcion_corta, categoria
      FROM proyectos
      WHERE usuario_id = ?
      ORDER BY fecha_publicacion DESC
    `, [usuarioId]);

    res.json({ status: 'ok', proyectos: rows });
  } catch (err) {
    console.error('[ERROR ver_mis_proyectos]:', err);
    res.status(500).json({ status: 'error', msg: 'Error al obtener proyectos' });
  }
});

module.exports = router;
