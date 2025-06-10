<?php
require_once 'config.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $csrf = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $csrf)) {
        echo json_encode(["status" => "error", "msg" => "Token CSRF inválido"]);
        exit;
    }

    $nombre = $_POST["nombre"] ?? '';
    $email = $_POST["email"] ?? '';
    $telefono = $_POST["telefono"] ?? '';
    $password = $_POST["password"] ?? '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "msg" => "Email inválido"]);
        exit;
    }

    if (!$nombre || !$email || !$telefono || !$password) {
        echo json_encode(["status" => "error", "msg" => "Faltan campos obligatorios"]);
        exit;
    }

    // Verifica si ya existe el email
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(["status" => "error", "msg" => "El correo ya está registrado"]);
        exit;
    }

    // Insertar nuevo usuario
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password_hash, telefono, fecha_registro) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([$nombre, $email, $hash, $telefono]);
    $usuario_id = $pdo->lastInsertId();

    // Crear perfil vacío
    $stmt = $pdo->prepare("INSERT INTO perfil_usuario (usuario_id, bio, direccion, estado, saldo, documento_numero, foto_documento, foto_selfie, foto_de_lado) VALUES (?, NULL, NULL, 'en_verificacion', 0.00, NULL, NULL, NULL, NULL)");
    $stmt->execute([$usuario_id]);

    echo json_encode(["status" => "ok", "msg" => "Registrado con éxito"]);
}
?>
