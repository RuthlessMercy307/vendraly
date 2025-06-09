<?php
require_once 'config.php';
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
<h1>Bienvenido, <?= htmlspecialchars($_SESSION['nombre']) ?></h1>
<p>Este es tu panel principal.</p>
<p><a href="logout.php">Cerrar sesión</a></p>
</body>
</html>
