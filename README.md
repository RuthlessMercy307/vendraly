# Vendraly

Este repositorio contiene un prototipo de plataforma de microinversiones colaborativas que conecta inversores con emprendedores locales.

## Variables de entorno

El archivo `public/php/config.php` obtiene la configuración de la base de datos de las siguientes variables de entorno:

* `DB_HOST` – Host de la base de datos (por defecto `localhost`).
* `DB_NAME` – Nombre de la base de datos (por defecto `cambblym_vendraly`).
* `DB_USER` – Usuario de la base de datos. Requerido si no se usa el valor por defecto.
* `DB_PASS` – Contraseña del usuario. Requerido si no se usa el valor por defecto.

Si `DB_USER` o `DB_PASS` no están definidos y no se establecen valores por defecto, la aplicación detendrá la ejecución mostrando un mensaje de error descriptivo.

## Base de Datos

La aplicación utiliza varias tablas en MySQL para almacenar información de usuarios y proyectos. A continuación se resumen las principales tablas observadas en el código PHP:

* **usuarios** – guarda los datos básicos de cada persona registrada. Sus columnas incluyen `nombre`, `email`, `telefono`, `fecha_registro` y `password_hash`. Este último campo almacena la contraseña en forma de hash, nunca en texto plano.
* **perfil_usuario** – contiene información adicional sobre el usuario como la biografía, la dirección y el estado del proceso de verificación. También mantiene el `saldo` disponible y referencias a documentos subidos.
* **stakes** – pensada para registrar los montos que un usuario bloquea temporalmente para invertir. Aunque en el frontend existe un historial de stakes, en este prototipo no se muestra aún código de inserción a dicha tabla.
* **proyectos_prestamo** y **proyectos_acciones** – almacenan proyectos propuestos por los usuarios. La primera sirve para proyectos de préstamo (monto necesario, plazo y retorno) y la segunda para ofertas de acciones (porcentaje disponible y precio por porcentaje). Ambas guardan el `usuario_id` dueño del proyecto, su título, descripciones, categoría y estado actual.

Estas definiciones provienen de las consultas SQL incluidas en los scripts de `public/php`, por lo que la estructura completa puede variar en una implementación final.
