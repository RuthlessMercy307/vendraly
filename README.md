# Vendraly

Este repositorio contiene un prototipo de plataforma de microinversiones colaborativas que conecta inversores con emprendedores locales.

## Frontend

- `index.html` – Página principal con los proyectos disponibles.
- `css/style.css` – Estilos modernos con gradientes y diseño responsivo.
- `js/app.js` – Código JavaScript para la navegación y carga de proyectos.

Puedes subirlo a un hosting estático o usarlo con un backend en PHP/MySQL.

## Backend

Se incluyen scripts PHP para autenticación básica:

- `php/register.php` – Registro de usuarios con foto de perfil y documentos.
- `php/login.php` – Inicio de sesión seguro con contraseñas encriptadas.
- `php/config.php` – Configuración de conexión a MySQL (por defecto: root/ sin contraseña).
- `uploads/` – Carpeta para fotos de perfil y documentos (crear manualmente).

### Tablas necesarias en MySQL (ejecutar en phpMyAdmin)

```sql
CREATE DATABASE vendraly;
-- y luego las tablas de usuarios, proyectos e inversiones
