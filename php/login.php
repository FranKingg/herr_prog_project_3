<?php
header("Content-Type: application/json");
require_once "../db/conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["nickname"]) || !isset($data["password"])) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$nickname = trim($data["nickname"]);
$password = trim($data["password"]);

try {
    // Buscar usuario
    $stmt = $pdo->prepare("SELECT id, password FROM jugadores WHERE nickname = ?");
    $stmt->execute([$nickname]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(["error" => "Usuario no existe"]);
        exit;
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verificar contraseña
    if (!password_verify($password, $user["password"])) {
        echo json_encode(["error" => "Contraseña incorrecta"]);
        exit;
    }

    // Crear sesión
    session_start();
    $_SESSION["user_id"] = $user["id"];
    $_SESSION["nickname"] = $nickname;

    echo json_encode(["ok" => true]);

} catch (PDOException $e) {

    echo json_encode([
        "error" => "Error en el servidor",
        "detalle" => $e->getMessage()
    ]);
}
