<?php
// config.php
$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'cambblym_vendraly';
$user = getenv('DB_USER') ?: 'cambblym_vendraly';
$pass = getenv('DB_PASS') ?: '2j)I]V4G^1dV';

if (!$user || !$pass) {
    die('Database credentials not provided. Set DB_USER and DB_PASS environment variables.');
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
} catch (PDOException $e) {
    die("Error al conectar a la base de datos: " . $e->getMessage());
}
