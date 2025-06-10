function toggleMenu() {
  const links = document.querySelector('.nav-links');
  links.classList.toggle('open');
}

function checkLoginStatus() {
  document.getElementById('userPanel').classList.remove('hidden');
  document.getElementById('userName').innerText = `Hola, Dev Tester 😎`; // <-- Aquí deberías usar el nombre real del usuario si ya lo tienes en session
}

function logout() {
  fetch('../php/logout.php')
    .then(() => window.location.href = "../index.html");
}

checkLoginStatus();

