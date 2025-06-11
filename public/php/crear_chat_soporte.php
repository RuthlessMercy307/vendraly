<?php
if (!isset($pdo) || !isset($usuario_id)) return;

// Buscar soporte
$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE rol IN ('admin', 'soporte') ORDER BY id LIMIT 1");
$stmt->execute();
$admin = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$admin) return;

$soporte_id = (int)$admin['id'];
if ($usuario_id === $soporte_id) return;

// Verificar existencia
$stmt = $pdo->prepare("SELECT c.id FROM conversaciones c
    JOIN miembros_conversacion m1 ON c.id = m1.conversacion_id AND m1.usuario_id = ?
    JOIN miembros_conversacion m2 ON c.id = m2.conversacion_id AND m2.usuario_id = ?
    WHERE c.tipo = 'soporte' LIMIT 1");
$stmt->execute([$usuario_id, $soporte_id]);
if ($stmt->fetch()) return;

// Crear conversación
$stmt = $pdo->prepare("INSERT INTO conversaciones (tipo, nombre) VALUES ('soporte', 'Soporte Vendraly')");
$stmt->execute();
$conversacion_id = $pdo->lastInsertId();

// Agregar miembros
$insert = $pdo->prepare("INSERT INTO miembros_conversacion (conversacion_id, usuario_id) VALUES (?, ?)");
$insert->execute([$conversacion_id, $usuario_id]);
$insert->execute([$conversacion_id, $soporte_id]);

// Mensaje de bienvenida
$pdo->prepare("INSERT INTO mensajes (conversacion_id, emisor_id, texto) VALUES (?, ?, ?)")
    ->execute([$conversacion_id, $soporte_id, 'Hola, ¡Bienvenido al soporte de Vendraly! ¿En qué podemos ayudarte?']);
