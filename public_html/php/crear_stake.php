<?php
require 'config.php';
require 'csrf_token.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

verify_csrf_token();

$usuario_id = $_SESSION['usuario_id'];
$monto = floatval($_POST['monto'] ?? 0);
$fecha_inicio = $_POST['fecha_inicio'] ?? date('Y-m-d');
$bloqueado_hasta = $_POST['bloqueado_hasta'] ?? null;

if ($monto <= 0 || !$bloqueado_hasta) {
    echo json_encode(['status' => 'error', 'msg' => 'Datos inválidos']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO stakes (usuario_id, monto, fecha_inicio, bloqueado_hasta) VALUES (?, ?, ?, ?)');
$success = $stmt->execute([$usuario_id, $monto, $fecha_inicio, $bloqueado_hasta]);

if ($success) {
    echo json_encode(['status' => 'ok']);
} else {
    echo json_encode(['status' => 'error', 'msg' => 'No se pudo crear el stake']);
}
