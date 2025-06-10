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

// Aquí deberías cargar los datos reales del portafolio
// Simulación por ahora:
document.getElementById('stakeTotal').innerText = "0.00";
document.getElementById('inversionTotal').innerText = "0.00";
document.getElementById('prestadoTotal').innerText = "0.00";

// Aquí se cargarían los proyectos publicados e inversiones reales desde la base de datos
document.getElementById('misProyectos').innerHTML = `<p style="color:#94a3b8;">Aún no tienes proyectos publicados.</p>`;
document.getElementById('misInversiones').innerHTML = `<p style="color:#94a3b8;">Aún no has realizado inversiones.</p>`;
