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
      // Map this connection to a user_id
      ws.userId = data.usuario_id;
      clients.set(data.usuario_id, ws);
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
    default:
      // otros tipos
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
