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

    const header = document.createElement('div');
    header.className = 'card-header';

    const category = document.createElement('span');
    category.className = 'badge';
    category.textContent = p.category;

    const status = document.createElement('span');
    status.className = 'badge ' + (p.status === 'disponible' ? 'available' : 'complete');
    status.textContent = p.status === 'disponible' ? 'Disponible' : 'Completado';

    header.appendChild(category);
    header.appendChild(status);

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = p.title;

    const desc = document.createElement('div');
    desc.className = 'card-desc';
    desc.textContent = p.description;

    const progress = document.createElement('div');
    progress.className = 'progress';
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    bar.style.width = Math.min((p.amountRaised / p.amountNeeded) * 100, 100) + '%';
    progress.appendChild(bar);

    const info = document.createElement('div');
    info.className = 'card-info';
    info.innerHTML = `<span>$${p.amountRaised.toLocaleString()} / $${p.amountNeeded.toLocaleString()}</span>` +
      `<span>${p.returnRate}% &bull; ${p.timeEstimate}</span>`;

    const owner = document.createElement('div');
    owner.className = 'card-desc';
    owner.textContent = 'Por: ' + p.owner;

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const details = document.createElement('button');
    details.className = 'btn btn-outline';
    details.textContent = 'Ver Detalles';

    const invest = document.createElement('button');
    invest.className = 'btn btn-primary';
    invest.textContent = 'Invertir';

    footer.appendChild(details);
    if (p.status === 'disponible') footer.appendChild(invest);

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(progress);
    card.appendChild(info);
    card.appendChild(owner);
    card.appendChild(footer);

    grid.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderProjects);
