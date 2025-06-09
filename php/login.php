<?php
require_once 'config.php';

$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $pass = $_POST['password'] ?? '';

    $stmt = $pdo->prepare('SELECT id, nombre_completo, contrasena FROM usuarios WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($pass, $user['contrasena'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['nombre'] = $user['nombre_completo'];
        header('Location: dashboard.php');
        exit;
    } else {
        $errors[] = 'Credenciales inválidas';
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
<h1>Ingresar</h1>
<?php if ($errors): ?>
    <div class="errors">
        <ul>
            <?php foreach ($errors as $e): ?><li><?= htmlspecialchars($e) ?></li><?php endforeach; ?>
        </ul>
    </div>
<?php endif; ?>
<form method="post" class="form">
    <label>Email
        <input type="email" name="email" required>
    </label>
    <label>Contraseña
        <input type="password" name="password" required>
    </label>
    <button type="submit">Entrar</button>
</form>
<p><a href="register.php">Crear una cuenta</a></p>
</body>
</html>
