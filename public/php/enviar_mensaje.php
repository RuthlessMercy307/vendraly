<?php
require 'config.php';
require 'csrf_token.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

verify_csrf_token();

$usuario_id = $_SESSION['usuario_id'];
$conversacion_id = intval($_POST['conversacion_id'] ?? 0);
$texto = trim($_POST['texto'] ?? '');

if (!$conversacion_id || !$texto) {
    echo json_encode(['status' => 'error', 'msg' => 'Datos incompletos']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO mensajes (conversacion_id, emisor_id, texto) VALUES (?, ?, ?)');
$success = $stmt->execute([$conversacion_id, $usuario_id, $texto]);

if ($success) {
    $mensaje_id = $pdo->lastInsertId();
    echo json_encode(['status' => 'ok', 'mensaje_id' => $mensaje_id]);
} else {
    echo json_encode(['status' => 'error']);
}
