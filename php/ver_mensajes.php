<?php
require 'config.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$conversacion_id = intval($_GET['conversacion_id'] ?? 0);

if (!$conversacion_id) {
    echo json_encode(['status' => 'error', 'msg' => 'Conversación inválida']);
    exit;
}

// 1. Obtener mensajes
$stmt = $pdo->prepare('SELECT id, texto, emisor_id, fecha FROM mensajes WHERE conversacion_id = ? ORDER BY fecha ASC');
$stmt->execute([$conversacion_id]);
$mensajes = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($mensajes as &$m) {
    $m['es_mio'] = ($m['emisor_id'] == $usuario_id);
}

// 2. Obtener tipo de conversación
$stmt = $pdo->prepare('SELECT tipo FROM conversaciones WHERE id = ?');
$stmt->execute([$conversacion_id]);
$tipo = $stmt->fetchColumn();

// 3. Obtener todos los participantes con roles
$stmt = $pdo->prepare("SELECT u.nombre, u.id, u.rol FROM miembros_conversacion m 
                       JOIN usuarios u ON m.usuario_id = u.id 
                       WHERE m.conversacion_id = ?");
$stmt->execute([$conversacion_id]);
$participantes_crudos = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 4. Filtrar para mostrar solo participantes relevantes
$participantes = [];
foreach ($participantes_crudos as $p) {
    if ($tipo === 'soporte' && ($p['rol'] === 'admin' || $p['rol'] === 'soporte')) {
        if ($_SESSION['rol'] !== 'admin' && $_SESSION['rol'] !== 'soporte') {
            continue; // usuario común no ve staff
        }
    }
    $participantes[] = [
        'nombre' => $p['nombre'],
        'es_mio' => $p['id'] == $usuario_id
    ];
}

// 5. (Opcional) obtener nombre del propietario si es tipo proyecto
$propietario = null;
if ($tipo === 'proyecto') {
    $stmt = $pdo->prepare('
        SELECT u.nombre 
        FROM miembros_conversacion m 
        JOIN usuarios u ON m.usuario_id = u.id 
        WHERE m.conversacion_id = ? 
        ORDER BY m.id ASC 
        LIMIT 1
    ');
    $stmt->execute([$conversacion_id]);
    $propietario = $stmt->fetchColumn();
}

// Obtener último mensaje leído por el otro participante
$stmt = $pdo->prepare("
    SELECT ultimo_mensaje_id, fecha 
    FROM ultima_lectura 
    WHERE conversacion_id = ? AND usuario_id != ?
");
$stmt->execute([$conversacion_id, $usuario_id]);
$lectura_otro = $stmt->fetch(PDO::FETCH_ASSOC);

// Devolverlo solo si hay lectura
if ($lectura_otro) {
    $lectura_otro['ultimo_mensaje_id'] = (int)$lectura_otro['ultimo_mensaje_id'];
    $lectura_otro['fecha'] = $lectura_otro['fecha'];
    $extra['leido_por_otro'] = $lectura_otro;
}

// 6. Enviar respuesta final
echo json_encode([
    'status' => 'ok',
    'mensajes' => $mensajes,
    'participantes' => $participantes,
    'propietario' => $propietario,
    'leido_por_otro' => $lectura_otro ?? null
]);
