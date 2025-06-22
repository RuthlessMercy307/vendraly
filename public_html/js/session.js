// js/session.js

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

async function checkLoginStatus(redirect = true) {
  const data = await fetchUserSession();

  if (!data.logged_in || !data.verificado) {
    localStorage.removeItem('vendraly_token');

    if (redirect) {
      mostrarToast?.("Sesión vencida. Inicia sesión de nuevo", "error");
      setTimeout(() => window.location.href = '/', 2000);
    }

    return false;
  }

  const userPanel = document.getElementById('userPanel');
  if (userPanel) userPanel.classList.remove('hidden');

  const userName = document.getElementById('userName');
  if (userName) userName.innerText = `Hola, ${data.nombre}`;

  return true;
}

// Ejecutar al cargar la página
checkLoginStatus();

// Exponer función globalmente
window.fetchUserSession = fetchUserSession;
window.checkLoginStatus = checkLoginStatus;
