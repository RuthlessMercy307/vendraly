let conversacionAbiertaId = null;
let usuarioId = null;

checkLoginStatus();
setInterval(() => {
  sendWS({ type: 'obtener_conversaciones' });
}, 15000); // cada 15 segundos

function toggleMenu() {
  const links = document.querySelector('.nav-links');
  links.classList.toggle('open');
}

async function checkLoginStatus() {
  const data = await fetchUserSession();
  if (data.logged_in) {
    document.getElementById('userPanel').classList.remove('hidden');
    document.getElementById('userName').innerText = `Hola, ${data.nombre}`;
    usuarioId = data.id;
    initWebSocket(usuarioId);
  } else {
    window.location.href = "../index.html";
  }
}

function logout() {
  fetch('../php/logout.php')
    .then(() => window.location.href = "../index.html");
}

const mensajeForm = document.getElementById('mensajeForm');
if (mensajeForm) {
  mensajeForm.addEventListener('submit', enviarMensaje);
}

function enviarMensaje(e) {
  e.preventDefault();
  const input = mensajeForm.querySelector('input[type="text"]');
  const texto = input.value.trim();
  if (!texto || !conversacionAbiertaId) return;
  sendWS({ type: 'mensaje', conversacion_id: conversacionAbiertaId, texto });
  input.value = '';
}

function handleWSMessage(data) {
  switch (data.type) {
    case 'lista_conversaciones':
      renderConversaciones(data.conversaciones);
      break;
    case 'mensajes':
      mostrarConversacion(data);
      break;
    case 'mensaje':
      recibirMensaje(data);
      break;
  }
}
window.handleWSMessage = handleWSMessage;

function renderConversaciones(convs) {
  const lista = document.getElementById('listaChats');
  lista.innerHTML = '';
  if (!convs.length) {
    lista.innerHTML = '<li><strong>No hay conversaciones</strong></li>';
    return;
  }
  convs.forEach(conv => {
    let nombreFinal = conv.nombre;
    if (conv.tipo === 'privado') {
      const otro = conv.participantes.find(p => p.id != usuarioId);
      if (otro) nombreFinal = otro.nombre;
    }

    const li = document.createElement('li');
    li.dataset.id = conv.id;
    li.dataset.nombre = nombreFinal;
    li.textContent = nombreFinal;

    // Agrega clase visual si tiene mensajes no leídos
    if (conv.no_leido) {
      li.classList.add('no-leido');
    }

    li.addEventListener('click', () => abrirConversacion(conv.id, nombreFinal));
    lista.appendChild(li);
  });
}

function abrirConversacion(id, nombre) {
  const mensajesDiv = document.getElementById('contenedorMensajes');
  const titulo = document.getElementById('nombreChat');
  const participantes = document.getElementById('listaParticipantes');
  const propietario = document.getElementById('chatPropietario');

  titulo.textContent = nombre;
  mensajeForm.dataset.conversacionId = id;
  conversacionAbiertaId = id;
  mensajesDiv.innerHTML = '';
  participantes.innerHTML = '';
  propietario.textContent = '--';

  sendWS({ type: 'abrir_conversacion', conversacion_id: id });
  const liActivo = document.querySelector(`li[data-id="${id}"]`);
  if (liActivo) liActivo.classList.remove('no-leido');
}

function mostrarConversacion(data) {
  const mensajesDiv = document.getElementById('contenedorMensajes');
  const participantes = document.getElementById('listaParticipantes');
  const propietario = document.getElementById('chatPropietario');

  mensajesDiv.innerHTML = '';
  participantes.innerHTML = '';

  if (data.participantes) {
    data.participantes.forEach(p => {
      const li = document.createElement('li');
      li.textContent = p.nombre + (p.es_mio ? ' (Tú)' : '');
      participantes.appendChild(li);
    });
  }
  if (data.propietario) {
    propietario.textContent = data.propietario;
  }

  renderizarMensajes(data, usuarioId);

  if (data.mensajes && data.mensajes.length) {
    const ultimo = data.mensajes[data.mensajes.length - 1];
    sendWS({ type: 'visto', conversacion_id: data.conversacion_id, mensaje_id: ultimo.id });
  }
}

function recibirMensaje(data) {
  if (data.conversacion_id === conversacionAbiertaId) {
    const mensajesDiv = document.getElementById('contenedorMensajes');
    const msg = document.createElement('div');
    msg.className = data.emisor_id === usuarioId ? 'mensaje yo' : 'mensaje otro';
    msg.innerHTML = `<div class="burbuja">${data.texto}</div>`;
    mensajesDiv.appendChild(msg);
    mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
    sendWS({ type: 'visto', conversacion_id: data.conversacion_id, mensaje_id: data.mensaje_id });
  } else {
    // Agrega punto rojo en lista si mensaje llega fuera del chat abierto
    const li = document.querySelector(`li[data-id="${data.conversacion_id}"]`);
    if (li && !li.classList.contains('no-leido')) {
      li.classList.add('no-leido');
    }
  }
}

function renderizarMensajes(data, miId) {
  const mensajesDiv = document.getElementById('contenedorMensajes');
  mensajesDiv.innerHTML = '';

  const leido = data.leido_por_otro;
  const ultimoLeidoId = leido?.ultimo_mensaje_id;
  const fechaLeido = leido?.fecha ? new Date(leido.fecha) : null;

  data.mensajes.forEach(m => {
    const msg = document.createElement('div');
    msg.className = `mensaje ${m.es_mio ? 'yo' : 'otro'}`;
    msg.innerHTML = `<div class="burbuja">${m.texto}</div><div class="visto-info" style="font-size:12px;color:#777;margin-top:3px;text-align:right;"></div>`;
    mensajesDiv.appendChild(msg);

    if (m.es_mio && m.id == ultimoLeidoId && fechaLeido) {
      const vistoTexto = calcularVistoTexto(fechaLeido);
      const vistoInfo = msg.querySelector('.visto-info');
      if (vistoInfo) {
        vistoInfo.textContent = `✔ ${vistoTexto}`;
      }
    }
  });

  mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
}

function calcularVistoTexto(fecha) {
  const ahora = new Date();
  const diff = (ahora - fecha) / 1000;
  if (diff < 60) return 'Visto hace pocos segundos';
  if (diff < 3600) return `Visto hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Visto hace ${Math.floor(diff / 3600)} hrs`;
  return `Visto el ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString().slice(0,5)}`;
}
