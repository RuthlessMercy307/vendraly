const WebSocket = require('ws');
const mysql = require('mysql2/promise');
const config = require('./config.js');

const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map(); // userId -> ws

async function broadcastToConversation(convId, messageData) {
  const [rows] = await pool.execute(
    'SELECT usuario_id FROM miembros_conversacion WHERE conversacion_id = ?',
    [convId]
  );
  rows.forEach(row => {
    const ws = clients.get(row.usuario_id);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(messageData));
    }
  });
}

async function handleMessage(ws, data) {
  switch (data.type) {
    case 'identificar':
      ws.userId = data.usuario_id;
      clients.set(data.usuario_id, ws);
      break;

    case 'obtener_conversaciones':
      if (!ws.userId) return;
      const [convs] = await pool.execute(
        `SELECT c.id, c.tipo, c.nombre
         FROM conversaciones c
         JOIN miembros_conversacion m ON c.id = m.conversacion_id
         WHERE m.usuario_id = ?`,
        [ws.userId]
      );
      for (const conv of convs) {
        const [parts] = await pool.execute(
          `SELECT u.id, u.nombre, u.rol
           FROM miembros_conversacion m
           JOIN usuarios u ON m.usuario_id = u.id
           WHERE m.conversacion_id = ?`,
          [conv.id]
        );
        conv.participantes = parts;
      }
      ws.send(JSON.stringify({ type: 'lista_conversaciones', conversaciones: convs }));
      break;

    case 'abrir_conversacion':
      if (!ws.userId) return;
      const convId = data.conversacion_id;
      const [msgs] = await pool.execute(
        'SELECT id, texto, emisor_id, fecha FROM mensajes WHERE conversacion_id = ? ORDER BY fecha ASC',
        [convId]
      );
      msgs.forEach(m => {
        m.es_mio = m.emisor_id === ws.userId;
      });
      const [[{ tipo } = {}]] = await pool.query(
        'SELECT tipo FROM conversaciones WHERE id = ?', 
        [convId]
      );
      const [parts2] = await pool.execute(
        `SELECT u.id, u.nombre, u.rol
         FROM miembros_conversacion m
         JOIN usuarios u ON m.usuario_id = u.id
         WHERE m.conversacion_id = ?`,
        [convId]
      );
      const participantes = parts2.map(p => ({
        nombre: p.nombre,
        es_mio: p.id === ws.userId,
        id: p.id,
        rol: p.rol
      }));
      let propietario = null;
      if (tipo === 'proyecto') {
        const [[owner]] = await pool.execute(
          `SELECT u.nombre FROM miembros_conversacion m
           JOIN usuarios u ON m.usuario_id = u.id
           WHERE m.conversacion_id = ? ORDER BY m.id ASC LIMIT 1`,
          [convId]
        );
        propietario = owner ? owner.nombre : null;
      }
      const [lect] = await pool.execute(
        `SELECT ultimo_mensaje_id, fecha 
         FROM ultima_lectura 
         WHERE conversacion_id = ? AND usuario_id != ?`,
        [convId, ws.userId]
      );
      ws.send(JSON.stringify({
        type: 'mensajes',
        conversacion_id: convId,
        mensajes: msgs,
        participantes,
        propietario,
        leido_por_otro: lect[0] || null
      }));
      break;

    case 'mensaje':
      if (!ws.userId) return;
      const { conversacion_id, texto } = data;
      const [result] = await pool.execute(
        'INSERT INTO mensajes (conversacion_id, emisor_id, texto) VALUES (?, ?, ?)',
        [conversacion_id, ws.userId, texto]
      );
      const mensajeId = result.insertId;
      await broadcastToConversation(conversacion_id, {
        type: 'mensaje',
        conversacion_id,
        emisor_id: ws.userId,
        mensaje_id: mensajeId,
        texto
      });
      break;

    case 'visto':
      if (!ws.userId) return;
      await pool.execute(
        'REPLACE INTO ultima_lectura (usuario_id, conversacion_id, ultimo_mensaje_id) VALUES (?, ?, ?)',
        [ws.userId, data.conversacion_id, data.mensaje_id]
      );
      break;

    default:
      break;
  }
}

wss.on('connection', ws => {
  ws.on('message', async msg => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (err) {
      return;
    }
    try {
      await handleMessage(ws, data);
    } catch (err) {
      console.error(err);
    }
  });

  ws.on('close', () => {
    if (ws.userId) {
      clients.delete(ws.userId);
    }
  });
});

console.log('WebSocket server running on port 8080');
