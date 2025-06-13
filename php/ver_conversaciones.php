<?php
require 'config.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$stmt = $pdo->prepare('SELECT c.* FROM conversaciones c JOIN miembros_conversacion m ON c.id = m.conversacion_id WHERE m.usuario_id = ?');
$stmt->execute([$usuario_id]);
$conversaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'ok', 'conversaciones' => $conversaciones]);
