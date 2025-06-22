const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // Si estás usando JWT sin sesiones, no hay nada que hacer realmente
  res.json({ status: 'ok', msg: 'Sesión finalizada. Puedes eliminar el token en el cliente.' });
});

module.exports = router;
