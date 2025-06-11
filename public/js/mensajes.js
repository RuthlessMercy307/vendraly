checkLoginStatus();
cargarConversaciones();

function toggleMenu() {
  const links = document.querySelector('.nav-links');
  links.classList.toggle('open');
}

async function checkLoginStatus() {
  const data = await fetchUserSession();
  if (data.logged_in) {
    document.getElementById('userPanel').classList.remove('hidden');
    document.getElementById('userName').innerText = `Hola, ${data.nombre}`;
  } else {
    window.location.href = "../index.html";
  }
}

function logout() {
  fetch('../php/logout.php')
    .then(() => window.location.href = "../index.html");
}

// Formulario de envío de mensaje
const mensajeForm = document.getElementById('mensajeForm');
if (mensajeForm) {
  mensajeForm.addEventListener('submit', enviarMensaje);
}

function enviarMensaje(e) {
  e.preventDefault();
  const input = mensajeForm.querySelector('input[type="text"]');
  const texto = input.value.trim();
  const conversacionId = mensajeForm.dataset.conversacionId;

  if (!texto || !conversacionId) return;

  const body = new URLSearchParams({
    conversacion_id: conversacionId,
    texto,
    csrf_token: csrfToken
  });

  fetch('../php/enviar_mensaje.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRF-Token': csrfToken
    },
    body
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'ok') {
        input.value = '';
        abrirConversacion(conversacionId, document.getElementById("nombreChat").textContent); // Recargar
      } else {
        alert(data.msg || 'Error al enviar mensaje');
      }
    });
}

// Cargar lista de conversaciones
async function cargarConversaciones() {
  const lista = document.getElementById("listaChats");
  lista.innerHTML = '';

  const res = await fetch("../php/ver_conversaciones.php");
  const data = await res.json();

  if (data.status !== "ok" || !data.conversaciones.length) {
    lista.innerHTML = "<li><strong>No hay conversaciones</strong></li>";
    return;
  }

  data.conversaciones.forEach(conv => {
    const li = document.createElement("li");
    li.dataset.id = conv.id;
    li.textContent = conv.nombre || "Chat sin nombre";
    li.addEventListener("click", () => abrirConversacion(conv.id, conv.nombre));
    lista.appendChild(li);
  });
}

// Abrir conversación y cargar mensajes
async function abrirConversacion(id, nombre) {
  const mensajesDiv = document.getElementById("contenedorMensajes");
  const titulo = document.getElementById("nombreChat");
  const participantes = document.getElementById("listaParticipantes");
  const propietario = document.getElementById("chatPropietario");

  titulo.textContent = nombre;
  mensajeForm.dataset.conversacionId = id;
  mensajesDiv.innerHTML = '';
  participantes.innerHTML = '';
  propietario.textContent = '—';

  const res = await fetch(`../php/ver_mensajes.php?conversacion_id=${id}`);
  const data = await res.json();

  if (data.status !== "ok") {
    mensajesDiv.innerHTML = "<p>Error al cargar mensajes</p>";
    return;
  }

  data.mensajes.forEach(m => {
    const msg = document.createElement("div");
    msg.className = `mensaje ${m.es_mio ? "yo" : "otro"}`;
    msg.innerHTML = `<div class="burbuja">${m.texto}</div>`;
    mensajesDiv.appendChild(msg);
  });

  if (data.participantes) {
    data.participantes.forEach(p => {
      const li = document.createElement("li");
      li.textContent = p.nombre + (p.es_mio ? " (Tú)" : "");
      participantes.appendChild(li);
    });
  }

  if (data.propietario) {
    propietario.textContent = data.propietario;
  }

  mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
}
