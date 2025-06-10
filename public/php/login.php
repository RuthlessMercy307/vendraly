<?php
require_once 'config.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $csrf = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $csrf)) {
        echo json_encode(["status" => "error", "msg" => "Token CSRF inválido"]);
        exit;
    }

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

    $stmt = $pdo->prepare("SELECT id, nombre, password_hash FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user["password_hash"])) {
        $_SESSION["usuario_id"] = $user["id"];
        $_SESSION["nombre"] = $user["nombre"];
        $nombre = htmlspecialchars($user["nombre"], ENT_QUOTES, 'UTF-8');
        echo json_encode(["status" => "ok", "msg" => "Bienvenido " . $nombre]);
    } else {
        echo json_encode(["status" => "error", "msg" => "Credenciales inválidas"]);
    }
}
?>
