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

// Formatear estado con espacios y mayúsculas
function formatoEstado(estado) {
  return estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Reemplaza este por proyectos reales
async function cargarMisProyectos() {
  const contenedor = document.getElementById('misProyectos');
  contenedor.innerHTML = '';

  const res = await fetch('../php/ver_mis_proyectos.php');
  const data = await res.json();

  if (data.status !== 'ok' || !data.proyectos.length) {
    contenedor.innerHTML = '<p style="color:#94a3b8;">Aún no tienes proyectos publicados.</p>';
    return;
  }

  data.proyectos.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'header';

    const category = document.createElement('div');
    category.className = 'category';
    category.textContent = p.categoria;

    const estado = document.createElement('div');
    estado.className = 'status';
    estado.textContent = formatoEstado(p.estado);

    header.appendChild(category);
    header.appendChild(estado);

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = p.titulo;

    const desc = document.createElement('div');
    desc.className = 'description';
    desc.textContent = p.descripcion_corta;

    const details = document.createElement('div');
    details.className = 'details';

    if (p.tipo === 'prestamo') {
      const retorno = document.createElement('div');
      retorno.className = 'detail-item';
      retorno.innerHTML = `
        <div class="icon green-text">↑</div>
        <div class="detail-content">
          <div class="detail-label">Retorno</div>
          <div class="detail-value green-text">${p.retorno}%</div>
        </div>
      `;

      const plazo = document.createElement('div');
      plazo.className = 'detail-item';
      plazo.innerHTML = `
        <div class="icon blue-text">⏱</div>
        <div class="detail-content">
          <div class="detail-label">Plazo</div>
          <div class="detail-value">${p.plazo} meses</div>
        </div>
      `;

      details.appendChild(retorno);
      details.appendChild(plazo);
    } else {
      const disponible = document.createElement('div');
      disponible.className = 'detail-item';
      disponible.innerHTML = `
        <div class="icon">📊</div>
        <div class="detail-content">
          <div class="detail-label">Disponible</div>
          <div class="detail-value">${p.porcentaje_disponible}%</div>
        </div>
      `;

      const precio = document.createElement('div');
      precio.className = 'detail-item';
      precio.innerHTML = `
        <div class="icon">💰</div>
        <div class="detail-content">
          <div class="detail-label">Precio (0.01%)</div>
          <div class="detail-value">R$${parseFloat(p.precio_porcentaje).toLocaleString()}</div>
        </div>
      `;

      details.appendChild(disponible);
      details.appendChild(precio);
    }

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(details);

    contenedor.appendChild(card);
  });
}

// Simulación para resumen (puedes luego conectar con datos reales)
document.getElementById('stakeTotal').innerText = "0.00";
document.getElementById('inversionTotal').innerText = "0.00";
document.getElementById('prestadoTotal').innerText = "0.00";

// Cargar proyectos al iniciar
cargarMisProyectos();

// Inversiones simuladas por ahora
document.getElementById('misInversiones').innerHTML = `<p style="color:#94a3b8;">Aún no has realizado inversiones.</p>`;
