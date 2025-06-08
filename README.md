# Vendraly

Prototipo de plataforma de microinversiones colaborativas.

## Backend

El directorio `backend/` contiene una API REST realizada con Express y SQLite.

Para instalar dependencias y ejecutarla:

```bash
cd backend
npm install
node server.js
```

La API estará disponible en `http://localhost:3000`.

## Frontend

Los archivos del frontend están en `frontend/` y son HTML, CSS y JavaScript puro.
Puedes subir esa carpeta a un hosting estático o abrir `index.html` directamente en el navegador. Las páginas consumen la API usando `fetch` hacia la URL configurada en `js/config.js`.

El diseño utiliza una paleta de azules con un tono verde como color de acción y la librería de íconos Font Awesome vía CDN.
