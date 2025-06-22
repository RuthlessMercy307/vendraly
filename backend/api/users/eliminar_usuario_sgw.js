// ✅ BACKEND - api/eliminar_usuario_sgw.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config');
const verificarToken = require('../middlewares/verificarToken');

const pool = mysql.createPool(config);

router.delete('/:id', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const usuarioSgwId = parseInt(req.params.id);

  if (isNaN(usuarioSgwId)) {
    return res.status(400).json({ status: 'error', msg: 'ID inválido' });
  }

  try {
    // Validar que el usuario autenticado es dueño del negocio al que pertenece el usuario_sgw
    const [rows] = await pool.execute(`
      SELECT u.id
      FROM usuarios_sgw u
      JOIN negocios n ON n.id = u.negocio_id
      JOIN relacion_usuario_negocio r ON r.negocio_id = n.id
      WHERE u.id = ? AND r.usuario_id = ? AND r.rol = 'dueño'
      LIMIT 1
    `, [usuarioSgwId, usuarioId]);

    if (rows.length === 0) {
      return res.status(403).json({ status: 'error', msg: 'No tienes permiso para eliminar este usuario' });
    }

    await pool.execute(`DELETE FROM usuarios_sgw WHERE id = ?`, [usuarioSgwId]);

    res.json({ status: 'ok', msg: 'Usuario eliminado correctamente' });

  } catch (err) {
    console.error('[ERROR eliminar_usuario_sgw]:', err);
    res.status(500).json({ status: 'error', msg: 'Error al eliminar usuario' });
  }
});

module.exports = router;
