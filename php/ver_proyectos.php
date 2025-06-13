<?php
require 'config.php';

$estado = $_GET['estado'] ?? null;
$categoria = $_GET['categoria'] ?? null;
$tipo = $_GET['tipo'] ?? null;

$query = 'SELECT * FROM proyectos WHERE 1';
$params = [];

if ($estado) {
    $query .= ' AND estado = ?';
    $params[] = $estado;
}
if ($categoria) {
    $query .= ' AND categoria = ?';
    $params[] = $categoria;
}
if ($tipo) {
    $query .= ' AND tipo = ?';
    $params[] = $tipo;
}

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$proyectos = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'ok', 'proyectos' => $proyectos]);
