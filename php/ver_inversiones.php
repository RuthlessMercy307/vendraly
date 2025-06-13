<?php
require 'config.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$stmt = $pdo->prepare('SELECT i.*, p.titulo FROM inversiones i JOIN proyectos p ON i.proyecto_id = p.id WHERE i.usuario_id = ?');
$stmt->execute([$usuario_id]);
$inversiones = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'ok', 'inversiones' => $inversiones]);
