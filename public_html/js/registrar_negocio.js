function toggleMenu() {
  const links = document.querySelector('.nav-links');
  links.classList.toggle('open');
}

checkLoginStatus();

let modoEdicion = false;

async function cargarNegocioParaEditar() {
  const res = await fetch('/api/negocio_actual', {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('vendraly_token')
    }
  });

  const data = await res.json();

  if (data.status !== 'ok') {
    alert('No tienes permiso para registrar negocio. Redirigiendo...');
    return window.location.href = 'portafolio.html';
  }

  // Si hay negocio: edición
  if (data.negocio) {
    modoEdicion = true;
    const form = document.getElementById('formNegocio');
    form.nombre.value = data.negocio.nombre;
    form.descripcion.value = data.negocio.descripcion || '';
    form.tipo.value = data.negocio.tipo || 'otro';
  }
}

document.getElementById('formNegocio').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;

  const body = {
    nombre: form.nombre.value.trim(),
    descripcion: form.descripcion.value.trim(),
    tipo: form.tipo.value
  };

  const url = modoEdicion ? '/api/actualizar_negocio' : '/api/registrar_negocio';
  const method = modoEdicion ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('vendraly_token')
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (data.status === 'ok') {
    alert(modoEdicion ? "✅ Negocio actualizado con éxito" : "✅ Negocio registrado con éxito");
    window.location.href = "portafolio.html";
  } else {
    alert("❌ Error al guardar: " + (data.msg || ''));
  }
});

cargarNegocioParaEditar();
