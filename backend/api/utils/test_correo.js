const express = require('express');
const router = express.Router();
const { enviarCorreo } = require('./mailer');

router.get('/', async (req, res) => {
  try {
    await enviarCorreo({
      to: 'ruthlessmercy307@gmail.com',
      subject: 'Prueba de correo desde Vendraly',
      html: '<h2>Hola</h2><p>Este es un test de envío SMTP</p>'
    });

    res.send('Correo enviado correctamente');
  } catch (err) {
    console.error('Error al enviar correo:', err);
    res.status(500).send('Error al enviar correo');
  }
});

module.exports = router;
