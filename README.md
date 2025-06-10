# Vendraly

Este repositorio contiene un prototipo de plataforma de microinversiones colaborativas que conecta inversores con emprendedores locales.

## Variables de entorno

El archivo `public/php/config.php` obtiene la configuración de la base de datos de las siguientes variables de entorno:

* `DB_HOST` – Host de la base de datos (por defecto `localhost`).
* `DB_NAME` – Nombre de la base de datos (por defecto `cambblym_vendraly`).
* `DB_USER` – Usuario de la base de datos. Requerido si no se usa el valor por defecto.
* `DB_PASS` – Contraseña del usuario. Requerido si no se usa el valor por defecto.

Si `DB_USER` o `DB_PASS` no están definidos y no se establecen valores por defecto, la aplicación detendrá la ejecución mostrando un mensaje de error descriptivo.

## Seguridad CSRF

Los formularios de registro e inicio de sesión obtienen un token desde
`php/csrf_token.php` al cargarse. Este valor se almacena en la sesión y se
incluye en cada solicitud `POST`. Los scripts PHP validan dicho token antes de
procesar los datos para proteger la aplicación frente a ataques CSRF.
