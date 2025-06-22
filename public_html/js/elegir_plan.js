function abrirModalPlanes(planesDisponibles) {
  const modal = document.getElementById('modalPlanes');
  modal.classList.remove('hidden');

  modal.innerHTML = `
    <div class="modal-overlay" onclick="cerrarModalPlanes()"></div>
    <div class="modal-content">
      <h2>Elige un Plan</h2>
      <p>Selecciona el plan que más se adapte a tus necesidades.</p>
      <div class="planes-grid">
        ${planesDisponibles.map(plan => `
          <div class="plan-card">
            <h3>${plan.nombre}</h3>
            <p>${plan.descripcion}</p>
            <p><strong>Negocios:</strong> ${plan.limite_negocios === 9999 ? 'Ilimitado' : plan.limite_negocios}</p>
            <p><strong>Precio:</strong> ${plan.precio_mensual === 0 ? 'Gratis' : `R$ ${plan.precio_mensual.toFixed(2)}/mes`}</p>
            <button onclick="seleccionarPlan(${plan.id})" class="btn">Elegir este plan</button>
          </div>
        `).join('')}
      </div>
      <button onclick="cerrarModalPlanes()" class="btn-outline cerrar-modal">Cancelar</button>
    </div>
  `;
}

function cerrarModalPlanes() {
  const modal = document.getElementById('modalPlanes');
  modal.classList.add('hidden');
  modal.innerHTML = '';
}

function seleccionarPlan(plan_id) {
  fetch('/api/activar_plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('vendraly_token')
    },
    body: JSON.stringify({ plan_id })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'ok') {
        cerrarModalPlanes();
        mostrarToast("✅ Plan activado correctamente");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        mostrarToast("❌ " + (data.msg || "Error al activar plan"), 'error');
      }
    })
    .catch(() => {
      mostrarToast("❌ Error de conexión al activar plan", 'error');
    });
}
