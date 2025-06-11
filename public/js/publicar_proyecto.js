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

const tipoSelect = document.getElementById('tipoProyecto');

const grupoPrestamo = document.getElementById('grupoPrestamo');
const grupoPlazo = document.getElementById('grupoPlazo');
const grupoRetorno = document.getElementById('grupoRetorno');
const grupoAcciones = document.getElementById('grupoAcciones');

function actualizarFormularioPorTipo() {
  const tipo = tipoSelect.value;

  const esPrestamo = tipo === 'prestamo';

  grupoPrestamo.classList.toggle('hidden', !esPrestamo);
  grupoPlazo.classList.toggle('hidden', !esPrestamo);
  grupoRetorno.classList.toggle('hidden', !esPrestamo);
  grupoAcciones.classList.toggle('hidden', esPrestamo);
}

tipoSelect.addEventListener('change', actualizarFormularioPorTipo);
actualizarFormularioPorTipo(); // Ejecutar al cargar


// Envío del formulario
function submitProject(e) {
  e.preventDefault();
  const form = new FormData(e.target);
  form.append('csrf_token', csrfToken);

  fetch('../php/crear_proyecto.php', {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken },
    body: form
  })
  .then(res => res.json())
  .then(data => {
    alert(data.msg);
    if (data.status === 'ok') {
      window.location.href = "portafolio.html";
    }
  });
}
