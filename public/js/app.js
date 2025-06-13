const projects = [
  {
    id: 1,
    title: "Cafetería Artesanal Downtown",
    description: "Expansión de cafetería local con nuevos equipos y renovación del local para aumentar capacidad.",
    amountNeeded: 25000,
    amountRaised: 18500,
    returnRate: 12,
    timeEstimate: "18 meses",
    owner: "María González",
    status: "disponible",
    category: "Gastronomía"
  },
  {
    id: 2,
    title: "Tienda Online de Productos Eco",
    description: "Startup de productos ecológicos necesita capital para inventario inicial y marketing digital.",
    amountNeeded: 15000,
    amountRaised: 15000,
    returnRate: 15,
    timeEstimate: "12 meses",
    owner: "Carlos Ruiz",
    status: "completado",
    category: "E-commerce"
  },
  {
    id: 3,
    title: "Taller de Reparación de Bicicletas",
    description: "Negocio familiar busca financiamiento para herramientas especializadas y ampliación del taller.",
    amountNeeded: 8000,
    amountRaised: 3200,
    returnRate: 10,
    timeEstimate: "24 meses",
    owner: "Ana Martínez",
    status: "disponible",
    category: "Servicios"
  },
  {
    id: 4,
    title: "App de Delivery Local",
    description: "Aplicación móvil para conectar restaurantes locales con clientes, necesita desarrollo y marketing.",
    amountNeeded: 35000,
    amountRaised: 12000,
    returnRate: 18,
    timeEstimate: "15 meses",
    owner: "Tech Solutions SRL",
    status: "disponible",
    category: "Tecnología"
  },
  {
    id: 5,
    title: "Panadería Artesanal",
    description: "Panadería tradicional busca modernizar equipos y abrir segunda sucursal en zona comercial.",
    amountNeeded: 20000,
    amountRaised: 20000,
    returnRate: 11,
    timeEstimate: "20 meses",
    owner: "Familia Rodríguez",
    status: "completado",
    category: "Gastronomía"
  },
  {
    id: 6,
    title: "Centro de Yoga y Bienestar",
    description: "Estudio de yoga necesita equipamiento y acondicionamiento para ofrecer más clases y servicios.",
    amountNeeded: 12000,
    amountRaised: 7800,
    returnRate: 13,
    timeEstimate: "16 meses",
    owner: "Lucía Fernández",
    status: "disponible",
    category: "Bienestar"
  }
];

function toggleMenu() {
  const links = document.querySelector('.nav-links');
  links.classList.toggle('open');
}

