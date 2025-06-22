const nodemailer = require('nodemailer');

const NOMBRE_APP = 'Vendraly';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // falso si usas STARTTLS (587)
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ✅ Validación simple de email
function esEmailValido(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && re.test(email);
}

// 📩 Enviar correo de verificación de cuenta
async function enviarVerificacion(email, nombre, token) {
  if (!esEmailValido(email)) {
    console.warn(`[MAILER] Email inválido: ${email}`);
    return;
  }

  const url = `https://vendraly.com/verificar.html?token=${token}`;
  const html = `
    <h2>Hola ${nombre},</h2>
    <p>Gracias por registrarte en ${NOMBRE_APP}.</p>
    <p>Haz clic en el siguiente botón para verificar tu correo:</p>
    <a href="${url}" style="padding:10px 20px;background:#2563EB;color:white;border-radius:6px;text-decoration:none;">Verificar correo</a>
    <p>Si tú no creaste esta cuenta, puedes ignorar este mensaje.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"${NOMBRE_APP}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Verifica tu correo en ${NOMBRE_APP}`,
      html
    });
    console.log(`[MAILER] ✅ Correo de verificación enviado a ${email}`);
  } catch (err) {
    console.error(`[MAILER] ❌ Error al enviar a ${email}:`, err.message || err);
  }
}

// 🔐 Enviar correo de recuperación de contraseña
async function enviarRecuperacion(email, nombre, token) {
  if (!esEmailValido(email)) {
    console.warn(`[MAILER] Email inválido: ${email}`);
    return;
  }

  const url = `https://vendraly.com/reset.html?token=${token}`;
  const html = `
    <h2>Hola ${nombre},</h2>
    <p>Recibimos una solicitud para restablecer tu contraseña en ${NOMBRE_APP}.</p>
    <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
    <a href="${url}" style="padding:10px 20px;background:#D97706;color:white;border-radius:6px;text-decoration:none;">Restablecer contraseña</a>
    <p>Si no solicitaste este cambio, ignora este mensaje.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"${NOMBRE_APP}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Restablece tu contraseña en ${NOMBRE_APP}`,
      html
    });
    console.log(`[MAILER] ✅ Correo de recuperación enviado a ${email}`);
  } catch (err) {
    console.error(`[MAILER] ❌ Error al enviar recuperación:`, err.message || err);
  }
}

// 🔄 Enviar correo para confirmar cambio de email
async function enviarCambioEmail(email, nombre, token) {
  if (!esEmailValido(email)) {
    console.warn(`[MAILER] Email inválido: ${email}`);
    return;
  }

  const url = `https://vendraly.com/cambiar_email.html?token=${token}`;
  const html = `
    <h2>Hola ${nombre},</h2>
    <p>Estás por confirmar un cambio de correo en ${NOMBRE_APP}.</p>
    <p>Haz clic en el siguiente botón para confirmar tu nuevo correo:</p>
    <a href="${url}" style="padding:10px 20px;background:#10B981;color:white;border-radius:6px;text-decoration:none;">Confirmar nuevo correo</a>
    <p>Si no hiciste esta solicitud, ignora este mensaje.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"${NOMBRE_APP}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Confirma tu nuevo correo en ${NOMBRE_APP}`,
      html
    });
    console.log(`[MAILER] ✅ Correo de cambio de email enviado a ${email}`);
  } catch (err) {
    console.error(`[MAILER] ❌ Error al enviar cambio de email:`, err.message || err);
  }
}

// 🧪 Genérico para pruebas manuales
async function enviarCorreo({ to, subject, html }) {
  return transporter.sendMail({
    from: `"${NOMBRE_APP}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html
  });
}

module.exports = {
  enviarVerificacion,
  enviarRecuperacion,
  enviarCambioEmail,
  enviarCorreo
};
