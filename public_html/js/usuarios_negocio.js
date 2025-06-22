function toggleMenu() {
  const links = document.querySelector('.nav-links');
  if (links) links.classList.toggle('open');
}

checkLoginStatus();

// Validar parámetro negocio_id
const urlParams = new URLSearchParams(window.location.search);
const negocioId = urlParams.get('negocio_id');

if (!negocioId || isNaN(negocioId)) {
  alert("Falta o es inválido el ID del negocio");
  location.href = "portafolio.html";
}

function mostrarFormulario() {
  document.getElementById('formularioUsuario')?.classList.remove('hidden');
}

function ocultarFormulario() {
  document.getElementById('formularioUsuario')?.classList.add('hidden');
}

async function cargarUsuarios() {
  const contenedor = document.getElementById('listaUsuarios');
  if (!contenedor) return;

  contenedor.innerHTML = '<p>Cargando usuarios...</p>';

  try {
    const res = await fetch(`/api/usuarios_sgw?negocio_id=${negocioId}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('vendraly_token')
      }
    });

    const data = await res.json();
    if (data.status !== 'ok') throw new Error();

    if (!data.usuarios || data.usuarios.length === 0) {
      contenedor.innerHTML = '<p style="color:#888;">Este negocio aún no tiene usuarios registrados.</p>';
      return;
    }

    contenedor.innerHTML = '';
    data.usuarios.forEach(u => {
      const div = document.createElement('div');
      div.className = 'usuario-card';
      div.innerHTML = `
        <div><strong>${u.nombre}</strong> (${u.usuario})</div>
        <div>Rol: ${u.rol}</div>
        <button class="btn btn-outline" onclick="eliminarUsuario(${u.id})">Eliminar</button>
      `;
      contenedor.appendChild(div);
    });

  } catch (err) {
    console.error('[usuarios_sgw]', err);
    contenedor.innerHTML = '<p style="color:red;">Error al cargar usuarios.</p>';
  }
}

const formNuevo = document.getElementById('formNuevoUsuario');
if (formNuevo) {
  formNuevo.addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = {
      nombre: formNuevo.nombre.value.trim(),
      usuario: formNuevo.usuario.value.trim(),
      password: formNuevo.password.value.trim(),
      rol: formNuevo.rol.value,
      negocio_id: negocioId
    };

    try {
      const res = await fetch('/api/crear_usuario_sgw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('vendraly_token')
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.status === 'ok') {
        alert("✅ Usuario creado con éxito");
        formNuevo.reset();
        ocultarFormulario();
        cargarUsuarios();
      } else {
        alert("❌ Error: " + (data.msg || 'No se pudo crear el usuario'));
      }
    } catch (err) {
      alert("❌ Error inesperado");
      console.error('[crear_usuario_sgw]', err);
    }
  });
}

async function eliminarUsuario(id) {
  if (!confirm("¿Eliminar este usuario del negocio?")) return;

  try {
    const res = await fetch(`/api/eliminar_usuario_sgw?id=${id}&negocio_id=${negocioId}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('vendraly_token')
      }
    });

    const data = await res.json();
    if (data.status === 'ok') {
      alert("🗑️ Usuario eliminado");
      cargarUsuarios();
    } else {
      alert("❌ Error al eliminar: " + (data.msg || ''));
    }
  } catch (err) {
    alert("❌ Error inesperado al eliminar");
    console.error('[eliminar_usuario_sgw]', err);
  }
}

cargarUsuarios();
