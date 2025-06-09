<?php
session_start();
if (isset($_SESSION["usuario_id"])) {
    echo json_encode(["logged_in" => true, "nombre" => $_SESSION["nombre"]]);
} else {
    echo json_encode(["logged_in" => false]);
}
?>
