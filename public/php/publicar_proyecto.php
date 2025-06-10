<?php
session_start();

if (!isset($_SESSION['id'])) {
  echo json_encode(['status' => 'error', 'msg' => 'No has iniciado sesión.']);
  exit;
}

require 'config.php';

$usuario_id = $_SESSION['id'];
$nombre_usuario = $_SESSION['nombre'] ?? 'Usuario';

$tipo = $_POST['tipo'] ?? '';
$titulo = trim($_POST['titulo'] ?? '');
$descripcion_corta = trim($_POST['descripcion_corta'] ?? '');
$descripcion_larga = trim($_POST['descripcion_larga'] ?? '');
$categoria = trim($_POST['categoria'] ?? '');

if (!$tipo || !$titulo || !$descripcion_corta || !$descripcion_larga || !$categoria) {
  echo json_encode(['status' => 'error', 'msg' => 'Faltan datos obligatorios.']);
  exit;
}

if ($tipo === 'prestamo') {
  $monto = floatval($_POST['monto'] ?? 0);
  $plazo = intval($_POST['plazo'] ?? 0);
  $retorno = floatval($_POST['retorno'] ?? 0);

  if (!$monto || !$plazo || !$retorno) {
    echo json_encode(['status' => 'error', 'msg' => 'Faltan datos del préstamo.']);
    exit;
  }

  $estado = 'cerrado';
  $stmt = $pdo->prepare(
    "INSERT INTO proyectos_prestamo (usuario_id, titulo, descripcion_corta, descripcion_larga, necesario, plazo, retorno, nombre_usuario, categoria, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  $success = $stmt->execute([
    $usuario_id,
    $titulo,
    $descripcion_corta,
    $descripcion_larga,
    $monto,
    $plazo,
    $retorno,
    $nombre_usuario,
    $categoria,
    $estado
  ]);

} elseif ($tipo === 'acciones') {
  $porcentaje_disponible = floatval($_POST['porcentaje_disponible'] ?? 0);
  $precio_porcentaje = floatval($_POST['precio_porcentaje'] ?? 0);

  if (!$porcentaje_disponible || !$precio_porcentaje) {
    echo json_encode(['status' => 'error', 'msg' => 'Faltan datos del proyecto de acciones.']);
    exit;
  }

  $estado = 'cerrado';
  $stmt = $pdo->prepare(
    "INSERT INTO proyectos_acciones (usuario_id, titulo, descripcion_corta, descripcion_larga, porcentaje_disponible, precio_porcentaje, nombre_usuario, categoria, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  $success = $stmt->execute([
    $usuario_id,
    $titulo,
    $descripcion_corta,
    $descripcion_larga,
    $porcentaje_disponible,
    $precio_porcentaje,
    $nombre_usuario,
    $categoria,
    $estado
  ]);

} else {
  echo json_encode(['status' => 'error', 'msg' => 'Tipo de proyecto no válido.']);
  exit;
}

if ($success) {
  echo json_encode(['status' => 'ok', 'msg' => 'Proyecto enviado para revisión.']);
} else {
  echo json_encode(['status' => 'error', 'msg' => 'Error al publicar el proyecto.']);
}

