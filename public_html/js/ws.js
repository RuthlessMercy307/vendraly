var wsConnection = null;
var reconnectTimeout = null;
var userIdGlobal = null;

function initWebSocket(userId) {
  if (wsConnection && (wsConnection.readyState === WebSocket.OPEN || wsConnection.readyState === WebSocket.CONNECTING)) {
    console.warn('[WS] Ya hay una conexión activa o en proceso.');
    return;
  }

  userIdGlobal = userId;

  const protocol = location.protocol === 'https:' ? 'wss://' : 'ws://';
  const wsUrl = `${protocol}${location.hostname}/ws/`;

  wsConnection = new WebSocket(wsUrl);

  wsConnection.addEventListener('open', () => {
    console.log('[WS] ✅ Conectado a', wsUrl);
    sendWS({ type: 'identificar', usuario_id: userId });
    sendWS({ type: 'obtener_conversaciones' });
  });

  wsConnection.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (typeof window.handleWSMessage === 'function') {
        window.handleWSMessage(data);
      } else {
        console.warn('[WS] ⚠️ No se encontró window.handleWSMessage');
      }
    } catch (err) {
      console.error('[WS] ❌ Error al parsear mensaje:', err);
    }
  });

  wsConnection.addEventListener('close', (event) => {
    console.warn('[WS] ❌ Conexión cerrada', event.code || '', '-', event.reason || '');
    if (!reconnectTimeout) {
      reconnectTimeout = setTimeout(() => {
        console.log('[WS] 🔁 Reintentando conexión...');
        initWebSocket(userIdGlobal);
        reconnectTimeout = null;
      }, 3000);
    }
  });

  wsConnection.addEventListener('error', (err) => {
    console.error('[WS] ⚠️ Error en WebSocket:', err.message || err);
    if (wsConnection.readyState !== WebSocket.CLOSED) {
      wsConnection.close();
    }
  });
}

function sendWS(data) {
  if (!data || typeof data !== 'object') {
    console.warn('[WS] 🚫 Intento de envío inválido:', data);
    return;
  }

  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    try {
      wsConnection.send(JSON.stringify(data));
    } catch (err) {
      console.error('[WS] ❌ Error al enviar datos:', err);
    }
  } else {
    console.warn('[WS] 🔌 No conectado. No se pudo enviar:', data);
  }
}

// 🧹 Para cerrar y limpiar manualmente la conexión si es necesario
function cerrarWebSocket() {
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
}

window.initWebSocket = initWebSocket;
window.sendWS = sendWS;
window.cerrarWebSocket = cerrarWebSocket;
