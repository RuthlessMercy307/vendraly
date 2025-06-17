<?php
require 'config.php';

$stmt = $pdo->prepare("SELECT id, titulo, descripcion_corta, descripcion_larga, categoria, nombre_usuario AS owner, tipo, necesario, acumulado, retorno, plazo, porcentaje_disponible, precio_porcentaje FROM proyectos WHERE estado = 'activo'");
$stmt->execute();
$proyectos = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'ok', 'proyectos' => $proyectos]);
