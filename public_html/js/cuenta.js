function toggleMenu() {
  const links = document.querySelector('.nav-links');
  links.classList.toggle('open');
}

async function checkLoginStatus() {
  const data = await fetchUserSession();
  if (data.logged_in) {
    document.getElementById('userPanel').classList.remove('hidden');
    document.getElementById('userName').innerText = `Hola, ${data.nombre}`;
    cargarPerfil();
  } else {
    window.location.href = "../index.html";
  }
}

function logout() {
  fetch('../php/logout.php')
    .then(() => window.location.href = "../index.html");
}

checkLoginStatus();

async function cargarPerfil() {
  try {
    const res = await fetch('../php/perfil.php');
    const data = await res.json();

    if (data.status !== 'ok') {
      alert('No se pudo cargar el perfil.');
      return;
    }

    const p = data.perfil;

    document.getElementById('nombreUsuario').innerText = p.nombre || '—';
    document.getElementById('emailUsuario').innerText = p.email || '—';
    document.getElementById('telefonoUsuario').innerText = p.telefono || '—';
    document.getElementById('direccionUsuario').innerText = p.direccion || '—';
    document.getElementById('estadoUsuario').innerText = p.estado || '—';
    document.getElementById('saldoUsuario').innerText = parseFloat(p.saldo || 0).toFixed(2);
    document.getElementById('docNumero').innerText = p.documento_numero || '—';

    // Estados de los documentos (en este caso solo mostramos si existe archivo o no)
    document.getElementById('docEstado').innerText = p.foto_documento ? 'Enviado' : 'Pendiente';
    document.getElementById('selfieEstado').innerText = p.foto_selfie ? 'Enviado' : 'Pendiente';
    document.getElementById('ladoEstado').innerText = p.foto_de_lado ? 'Enviado' : 'Pendiente';

  } catch (error) {
    console.error("Error cargando perfil:", error);
  }
}
