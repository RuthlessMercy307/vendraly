<?php
session_start();
if (isset($_SESSION["usuario_id"])) {
    $nombre = htmlspecialchars($_SESSION["nombre"], ENT_QUOTES, 'UTF-8');
    $rol = $_SESSION["rol"] ?? 'usuario';
    echo json_encode(["logged_in" => true, "nombre" => $nombre, "rol" => $rol]);
} else {
    echo json_encode(["logged_in" => false]);
}
?>
