let csrfToken = '';

async function loadCsrfToken() {
  const prefix = location.pathname.includes('/dashboard/') ? '../' : '';
  const res = await fetch(`${prefix}php/csrf_token.php`);
  const data = await res.json();
  csrfToken = data.token;
  document.querySelectorAll('form').forEach(f => {
    let hidden = f.querySelector('input[name="csrf_token"]');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'csrf_token';
      f.appendChild(hidden);
    }
    hidden.value = csrfToken;
  });
}

document.addEventListener('DOMContentLoaded', loadCsrfToken);
