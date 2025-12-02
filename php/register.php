<?php
header("Content-Type: application/json");
require_once "../db/conexion.php";

// Obtener datos del POST JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["nickname"]) || !isset($data["password"])) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$nickname = trim($data["nickname"]);
$password = trim($data["password"]);

// Validaciones básicas
if ($nickname === "" || $password === "") {
    echo json_encode(["error" => "Campos vacíos"]);
    exit;
}

// Verificar si el usuario ya existe
try {
    $stmt = $pdo->prepare("SELECT id FROM jugadores WHERE nickname = ?");
    $stmt->execute([$nickname]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["error" => "El usuario ya existe"]);
        exit;
    }

    // Insertar usuario nuevo
    $hashed = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("INSERT INTO jugadores (nickname, password) VALUES (?, ?)");
    $stmt->execute([$nickname, $hashed]);

    echo json_encode(["ok" => true]);

} catch (PDOException $e) {

    echo json_encode([
        "error" => "Error en el servidor",
        "detalle" => $e->getMessage()
    ]);
}