function renderProjects() {
  const grid = document.getElementById('project-grid');
  if (!grid) return;

  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';

    // Header con categoría y estado
    const header = document.createElement('div');
    header.className = 'header';

    const category = document.createElement('div');
    category.className = 'category';
    category.textContent = p.category;

    const status = document.createElement('div');
    status.className = 'status';
    status.textContent = p.status === 'disponible' ? 'Disponible' : 'Completado';
    if (p.status === 'completado') {
      status.style.background = '#dbeafe';
      status.style.color = '#1e40af';
      status.style.borderColor = '#bfdbfe';
    }

    header.appendChild(category);
    header.appendChild(status);

    // Título
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = p.title;

    // Descripción
    const desc = document.createElement('div');
    desc.className = 'description';
    desc.textContent = p.description;

    // Progreso
    const progressSection = document.createElement('div');
    progressSection.className = 'progress-section';

    const progressLabel = document.createElement('div');
    progressLabel.className = 'progress-label';
    progressLabel.innerHTML = `
      <span>Progreso</span>
      <span>$${p.amountRaised.toLocaleString()} / $${p.amountNeeded.toLocaleString()}</span>
    `;

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';

    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = Math.min((p.amountRaised / p.amountNeeded) * 100, 100) + '%';

    progressBar.appendChild(progressFill);
    progressSection.appendChild(progressLabel);
    progressSection.appendChild(progressBar);

    // Detalles (Retorno y Plazo)
    const details = document.createElement('div');
    details.className = 'details';

    const retorno = document.createElement('div');
    retorno.className = 'detail-item';
    retorno.innerHTML = `
      <div class="icon green-text">↑</div>
      <div class="detail-content">
        <div class="detail-label">Retorno</div>
        <div class="detail-value green-text">${p.returnRate}%</div>
      </div>
    `;

    const plazo = document.createElement('div');
    plazo.className = 'detail-item';
    plazo.innerHTML = `
      <div class="icon blue-text">⏱</div>
      <div class="detail-content">
        <div class="detail-label">Plazo</div>
        <div class="detail-value">${p.timeEstimate}</div>
      </div>
    `;

    details.appendChild(retorno);
    details.appendChild(plazo);

    // Dueño
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

    // Botones
    const buttons = document.createElement('div');
    buttons.className = 'buttons';

    const btnDetails = document.createElement('button');
    btnDetails.className = 'btn btn-outline';
    btnDetails.textContent = '👁 Ver Detalles';

    const btnInvest = document.createElement('button');
    btnInvest.className = 'btn btn-primary';
    btnInvest.textContent = '$ Invertir';

    buttons.appendChild(btnDetails);
    if (p.status === 'disponible') buttons.appendChild(btnInvest);

    // Montaje final
    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(progressSection);
    card.appendChild(details);
    card.appendChild(owner);
    card.appendChild(buttons);

    grid.appendChild(card);

    btnDetails.onclick = () => {
      openModal('dashboard/oportunidades.html');
    };

    btnInvest.onclick = () => {
      openModal('dashboard/oportunidades.html');
    };

  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProjects();
});

let usuarioLogueado = false;

fetch('php/verificar_sesion.php')
  .then(res => res.json())
  .then(data => {
    usuarioLogueado = data.logged_in;
  });


function openModal(destino = null) {
  if (usuarioLogueado) {
    if (destino) window.location.href = destino;
    return;
  }

  document.getElementById('authModal').classList.remove('hidden');

  // Guarda destino para redirigir después del login
  if (destino) {
    sessionStorage.setItem('postLoginRedirect', destino);
  }
}

function closeModal() {
  document.getElementById('authModal').classList.add('hidden');
}

function switchToRegister() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
}

function switchToLogin() {
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

function handleRegister(e) {
  e.preventDefault();
  const form = e.target;
  const nombre = form.querySelector('input[type="text"]').value;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;

  fetch('php/register.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRF-Token': csrfToken },
    body: new URLSearchParams({ nombre, email, telefono: '000000000', password })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.msg);
      if (data.status === 'ok') {
        switchToLogin();
      }
    });
}


function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;

  fetch('php/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRF-Token': csrfToken },
    body: new URLSearchParams({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.msg);
      if (data.status === 'ok') {
        closeModal();

        const destino = sessionStorage.getItem('postLoginRedirect');
        if (destino) {
          sessionStorage.removeItem('postLoginRedirect');
          window.location.href = destino;
        } else {
          window.location.href = 'dashboard/oportunidades.html';
        }
      }
    });
}


function checkAuthAndRedirect(url) {
  fetch('php/verificar_sesion.php')
    .then(res => res.json())
    .then(data => {
      if (data.logged_in) {
        window.location.href = url;
      } else {
        openModal(); // Muestra el modal si NO está logeado
      }
    })
    .catch(err => {
      console.error("Error verificando sesión:", err);
      openModal(); // Por si acaso, muestra el modal si algo falla
    });
}

// Redirige automáticamente si ya estás logueado y entras en index.html
fetch('php/verificar_sesion.php')
  .then(res => res.json())
  .then(data => {
    if (data.logged_in) {
      sessionStorage.setItem('usuarioLogueado', '1');
      const esIndex = window.location.pathname.endsWith('/index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/vendraly/');
      if (esIndex) {
        window.location.href = 'dashboard/oportunidades.html';
      }
    }
  });
