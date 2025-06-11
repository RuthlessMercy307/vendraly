<?php
require 'config.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$conversacion_id = intval($_POST['conversacion_id'] ?? 0);
$mensaje_id = intval($_POST['mensaje_id'] ?? 0);

if (!$conversacion_id || !$mensaje_id) {
    echo json_encode(['status' => 'error', 'msg' => 'Datos incompletos']);
    exit;
}

$stmt = $pdo->prepare('REPLACE INTO ultima_lectura (usuario_id, conversacion_id, ultimo_mensaje_id) VALUES (?, ?, ?)');
$success = $stmt->execute([$usuario_id, $conversacion_id, $mensaje_id]);

echo json_encode($success ? ['status' => 'ok'] : ['status' => 'error']);
