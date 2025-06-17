var wsConnection;

function initWebSocket(userId) {
  wsConnection = new WebSocket(`ws://${location.hostname}:8080`);
  wsConnection.addEventListener('open', () => {
    wsConnection.send(JSON.stringify({ type: 'identificar', usuario_id: userId }));
    wsConnection.send(JSON.stringify({ type: 'obtener_conversaciones' }));
  });

  wsConnection.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (window.handleWSMessage) {
        window.handleWSMessage(data);
      }
    } catch (err) {
      console.error('WS parse error', err);
    }
  });
}

function sendWS(data) {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    wsConnection.send(JSON.stringify(data));
  }
}

window.initWebSocket = initWebSocket;
window.sendWS = sendWS;
