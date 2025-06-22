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
  localStorage.removeItem('vendraly_token');
  window.location.href = "../index.html";
}

checkLoginStatus();

function formatoEstado(estado) {
  return estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

//
// 🟦 Cargar Plan Activo y Negocios
//
async function cargarPlanesYNegocios() {
  const contenedor = document.getElementById('seccionPlanes');
  contenedor.innerHTML = '';

  try {
    const res = await fetch('/api/portafolio_datos', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('vendraly_token')
      }
    });
    const data = await res.json();
    if (data.status !== 'ok') throw new Error();

    if (!data.plan_activo) {
      contenedor.innerHTML = `
        <h2>Elige tu Plan</h2>
        <p>No tienes un plan activo. Selecciona uno para comenzar.</p>
        <div class="planes-grid">
          ${data.planes.map(plan => `
            <div class="card">
              <h3>${plan.nombre}</h3>
              <p>${plan.descripcion}</p>
              <p><strong>Negocios permitidos:</strong> ${plan.limite_negocios}</p>
              <p><strong>Usuarios por negocio:</strong> ${plan.limite_usuarios ?? '—'}</p>
              <p><strong>Precio mensual:</strong> R$${parseFloat(plan.precio_mensual).toFixed(2)}</p>
              <button class="btn btn-primary" onclick="elegirPlan(${plan.id})">Elegir Plan</button>
            </div>
          `).join('')}
        </div>
      `;
      return;
    }

    let html = `
      <h2>Tu Plan Actual: ${data.plan_activo.nombre}</h2>
      <p>Negocios registrados: ${data.negocios.length} / ${data.plan_activo.limite_negocios}</p>
    `;

    const puedeRegistrar = data.negocios.length < data.plan_activo.limite_negocios;

    if (puedeRegistrar) {
      html += `
        <button class="btn btn-success" onclick="window.location.href='registrar_negocio.html'">
          + Registrar Nuevo Negocio
        </button>
      `;
    } else if (data.negocios.length === 0) {
      html += `
        <p>No has registrado aún tu primer negocio.</p>
        <button class="btn btn-success" onclick="window.location.href='registrar_negocio.html'">
          + Registrar Negocio
        </button>
      `;
    } else {
      html += `<p style="color:#888;margin-top:10px;">Has alcanzado el límite de negocios. Puedes actualizar tu plan.</p>`;
    }

    if (data.negocios.length > 0) {
      html += `<div class="project-grid" style="margin-top: 2rem;">`;
      data.negocios.forEach(n => {
        html += `
          <div class="card">
            <div class="header">
              <div class="category">${n.tipo}</div>
              <div class="status">${formatoEstado(n.estado)}</div>
            </div>
            <div class="title">${n.nombre}</div>
            <div class="description">${n.descripcion || 'Sin descripción.'}</div>
            <div class="card-actions" style="margin-top: 1rem;">
            <button class="btn btn-outline" onclick="window.location.href='editar_negocio.html?negocio_id=${n.id}'">Editar</button>
            <button class="btn btn-outline" onclick="window.location.href='usuarios_negocio.html?negocio_id=${n.id}'">👥 Subcuentas</button>
            <button class="btn btn-primary" onclick="window.location.href='/sgw/login.html'">Entrar al SGW</button>
           </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    contenedor.innerHTML = html;

  } catch (err) {
    contenedor.innerHTML = '<p>Error al cargar datos de plan y negocios.</p>';
  }
}

async function elegirPlan(planId) {
  const res = await fetch('/api/elegir_plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('vendraly_token')
    },
    body: JSON.stringify({ plan_id: planId })
  });

  const data = await res.json();
  if (data.status === 'ok') {
    location.reload();
  } else {
    alert("Error al activar el plan: " + (data.msg || ''));
  }
}

//
// 🟧 Proyectos Propios
//
async function cargarMisProyectos() {
  const contenedor = document.getElementById('misProyectos');
  contenedor.innerHTML = '';

  const res = await fetch('/api/ver_mis_proyectos', {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('vendraly_token')
    }
  });

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
      details.innerHTML = `
        <div class="detail-item"><strong>Retorno:</strong> ${p.retorno}%</div>
        <div class="detail-item"><strong>Plazo:</strong> ${p.plazo} meses</div>
      `;
    } else {
      details.innerHTML = `
        <div class="detail-item"><strong>Disponible:</strong> ${p.porcentaje_disponible}%</div>
        <div class="detail-item"><strong>Precio (0.01%):</strong> R$${parseFloat(p.precio_porcentaje).toLocaleString()}</div>
      `;
    }

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(details);

    contenedor.appendChild(card);
  });
}

//
// 🟨 Inversiones (placeholder)
//
function cargarInversiones() {
  document.getElementById('misInversiones').innerHTML = `<p style="color:#94a3b8;">Aún no has realizado inversiones.</p>`;
}

//
// 🚀 Cargar todo
//
cargarPlanesYNegocios();
cargarMisProyectos();
cargarInversiones();
