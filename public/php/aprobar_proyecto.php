<?php
require 'config.php';

if (!isset($_SESSION['usuario_id']) || !in_array($_SESSION['rol'], ['admin','soporte'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No autorizado']);
    exit;
}

$id = intval($_POST['id'] ?? 0);
if (!$id) {
    echo json_encode(['status' => 'error', 'msg' => 'ID inválido']);
    exit;
}

$stmt = $pdo->prepare('UPDATE proyectos SET estado = "activo", moderado_por = ?, fecha_revision = NOW() WHERE id = ?');
$success = $stmt->execute([$_SESSION['usuario_id'], $id]);

echo json_encode($success ? ['status' => 'ok'] : ['status' => 'error']);
