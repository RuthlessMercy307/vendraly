<?php
session_start();
require_once 'config.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST["email"] ?? '';
    $password = $_POST["password"] ?? '';

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
        echo json_encode(["status" => "ok", "msg" => "Bienvenido " . $user["nombre"]]);
    } else {
        echo json_encode(["status" => "error", "msg" => "Credenciales inválidas"]);
    }
}
?>
