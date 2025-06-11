<?php
require 'config.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare('SELECT u.id, u.nombre, u.email, u.telefono, u.rol, p.bio, p.direccion, p.estado, p.saldo, p.documento_numero, p.foto_documento, p.foto_selfie, p.foto_de_lado FROM usuarios u JOIN perfil_usuario p ON u.id = p.usuario_id WHERE u.id = ?');
    $stmt->execute([$usuario_id]);
    $perfil = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'ok', 'perfil' => $perfil]);
    exit;
}

// Actualización simple
$bio = $_POST['bio'] ?? null;
$direccion = $_POST['direccion'] ?? null;
$telefono = $_POST['telefono'] ?? null;

$stmt = $pdo->prepare('UPDATE usuarios SET telefono = ? WHERE id = ?');
$stmt->execute([$telefono, $usuario_id]);

$stmt = $pdo->prepare('UPDATE perfil_usuario SET bio = ?, direccion = ? WHERE usuario_id = ?');
$stmt->execute([$bio, $direccion, $usuario_id]);

echo json_encode(['status' => 'ok', 'msg' => 'Perfil actualizado']);
