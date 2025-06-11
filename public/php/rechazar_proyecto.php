<?php
require 'config.php';
require 'csrf_token.php';

if (!isset($_SESSION['usuario_id']) || !in_array($_SESSION['rol'], ['admin','soporte'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No autorizado']);
    exit;
}

verify_csrf_token();

$id = intval($_POST['id'] ?? 0);
$motivo = trim($_POST['motivo'] ?? '');
if (!$id || !$motivo) {
    echo json_encode(['status' => 'error', 'msg' => 'Datos incompletos']);
    exit;
}

$stmt = $pdo->prepare('UPDATE proyectos SET estado = "rechazado", moderado_por = ?, fecha_revision = NOW(), motivo_rechazo = ? WHERE id = ?');
$success = $stmt->execute([$_SESSION['usuario_id'], $motivo, $id]);

echo json_encode($success ? ['status' => 'ok'] : ['status' => 'error']);
