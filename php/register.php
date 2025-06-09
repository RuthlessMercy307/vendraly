<?php
require_once 'config.php';

$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre'] ?? '');
    $email  = trim($_POST['email'] ?? '');
    $pass   = $_POST['password'] ?? '';
    $cpfcnpj = trim($_POST['cpf_cnpj'] ?? '');
    $rg = trim($_POST['rg'] ?? '');

    if ($nombre === '' || $email === '' || $pass === '' || $cpfcnpj === '') {
        $errors[] = 'Complete todos los campos obligatorios.';
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Email no válido';
    }

    $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        $errors[] = 'El email ya está registrado';
    }

    $uploadsDir = __DIR__ . '/../uploads/';
    $allowedTypes = ['image/jpeg','image/png'];
    $maxSize = 2 * 1024 * 1024; //2MB

    $foto_perfil = null;
    $foto_frente = null;
    $foto_verso = null;

    $files = [
        'foto_perfil' => &$foto_perfil,
        'foto_doc_frente' => &$foto_frente,
        'foto_doc_verso' => &$foto_verso
    ];

    foreach ($files as $field => &$path) {
        if (isset($_FILES[$field]) && $_FILES[$field]['error'] === UPLOAD_ERR_OK) {
            if (!in_array($_FILES[$field]['type'], $allowedTypes)) {
                $errors[] = "Archivo no permitido en $field";
                continue;
            }
            if ($_FILES[$field]['size'] > $maxSize) {
                $errors[] = "Archivo demasiado grande en $field";
                continue;
            }
            $ext = pathinfo($_FILES[$field]['name'], PATHINFO_EXTENSION);
            $filename = uniqid() . "." . $ext;
            if (!move_uploaded_file($_FILES[$field]['tmp_name'], $uploadsDir . $filename)) {
                $errors[] = "No se pudo guardar $field";
            } else {
                $path = 'uploads/' . $filename;
            }
        }
    }

    if (!$errors) {
        $hash = password_hash($pass, PASSWORD_DEFAULT);
        $sql = 'INSERT INTO usuarios (nombre_completo,email,contrasena,cpf_cnpj,rg,foto_perfil,foto_doc_frente,foto_doc_verso) VALUES (?,?,?,?,?,?,?,?)';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nombre,$email,$hash,$cpfcnpj,$rg,$foto_perfil,$foto_frente,$foto_verso]);
        header('Location: login.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Registro</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
<h1>Crear cuenta</h1>
<?php if ($errors): ?>
    <div class="errors">
        <ul>
            <?php foreach ($errors as $e): ?><li><?= htmlspecialchars($e) ?></li><?php endforeach; ?>
        </ul>
    </div>
<?php endif; ?>
<form method="post" enctype="multipart/form-data" class="form">
    <label>Nombre completo
        <input type="text" name="nombre" required>
    </label>
    <label>Email
        <input type="email" name="email" required>
    </label>
    <label>Contraseña
        <input type="password" name="password" required>
    </label>
    <label>CPF o CNPJ
        <input type="text" name="cpf_cnpj" required>
    </label>
    <label>RG
        <input type="text" name="rg">
    </label>
    <label>Foto de perfil
        <input type="file" name="foto_perfil" accept="image/jpeg,image/png">
    </label>
    <label>Documento (frente)
        <input type="file" name="foto_doc_frente" accept="image/jpeg,image/png">
    </label>
    <label>Documento (verso)
        <input type="file" name="foto_doc_verso" accept="image/jpeg,image/png">
    </label>
    <button type="submit">Registrarse</button>
</form>
<p><a href="login.php">Volver al login</a></p>
</body>
</html>
