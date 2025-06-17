<?php
require 'config.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$mi_rol = $_SESSION['rol'];

$stmt = $pdo->prepare('
    SELECT c.id, c.tipo, c.nombre 
    FROM conversaciones c 
    JOIN miembros_conversacion m ON c.id = m.conversacion_id 
    WHERE m.usuario_id = ?
');
$stmt->execute([$usuario_id]);
$conversaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($conversaciones as &$c) {
    // Adjuntar participantes
    $stmt2 = $pdo->prepare('
        SELECT u.id, u.nombre, u.rol 
        FROM miembros_conversacion m 
        JOIN usuarios u ON m.usuario_id = u.id 
        WHERE m.conversacion_id = ?
    ');
    $stmt2->execute([$c['id']]);
    $c['participantes'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode(['status' => 'ok', 'conversaciones' => $conversaciones]);
