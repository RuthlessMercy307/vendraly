checkLoginStatus();
cargarConversaciones();

let conversacionAbiertaId = null;

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

        const mensajesDiv = document.getElementById("contenedorMensajes");

        const msg = document.createElement("div");
        msg.className = "mensaje yo";
        msg.innerHTML = `<div class="burbuja">${texto}</div>`;
        mensajesDiv.appendChild(msg);

        mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
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

  // Obtener tu propio nombre y rol
  const session = await fetchUserSession();
  const miId = session.id;
  const miRol = session.rol;

  data.conversaciones.forEach(conv => {
    let nombreFinal = conv.nombre;

    if (conv.tipo === 'privado') {
      const otro = conv.participantes.find(p => p.id != miId);

      if (!otro) {
        nombreFinal = "Usuario desconocido";
      } else if (['admin', 'soporte'].includes(otro.rol) && !['admin', 'soporte'].includes(miRol)) {
        nombreFinal = "Soporte Vendraly";
      } else {
        nombreFinal = otro.nombre;
      }
    }

    const li = document.createElement("li");
    li.dataset.id = conv.id;
    li.dataset.nombre = nombreFinal;
    li.textContent = nombreFinal;
    li.addEventListener("click", () => abrirConversacion(conv.id, nombreFinal));
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
  conversacionAbiertaId = id;
  mensajesDiv.innerHTML = '';
  participantes.innerHTML = '';
  propietario.textContent = '--';

  const res = await fetch(`../php/ver_mensajes.php?conversacion_id=${id}`);
  const data = await res.json();

  if (data.status !== "ok") {
    mensajesDiv.innerHTML = "<p>Error al cargar mensajes</p>";
    return;
  }

  const session = await fetchUserSession();
  renderizarMensajes(data, session.id);

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

  if (data.mensajes.length) {
    const ultimoMensaje = data.mensajes[data.mensajes.length - 1];

    fetch("../php/actualizar_ultima_lectura.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // No es necesario X-CSRF-Token si lo quitaste
      },
      body: new URLSearchParams({
        conversacion_id: id,
        mensaje_id: ultimoMensaje.id
      })
    });
  }
}

async function actualizarMensajes() {
  if (!conversacionAbiertaId) return;

  const res = await fetch(`../php/ver_mensajes.php?conversacion_id=${conversacionAbiertaId}`);
  const data = await res.json();

  if (data.status !== "ok") return;

  const session = await fetchUserSession();
  renderizarMensajes(data, session.id);
}


function renderizarMensajes(data, miId) {
  const mensajesDiv = document.getElementById("contenedorMensajes");
  mensajesDiv.innerHTML = '';

  const leido = data.leido_por_otro;
  const ultimoLeidoId = leido?.ultimo_mensaje_id;
  const fechaLeido = leido?.fecha ? new Date(leido.fecha) : null;

  data.mensajes.forEach(m => {
    const msg = document.createElement("div");
    msg.className = `mensaje ${m.es_mio ? "yo" : "otro"}`;
    msg.innerHTML = `
      <div class="burbuja">${m.texto}</div>
      <div class="visto-info" style="font-size: 12px; color: #777; margin-top: 3px; text-align: right;"></div>
    `;
    mensajesDiv.appendChild(msg);

    // Mostrar "Visto" si aplica
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

  if (diff < 60) return "Visto hace pocos segundos";
  if (diff < 3600) return `Visto hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Visto hace ${Math.floor(diff / 3600)} hrs`;

  return `Visto el ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString().slice(0, 5)}`;
}


setInterval(actualizarMensajes, 5000); // Cada 5 segundos
