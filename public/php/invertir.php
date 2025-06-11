<?php
require 'config.php';
require 'csrf_token.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

verify_csrf_token();

$usuario_id = $_SESSION['usuario_id'];
$proyecto_id = intval($_POST['proyecto_id'] ?? 0);
$monto = floatval($_POST['monto'] ?? 0);
$porcentaje = floatval($_POST['porcentaje'] ?? 0);
$tipo = $_POST['tipo'] ?? '';

if (!$proyecto_id || $monto <= 0 || !$tipo) {
    echo json_encode(['status' => 'error', 'msg' => 'Datos inválidos']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO inversiones (usuario_id, tipo, proyecto_id, monto, porcentaje_adquirido, fecha_inicio) VALUES (?, ?, ?, ?, ?, NOW())');
$success = $stmt->execute([$usuario_id, $tipo, $proyecto_id, $monto, $porcentaje]);

echo json_encode($success ? ['status' => 'ok'] : ['status' => 'error']);
