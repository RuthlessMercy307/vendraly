<?php
require 'config.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

$stmt = $pdo->prepare("SELECT id, titulo, tipo, estado, necesario, porcentaje_disponible, precio_porcentaje, retorno, plazo, descripcion_corta, categoria FROM proyectos WHERE usuario_id = ? ORDER BY fecha_publicacion DESC");
$stmt->execute([$usuario_id]);
$proyectos = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'ok', 'proyectos' => $proyectos]);
?>