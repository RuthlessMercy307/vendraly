async function renderProjects() {
  const grid = document.getElementById('project-grid');
  if (!grid) return;

  const res = await fetch('../php/ver_proyectos_activos.php');
  const data = await res.json();

  if (data.status !== 'ok') {
    grid.innerHTML = '<p>No se pudieron cargar los proyectos.</p>';
    return;
  }

  const projects = data.proyectos;

  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'header';

    const category = document.createElement('div');
    category.className = 'category';
    category.textContent = p.categoria;

    const status = document.createElement('div');
    status.className = 'status';
    status.textContent = 'Disponible';

    header.appendChild(category);
    header.appendChild(status);

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = p.titulo;

    const desc = document.createElement('div');
    desc.className = 'description';
    desc.textContent = p.descripcion_corta;

    const progressSection = document.createElement('div');
    progressSection.className = 'progress-section';

   const progressLabel = document.createElement('div');
progressLabel.className = 'progress-label';

let progreso = 0;
let progresoTexto = '';

if (p.tipo === 'prestamo') {
  const acumulado = parseFloat(p.acumulado ?? 0);
  const necesario = parseFloat(p.necesario ?? 1);
  progreso = Math.min((acumulado / necesario) * 100, 100);
  progresoTexto = `R$${acumulado.toLocaleString()} / R$${necesario.toLocaleString()}`;
} else if (p.tipo === 'acciones') {
  const porcentajeTotal = parseFloat(p.porcentaje_disponible ?? 0);
  const porcentajeVendido = parseFloat(p.porcentaje_vendido ?? 0);
  progreso = Math.min((porcentajeVendido / (porcentajeTotal || 1)) * 100, 100);
  progresoTexto = `${porcentajeVendido.toFixed(2)}% / ${porcentajeTotal.toFixed(2)}%`;
}

progressLabel.innerHTML = `
  <span>Progreso</span>
  <span>${progresoTexto}</span>
`;


    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';

    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = progreso + '%';

    progressBar.appendChild(progressFill);
    progressSection.appendChild(progressLabel);
    progressSection.appendChild(progressBar);

    const details = document.createElement('div');
    details.className = 'details';

    if (p.tipo === 'prestamo') {
      const retorno = document.createElement('div');
      retorno.className = 'detail-item';
      retorno.innerHTML = `
        <div class="icon green-text">↑</div>
        <div class="detail-content">
          <div class="detail-label">Retorno</div>
          <div class="detail-value green-text">${p.retorno ?? '-'}%</div>
        </div>
      `;

      const plazo = document.createElement('div');
      plazo.className = 'detail-item';
      plazo.innerHTML = `
        <div class="icon blue-text">⏱</div>
        <div class="detail-content">
          <div class="detail-label">Plazo</div>
          <div class="detail-value">${p.plazo ?? '-'} meses</div>
        </div>
      `;

      details.appendChild(retorno);
      details.appendChild(plazo);
    } else if (p.tipo === 'acciones') {
      const porcentaje = document.createElement('div');
      porcentaje.className = 'detail-item';
      porcentaje.innerHTML = `
        <div class="icon yellow-text">📊</div>
        <div class="detail-content">
          <div class="detail-label">Disponible</div>
          <div class="detail-value">${p.porcentaje_disponible ?? 0}%</div>
        </div>
      `;

      const precio = document.createElement('div');
      precio.className = 'detail-item';
      precio.innerHTML = `
        <div class="icon purple-text">💰</div>
        <div class="detail-content">
          <div class="detail-label">Precio (0.01%)</div>
          <div class="detail-value">R$${parseFloat(p.precio_porcentaje ?? 0).toLocaleString()}</div>
        </div>
      `;

      details.appendChild(porcentaje);
      details.appendChild(precio);
    }

    const owner = document.createElement('div');
    owner.className = 'owner';
    const ownerIcon = document.createElement('span');
    ownerIcon.textContent = '👤';
    const ownerLabel = document.createElement('span');
    ownerLabel.textContent = 'Por:';
    const ownerName = document.createElement('span');
    ownerName.className = 'owner-name';
    ownerName.textContent = p.owner;
    owner.appendChild(ownerIcon);
    owner.appendChild(ownerLabel);
    owner.appendChild(ownerName);

    const buttons = document.createElement('div');
    buttons.className = 'buttons';

    const btnDetails = document.createElement('button');
    btnDetails.className = 'btn btn-outline';
    btnDetails.textContent = '👁 Ver Detalles';
    btnDetails.onclick = () => {
      window.location.href = `verproyecto.html?id=${p.id}`;
    };

    const btnInvest = document.createElement('button');
    btnInvest.className = 'btn btn-primary';
    btnInvest.textContent = '$ Invertir';
    btnInvest.onclick = () => {
      window.location.href = `invertir.html?id=${p.id}`;
    };

    buttons.appendChild(btnInvest);
    buttons.appendChild(btnDetails);

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(progressSection);
    card.appendChild(details);
    card.appendChild(owner);
    card.appendChild(buttons);

    grid.appendChild(card);
  });
}


function logout() {
  fetch('../php/logout.php')
    .then(() => window.location.href = "../index.html");
}

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

document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  renderProjects();
});

