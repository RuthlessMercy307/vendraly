<?php
require 'config.php';
require 'csrf_token.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

verify_csrf_token();

$usuario_id = $_SESSION['usuario_id'];
$accion = $_POST['accion'] ?? '';
$entidad = $_POST['entidad'] ?? '';
$id_entidad = intval($_POST['id_entidad'] ?? 0);

if (!$accion) {
    echo json_encode(['status' => 'error', 'msg' => 'Acción requerida']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO auditoria (usuario_id, accion, entidad_afectada, id_entidad) VALUES (?, ?, ?, ?)');
$success = $stmt->execute([$usuario_id, $accion, $entidad, $id_entidad]);

echo json_encode($success ? ['status' => 'ok'] : ['status' => 'error']);
