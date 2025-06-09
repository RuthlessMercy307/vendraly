# Vendraly

Prototipo de plataforma de microinversiones colaborativas.

Este repositorio contiene un ejemplo simple de la interfaz principal usando solo HTML, CSS y JavaScript. Puede subirse a cualquier hosting estático.

## Archivos
- `index.html` - página principal con las secciones de proyectos.
- `css/style.css` - estilos modernos con gradientes y diseño responsivo.
- `js/app.js` - código JavaScript para la navegación móvil y carga de proyectos.

Los datos de los proyectos están en la variable `projects` dentro de `app.js`. En un hosting con PHP, podrías cargar esos datos desde una base de datos MySQL y generar la página usando includes para el `header` y `footer`.

## Autenticación básica en PHP

Se añadieron scripts en `php/` para un sistema inicial de registro y login usando MySQL.

1. Copia el archivo `php/config.php` y ajusta las credenciales de tu base de datos.
2. Crea una base `vendraly` y ejecuta las sentencias de las tablas en la descripción del proyecto.
3. Coloca la carpeta en un servidor con PHP 7.4+ (XAMPP, etc.).
4. Accede a `php/register.php` para crear un usuario y luego ingresa en `php/login.php`.

Las imágenes subidas se guardan en la carpeta `uploads/` y no se incluyen en el repositorio.

