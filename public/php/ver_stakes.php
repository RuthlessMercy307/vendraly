<?php
require 'config.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$stmt = $pdo->prepare('SELECT * FROM stakes WHERE usuario_id = ? ORDER BY fecha_inicio DESC');
$stmt->execute([$usuario_id]);
$stakes = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'ok', 'stakes' => $stakes]);
