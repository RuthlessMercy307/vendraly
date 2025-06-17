const proyectos = [
  {
    id: 1,
    title: "Cafetería Artesanal Downtown",
    description: "Expansión de cafetería local con nuevos equipos y renovación del local para aumentar capacidad.",
    amountNeeded: 25000,
    amountRaised: 18500,
    returnRate: 12,
    timeEstimate: "18",
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
    timeEstimate: "12",
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
    timeEstimate: "24",
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
    timeEstimate: "15",
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
    timeEstimate: "20",
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
    timeEstimate: "16",
    owner: "Lucía Fernández",
    status: "disponible",
    category: "Bienestar"
  }
];
// Verifica sesión activa
fetch('../php/verificar_sesion.php')
  .then(res => res.json())
  .then(data => {
    if (!data.logged_in) {
      window.location.href = "../index.html";
    }
  });

// Obtener el ID desde la URL
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));
const proyecto = proyectos.find(p => p.id === id);

// Si no existe el proyecto, redirige
if (!proyecto) {
  document.body.innerHTML = "<p style='text-align:center;margin-top:3rem;'>Proyecto no encontrado.</p>";
} else {
  // Rellenar datos
  document.getElementById("titulo-proyecto").textContent = proyecto.title;
  document.getElementById("categoria").textContent = proyecto.category;
  document.getElementById("tipo").textContent = proyecto.status === "completado" ? "completado" : "disponible";
  document.getElementById("retorno").textContent = proyecto.returnRate;
  document.getElementById("plazo").textContent = proyecto.timeEstimate;

  // Mostrar/ocultar campos externos según el método
  document.querySelectorAll('input[name="metodo"]').forEach(radio => {
    radio.addEventListener('change', e => {
      const externoForm = document.getElementById("externo-form");
      externoForm.classList.toggle("hidden", e.target.value !== "externo");
    });
  });

  // Acción del botón
  const boton = document.querySelector(".btn.btn-primary");
  boton.addEventListener("click", () => {
    const monto = parseFloat(document.getElementById("monto").value);
    if (!monto || monto <= 0) return alert("Ingresa un monto válido para invertir.");

    const metodo = document.querySelector('input[name="metodo"]:checked').value;

    alert(`💸 Inversión simulada de R$${monto.toLocaleString("pt-BR")} en "${proyecto.title}" enviada con éxito usando "${metodo}" (mock).`);
  });
}
