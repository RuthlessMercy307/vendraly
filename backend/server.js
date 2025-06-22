require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const mysql = require('mysql2/promise');
const config = require('./config');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API (🌐 rutas públicas y privadas)
app.use('/api/register', require('./api/register'));
app.use('/api/login', require('./api/login'));
app.use('/api/logout', require('./api/logout'));
app.use('/api/verificar_sesion', require('./api/verificar_sesion'));
app.use('/api/verificar_email', require('./api/verificar_email'));
app.use('/api/verificar_token_estado', require('./api/verificar_token_estado'));
app.use('/api/test_correo', require('./api/test_correo'));

app.use('/api/crear_proyecto', require('./api/crear_proyecto'));
app.use('/api/proyectos_activos', require('./api/proyectos_activos'));
app.use('/api/ver_mis_proyectos', require('./api/ver_mis_proyectos'));
app.use('/api/portafolio_datos', require('./api/portafolio_datos'));

app.use('/api/mi_plan', require('./api/mi_plan'));
app.use('/api/activar_plan', require('./api/activar_plan'));

app.use('/api/negocio_actual', require('./api/negocio_actual'));
app.use('/api/actualizar_negocio', require('./api/actualizar_negocio'));
app.use('/api/elegir_plan', require('./api/elegir_plan'));
app.use('/api/registrar_negocio', require('./api/registrar_negocio'));
app.use('/api/usuarios_sgw', require('./api/usuarios_sgw'));
app.use('/api/crear_usuario_sgw', require('./api/crear_usuario_sgw'));
app.use('/api/eliminar_usuario_sgw', require('./api/eliminar_usuario_sgw'));
app.use('/api/login_sgw', require('./api/login_sgw'));

app.use('/api/inventario', require('./api/inventario'));
app.use('/api/item', require('./api/item'));
app.use('/api/salvar_item', require('./api/salvar_item'));
app.use('/api/entrada_inventario', require('./api/entrada_inventario'));
app.use('/api/conversao_insumo', require('./api/conversao_insumo'));
app.use('/api/receita_produto', require('./api/receita_produto'));
app.use('/api/receita_produto_lista', require('./api/receita_produto_lista'));
app.use('/api/remover_ingrediente', require('./api/remover_ingrediente'));
app.use('/api/estoque_alerta', require('./api/estoque_alerta'));


// WebSocket 💬
const clients = new Map();

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
  if (!ws || typeof data !== 'object' || !data.type) return;

  try {
    switch (data.type) {
      case 'identificar':
        if (!data.usuario_id) return;
        ws.userId = data.usuario_id;
        clients.set(ws.userId, ws);
        console.log(`🔗 Usuario ${ws.userId} conectado`);
        break;

      case 'obtener_conversaciones': {
        if (!ws.userId) return;

        const [convs] = await pool.execute(`
          SELECT c.id, c.tipo, c.nombre
          FROM conversaciones c
          JOIN miembros_conversacion m ON c.id = m.conversacion_id
          WHERE m.usuario_id = ?
        `, [ws.userId]);

        for (const conv of convs) {
          const [participantes] = await pool.execute(`
            SELECT u.id, u.nombre, u.rol
            FROM miembros_conversacion m
            JOIN usuarios u ON m.usuario_id = u.id
            WHERE m.conversacion_id = ?
          `, [conv.id]);
          conv.participantes = participantes;

          const [[ultimo]] = await pool.execute(`
            SELECT id FROM mensajes
            WHERE conversacion_id = ?
            ORDER BY fecha DESC LIMIT 1
          `, [conv.id]);

          const [[lectura]] = await pool.execute(`
            SELECT ultimo_mensaje_id FROM ultima_lectura
            WHERE conversacion_id = ? AND usuario_id = ?
          `, [conv.id, ws.userId]);

          conv.no_leido = ultimo && (!lectura || lectura.ultimo_mensaje_id < ultimo.id);
        }

        ws.send(JSON.stringify({ type: 'lista_conversaciones', conversaciones: convs }));
        break;
      }

      case 'abrir_conversacion': {
        if (!ws.userId || !data.conversacion_id) return;
        const convId = data.conversacion_id;

        const [msgs] = await pool.execute(
          'SELECT id, texto, emisor_id, fecha FROM mensajes WHERE conversacion_id = ? ORDER BY fecha ASC',
          [convId]
        );
        msgs.forEach(m => { m.es_mio = m.emisor_id === ws.userId; });

        const [participantes] = await pool.execute(`
          SELECT u.id, u.nombre, u.rol
          FROM miembros_conversacion m
          JOIN usuarios u ON m.usuario_id = u.id
          WHERE m.conversacion_id = ?
        `, [convId]);

        const formatted = participantes.map(p => ({
          id: p.id,
          nombre: p.nombre,
          rol: p.rol,
          es_mio: p.id === ws.userId
        }));

        let propietario = null;
        const [[conv]] = await pool.execute(`SELECT tipo FROM conversaciones WHERE id = ?`, [convId]);
        if (conv && conv.tipo === 'grupo') {
          const [[owner]] = await pool.execute(`
            SELECT u.nombre FROM miembros_conversacion m
            JOIN usuarios u ON m.usuario_id = u.id
            WHERE m.conversacion_id = ?
            ORDER BY m.id ASC LIMIT 1
          `, [convId]);
          propietario = owner?.nombre || null;
        }

        const [[leido]] = await pool.execute(`
          SELECT ultimo_mensaje_id, fecha
          FROM ultima_lectura
          WHERE conversacion_id = ? AND usuario_id != ?
        `, [convId, ws.userId]);

        ws.send(JSON.stringify({
          type: 'mensajes',
          conversacion_id: convId,
          mensajes: msgs,
          participantes: formatted,
          propietario,
          leido_por_otro: leido || null
        }));
        break;
      }

      case 'mensaje': {
        if (!ws.userId || !data.conversacion_id || !data.texto?.trim()) return;

        const [res] = await pool.execute(
          'INSERT INTO mensajes (conversacion_id, emisor_id, texto) VALUES (?, ?, ?)',
          [data.conversacion_id, ws.userId, data.texto]
        );

        const mensaje_id = res.insertId;

        await broadcastToConversation(data.conversacion_id, {
          type: 'mensaje',
          conversacion_id: data.conversacion_id,
          mensaje_id,
          emisor_id: ws.userId,
          texto: data.texto
        });
        break;
      }

      case 'visto': {
        if (!ws.userId || !data.conversacion_id || !data.mensaje_id) return;

        await pool.execute(`
          REPLACE INTO ultima_lectura (usuario_id, conversacion_id, ultimo_mensaje_id)
          VALUES (?, ?, ?)`,
          [ws.userId, data.conversacion_id, data.mensaje_id]
        );
        break;
      }

      default:
        console.warn(`[WS] Tipo de mensaje desconocido: ${data.type}`);
    }
  } catch (err) {
    console.error(`[WS] ❌ Error procesando tipo ${data.type}:`, err.message || err);
  }
}

wss.on('connection', ws => {
  ws.on('message', async msg => {
    try {
      const data = JSON.parse(msg);
      await handleMessage(ws, data);
    } catch (err) {
      console.error('[WS] ❌ Error al parsear mensaje:', err.message || err);
    }
  });

  ws.on('close', () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log(`🔌 Usuario ${ws.userId} desconectado`);
    }
  });
});

server.listen(8080, () => {
  console.log('🚀 Servidor WebSocket + API corriendo en puerto 8080');
});
