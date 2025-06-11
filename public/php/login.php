<?php
require_once 'config.php';
require_once 'csrf_token.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    verify_csrf_token();

    $email = $_POST["email"] ?? '';
    $password = $_POST["password"] ?? '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "msg" => "Email inválido"]);
        exit;
    }

    if (!$email || !$password) {
        echo json_encode(["status" => "error", "msg" => "Email y contraseña requeridos"]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, nombre, password_hash, rol FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user["password_hash"])) {
        $_SESSION["usuario_id"] = $user["id"];
        $_SESSION["nombre"] = $user["nombre"];
        $_SESSION["rol"] = $user["rol"];

        $nombre = htmlspecialchars($user["nombre"], ENT_QUOTES, 'UTF-8');
        echo json_encode([
            "status" => "ok",
            "msg" => "Bienvenido " . $nombre,
            "rol" => $user["rol"]
        ]);
    } else {
        echo json_encode(["status" => "error", "msg" => "Credenciales inválidas"]);
    }
}
?>
