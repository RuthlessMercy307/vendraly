# Vendraly Prototype

This repository contains a prototype for the Vendraly micro‑investment platform. It uses a PHP application served from the `public_html` directory and a WebSocket server written in Node.js.

## Launching the application

1. **Start the PHP development server**

   From the repository root, run:

   ```bash
   php -S localhost:8000 router.php -t public_html
   ```

   The router handles routes and serves files from `public_html`.

2. **Start the WebSocket server**

   In a separate terminal, run:

   ```bash
   node server.js
   ```

   This enables WebSocket messaging on port `8080`.

3. **Configure environment variables**

   Database credentials are read from the following environment variables used by `config.js` and `config.php`:

   - `DB_HOST` – database host
   - `DB_USER` – database user
   - `DB_PASS` – database password
   - `DB_NAME` – database name

   Make sure these variables are exported before launching the servers.

