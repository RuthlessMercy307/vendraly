const projects = [
  {
    id: 1,
    title: "Cafetería Artesanal Downtown",
    description: "Expansión de cafetería local con nuevos equipos y renovación del local para aumentar capacidad.",
    amountNeeded: 25000,
    amountRaised: 18500,
    returnRate: 12,
    timeEstimate: "50 meses",
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

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = p.title;

    const desc = document.createElement('div');
    desc.className = 'description';
    desc.textContent = p.description;

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

    const owner = document.createElement('div');
    owner.className = 'owner';
    owner.innerHTML = `
      <span>👤</span>
      <span>Por:</span>
      <span class="owner-name">${p.owner}</span>
    `;

    const buttons = document.createElement('div');
    buttons.className = 'buttons';

    const btnDetails = document.createElement('button');
    btnDetails.className = 'btn btn-outline';
    btnDetails.textContent = '👁 Ver Detalles';
    btnDetails.onclick = () => {
      window.location.href = `verproyecto.html?id=${p.id}`;
    };

    if (p.status === 'disponible') {
      const btnInvest = document.createElement('button');
      btnInvest.className = 'btn btn-primary';
      btnInvest.textContent = '$ Invertir';
      btnInvest.onclick = () => {
        window.location.href = `invertir.html?id=${p.id}`;
      };
      buttons.appendChild(btnInvest);
    }

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

document.addEventListener('DOMContentLoaded', renderProjects);
