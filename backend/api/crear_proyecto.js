const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.post('/', verificarToken, async (req, res) => {
  const usuario = req.usuario;

  try {
    const {
      titulo,
      tipo,
      descripcion_corta,
      descripcion_larga,
      categoria,
      monto,
      plazo,
      retorno,
      porcentaje_disponible,
      precio_porcentaje
    } = req.body;

    // 🚫 Validación de campos obligatorios
    if (!titulo || !tipo || !descripcion_corta || !descripcion_larga || !categoria) {
      return res.status(400).json({ status: 'error', msg: 'Faltan campos obligatorios.' });
    }

    if (tipo !== 'prestamo' && tipo !== 'acciones') {
      return res.status(400).json({ status: 'error', msg: 'Tipo de proyecto inválido.' });
    }

    // Validación específica por tipo
    if (tipo === 'prestamo') {
      if (isNaN(monto) || isNaN(plazo) || isNaN(retorno)) {
        return res.status(400).json({ status: 'error', msg: 'Datos de préstamo inválidos.' });
      }
    } else if (tipo === 'acciones') {
      if (isNaN(porcentaje_disponible) || isNaN(precio_porcentaje)) {
        return res.status(400).json({ status: 'error', msg: 'Datos de acciones inválidos.' });
      }
    }

    const valores = [
      usuario.id,
      tipo,
      titulo,
      descripcion_corta,
      descripcion_larga,
      categoria,
      usuario.nombre,
      tipo === 'prestamo' ? parseFloat(monto) : null,
      tipo === 'prestamo' ? parseInt(plazo) : null,
      tipo === 'prestamo' ? parseFloat(retorno) : null,
      tipo === 'acciones' ? 0 : null,
      tipo === 'acciones' ? parseFloat(porcentaje_disponible) : null,
      tipo === 'acciones' ? parseFloat(precio_porcentaje) : null
    ];

    const [result] = await pool.execute(`
      INSERT INTO proyectos (
        usuario_id, tipo, titulo, descripcion_corta, descripcion_larga,
        categoria, nombre_usuario,
        necesario, plazo, retorno,
        porcentaje_vendido, porcentaje_disponible, precio_porcentaje
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, valores);

    res.json({ status: 'ok', msg: 'Proyecto enviado para revisión.' });

  } catch (err) {
    console.error('[PROYECTO ERROR]', err);
    res.status(500).json({ status: 'error', msg: 'Error al crear proyecto.' });
  }
});

module.exports = router;
