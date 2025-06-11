<?php
require 'config.php';

if (!isset($_SESSION['usuario_id']) || $_SESSION['rol'] !== 'admin') {
    echo json_encode(['status' => 'error', 'msg' => 'No autorizado']);
    exit;
}

$stmt = $pdo->query('SELECT a.*, u.nombre FROM auditoria a LEFT JOIN usuarios u ON a.usuario_id = u.id ORDER BY fecha DESC');
$logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'ok', 'logs' => $logs]);
