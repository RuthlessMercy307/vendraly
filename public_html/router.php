<?php
$pages = [
    'dashboard/crearproyecto.html',
    'dashboard/cuenta.html',
    'dashboard/mensajes.html',
    'dashboard/portafolio.html',
    'dashboard/invertir.html',
    'dashboard/oportunidades.html',
    'dashboard/verproyecto.html',
    'index.html'
];

// Mapeo con slug y con código hash de 8 caracteres
$map = [];
foreach ($pages as $p) {
    $slug = basename($p, '.html'); // por ejemplo: cuenta, mensajes, etc.
    $map[$slug] = $p;
    $map[substr(md5($p), 0, 8)] = $p;
}

$code = $_GET['c'] ?? '';
if (isset($map[$code]) && file_exists($map[$code])) {
    include $map[$code];
} else {
    http_response_code(404);
    echo 'Página no encontrada';
}
