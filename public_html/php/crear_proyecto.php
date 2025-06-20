<?php
require 'config.php';
require 'csrf_token.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

verify_csrf_token();

$usuario_id = $_SESSION['usuario_id'];
$nombre_usuario = $_SESSION['nombre'] ?? 'Usuario';

$tipo = $_POST['tipo'] ?? '';
$titulo = trim($_POST['titulo'] ?? '');
$descripcion_corta = trim($_POST['descripcion_corta'] ?? '');
$descripcion_larga = trim($_POST['descripcion_larga'] ?? '');
$categoria = trim($_POST['categoria'] ?? '');

if (!$tipo || !$titulo || !$descripcion_corta || !$descripcion_larga || !$categoria) {
    echo json_encode(['status' => 'error', 'msg' => 'Faltan datos obligatorios.']);
    exit;
}

if ($tipo === 'prestamo') {
    $necesario = floatval($_POST['monto'] ?? 0);
    $plazo = intval($_POST['plazo'] ?? 0);
    $retorno = floatval($_POST['retorno'] ?? 0);

    if (!$necesario || !$plazo || !$retorno) {
        echo json_encode(['status' => 'error', 'msg' => 'Faltan datos del préstamo.']);
        exit;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO proyectos (usuario_id, tipo, titulo, descripcion_corta, descripcion_larga, estado, nombre_usuario, categoria, necesario, plazo, retorno) " .
        "VALUES (?, 'prestamo', ?, ?, ?, 'en_verificacion', ?, ?, ?, ?, ?)"
    );
    $success = $stmt->execute([
        $usuario_id,
        $titulo,
        $descripcion_corta,
        $descripcion_larga,
        $nombre_usuario,
        $categoria,
        $necesario,
        $plazo,
        $retorno
    ]);
} elseif ($tipo === 'acciones') {
    $porcentaje_disponible = floatval($_POST['porcentaje_disponible'] ?? 0);
    $precio_porcentaje = floatval($_POST['precio_porcentaje'] ?? 0);

    if (!$porcentaje_disponible || !$precio_porcentaje) {
        echo json_encode(['status' => 'error', 'msg' => 'Faltan datos del proyecto de acciones.']);
        exit;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO proyectos (usuario_id, tipo, titulo, descripcion_corta, descripcion_larga, estado, nombre_usuario, categoria, porcentaje_disponible, precio_porcentaje) " .
        "VALUES (?, 'acciones', ?, ?, ?, 'en_verificacion', ?, ?, ?, ?)"
    );
    $success = $stmt->execute([
        $usuario_id,
        $titulo,
        $descripcion_corta,
        $descripcion_larga,
        $nombre_usuario,
        $categoria,
        $porcentaje_disponible,
        $precio_porcentaje
    ]);
} else {
    echo json_encode(['status' => 'error', 'msg' => 'Tipo de proyecto no válido.']);
    exit;
}

if ($success) {
    echo json_encode(['status' => 'ok', 'msg' => 'Proyecto enviado para revisión.']);
} else {
    echo json_encode(['status' => 'error', 'msg' => 'Error al publicar el proyecto.']);
}
