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

$map = [];
foreach ($pages as $p) {
    $map[substr(md5($p), 0, 8)] = $p;
}

$code = $_GET['c'] ?? '';
if (isset($map[$code]) && file_exists($map[$code])) {
    include $map[$code];
} else {
    http_response_code(404);
    echo 'Página no encontrada';
}
