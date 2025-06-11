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

checkLoginStatus();

const mensajeForm = document.getElementById('mensajeForm');
if (mensajeForm) {
  mensajeForm.addEventListener('submit', enviarMensaje);
}

function enviarMensaje(e) {
  e.preventDefault();
  const texto = mensajeForm.querySelector('input[type="text"]').value.trim();
  if (!texto) return;
  const conversacion = mensajeForm.dataset.conversacionId;
  const body = new URLSearchParams({ conversacion_id: conversacion, texto, csrf_token: csrfToken });
  fetch('../php/enviar_mensaje.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRF-Token': csrfToken },
    body
  }).then(res => res.json())
    .then(data => {
      if (data.status === 'ok') {
        mensajeForm.reset();
      } else {
        alert(data.msg || 'Error');
      }
    });
}

