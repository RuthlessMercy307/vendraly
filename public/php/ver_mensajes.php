<?php
require 'config.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

$conversacion_id = intval($_GET['conversacion_id'] ?? 0);

if (!$conversacion_id) {
    echo json_encode(['status' => 'error', 'msg' => 'Conversación inválida']);
    exit;
}

$stmt = $pdo->prepare('SELECT texto, emisor_id, fecha FROM mensajes WHERE conversacion_id = ? ORDER BY fecha ASC');
$stmt->execute([$conversacion_id]);
$mensajes = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'ok', 'mensajes' => $mensajes]);
