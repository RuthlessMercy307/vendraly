const proyectosMock = [
  {
    id: 1,
    titulo: "Cafetería Artesanal Downtown",
    descripcion_corta: "Expansión con nuevos equipos y renovación del local.",
    descripcion_larga: "Estamos ampliando nuestra cafetería con mejor mobiliario, horno industrial y un espacio para eventos...",
    tipo: "prestamo",
    categoria: "Gastronomía",
    nombre_usuario: "María González",
    fecha_publicacion: "2024-06-10",
    acumulado: 18500,
    necesario: 25000,
    plazo: 18,
    retorno: 12.5,
    porcentaje_vendido: null,
    porcentaje_disponible: null,
    precio_porcentaje: null,
    estado: "activo"
  }
];

// ID desde URL
const urlParams = new URLSearchParams(window.location.search);
const id = parseInt(urlParams.get("id"));
const proyecto = proyectosMock.find(p => p.id === id);

// Mostrar proyecto
if (proyecto) {
  document.getElementById("titulo-proyecto").textContent = proyecto.titulo;
  document.getElementById("estado-proyecto").textContent = proyecto.estado;
  document.getElementById("descripcion-corta").textContent = proyecto.descripcion_corta;
  document.getElementById("descripcion-larga").textContent = proyecto.descripcion_larga;
  document.getElementById("tipo-proyecto").textContent = proyecto.tipo;
  document.getElementById("categoria").textContent = proyecto.categoria;
  document.getElementById("nombre-usuario").textContent = proyecto.nombre_usuario;
  document.getElementById("nombre-usuario").href = `perfil.html?usuario=${encodeURIComponent(proyecto.nombre_usuario)}`;
  document.getElementById("fecha-publicacion").textContent = proyecto.fecha_publicacion;

  if (proyecto.tipo === 'prestamo') {
    document.getElementById("necesario").textContent = proyecto.necesario.toLocaleString("pt-BR");
    document.getElementById("acumulado").textContent = proyecto.acumulado.toLocaleString("pt-BR");
    document.getElementById("plazo").textContent = proyecto.plazo;
    document.getElementById("retorno").textContent = proyecto.retorno;
  } else {
    document.getElementById("detalle-prestamo").style.display = "none";
    document.getElementById("detalle-acciones").style.display = "block";
    document.getElementById("porcentaje-vendido").textContent = proyecto.porcentaje_vendido;
    document.getElementById("porcentaje-disponible").textContent = proyecto.porcentaje_disponible;
    document.getElementById("precio-porcentaje").textContent = proyecto.precio_porcentaje;
  }

  // Movimientos simulados
  const historial = document.getElementById("movimientos-publicos");
  historial.innerHTML = `
    <li>***asd invirtió R$500</li>
    <li>***btx recibió retorno de R$150</li>
  `;

  // Botón de inversión
  const invertirBtn = document.getElementById("btn-invertir");
  if (invertirBtn) {
    invertirBtn.onclick = () => {
      window.location.href = `invertir.html?id=${proyecto.id}`;
    };
  }
} else {
  document.getElementById("proyecto-detalles").innerHTML = "<p>Proyecto no encontrado</p>";
}

// Verificación de sesión
fetch('../php/verificar_sesion.php')
  .then(res => res.json())
  .then(data => {
    if (!data.logged_in) {
      window.location.href = '../index.html';
    }
  });

// Chat aún no implementado
function abrirChatGrupo() {
  alert("Chat del grupo aún no implementado");
}
function abrirChatPrivado() {
  alert("Mensaje directo al creador aún no disponible");
}
