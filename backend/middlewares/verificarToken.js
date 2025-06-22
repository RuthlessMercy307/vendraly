const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', msg: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];

  if (!token || token.length < 10) {
    return res.status(401).json({ status: 'error', msg: 'Token inválido o incompleto' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    // Si es usuario normal, debe tener verificado
    if (decoded?.verificado === false) {
      return res.status(403).json({ status: 'error', msg: 'Debes verificar tu correo' });
    }

    req.usuario = {
      id: decoded.id,
      nombre: decoded.nombre,
      rol: decoded.rol,
      negocio_id: decoded.negocio_id || null  // por si SGW
    };

    next();
  } catch (err) {
    console.warn('[JWT INVALIDO]', err.message);
    return res.status(401).json({ status: 'error', msg: 'Token inválido o expirado' });
  }
}

module.exports = verificarToken;
