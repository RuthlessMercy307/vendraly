<?php
// config.php
$host = 'localhost';
$dbname = 'cambblym_vendraly';
$user = 'cambblym_vendraly';
$pass = '2j)I]V4G^1dV';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    session_start();
} catch (PDOException $e) {
    die("Error al conectar a la base de datos: " . $e->getMessage());
}
