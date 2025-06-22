function toggleMenu() {
  const links = document.querySelector('.nav-links');
  links.classList.toggle('open');
}

// Revisa sesión del usuario
async function fetchUserSession() {
  try {
    const res = await fetch('/api/verificar_sesion', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('vendraly_token')
      }
    });
    return await res.json();
  } catch (e) {
    return { logged_in: false };
  }
}

async function checkLoginStatus() {
  const data = await fetchUserSession();
  if (data.logged_in) {
    document.getElementById('userPanel')?.classList.remove('hidden');
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

  document.querySelector('input[name="monto"]').required = esPrestamo;
  document.querySelector('input[name="plazo"]').required = esPrestamo;
  document.querySelector('input[name="retorno"]').required = esPrestamo;
  document.querySelector('input[name="porcentaje_disponible"]').required = !esPrestamo;
  document.querySelector('input[name="precio_porcentaje"]').required = !esPrestamo;
}

tipoSelect.addEventListener('change', actualizarFormularioPorTipo);
actualizarFormularioPorTipo();

function mostrarToast(msg, tipo = 'ok') {
  const toast = document.createElement('div');
  toast.className = 'toast ' + tipo;
  toast.innerText = msg;
  Object.assign(toast.style, {
    background: tipo === 'error' ? '#e74c3c' : '#2ecc71',
    color: 'white',
    padding: '10px 15px',
    marginTop: '10px',
    borderRadius: '5px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    transition: 'opacity 0.3s ease'
  });
  const container = document.getElementById('toastContainer') || document.body;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

let enviandoProyecto = false;

function submitProject(e) {
  e.preventDefault();
  if (enviandoProyecto) return;

  const form = e.target;
  const tipo = form.tipo.value;

  const data = {
    titulo: form.titulo.value.trim(),
    tipo,
    descripcion_corta: form.descripcion_corta.value.trim(),
    descripcion_larga: form.descripcion_larga.value.trim(),
    categoria: form.categoria.value
  };

  // Validación de campos base
  if (!data.titulo || !data.descripcion_corta || !data.descripcion_larga) {
    mostrarToast("Completa todos los campos obligatorios", "error");
    return;
  }

  // Extra según tipo
  if (tipo === 'prestamo') {
    data.monto = parseFloat(form.monto.value);
    data.plazo = parseInt(form.plazo.value);
    data.retorno = parseFloat(form.retorno.value);

    if (isNaN(data.monto) || isNaN(data.plazo) || isNaN(data.retorno)) {
      mostrarToast("Completa los valores numéricos válidos para préstamo", "error");
      return;
    }
  } else {
    data.porcentaje_disponible = parseFloat(form.porcentaje_disponible.value);
    data.precio_porcentaje = parseFloat(form.precio_porcentaje.value);

    if (isNaN(data.porcentaje_disponible) || isNaN(data.precio_porcentaje)) {
      mostrarToast("Completa los valores numéricos válidos para acciones", "error");
      return;
    }
  }

  enviandoProyecto = true;
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  fetch('/api/crear_proyecto', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('vendraly_token')
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(resp => {
      enviandoProyecto = false;
      if (submitBtn) submitBtn.disabled = false;

      if (resp.status === 'ok') {
        mostrarToast("✅ Proyecto creado correctamente", "ok");
        setTimeout(() => window.location.href = "portafolio.html", 1000);
      } else {
        mostrarToast("❌ " + (resp.msg || "Error al crear proyecto"), "error");
      }
    })
    .catch(() => {
      enviandoProyecto = false;
      if (submitBtn) submitBtn.disabled = false;
      mostrarToast("❌ Error de conexión al crear proyecto", "error");
    });
}
