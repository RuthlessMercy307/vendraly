<?php
require_once 'config.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST["email"] ?? '';
    $password = $_POST["password"] ?? '';

    if (!$email || !$password) {
        echo json_encode(["status" => "error", "msg" => "Faltan email o contraseña"]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT u.id, u.nombre, u.password_hash FROM usuarios u WHERE u.email = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario && password_verify($password, $usuario["password_hash"])) {
        // Guardar en sesión
        $_SESSION["usuario_id"] = $usuario["id"];
        $_SESSION["usuario_nombre"] = $usuario["nombre"];

        echo json_encode(["status" => "ok", "msg" => "Bienvenido, {$usuario['nombre']}"]);
    } else {
        echo json_encode(["status" => "error", "msg" => "Email o contraseña incorrectos"]);
    }
}
?>
