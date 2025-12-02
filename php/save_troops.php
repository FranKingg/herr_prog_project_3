<?php
session_start();
require_once "../db/conexion.php";

header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) exit;

$usuario_id = $_SESSION["user_id"];
$input = json_decode(file_get_contents("php://input"), true);

foreach ($input["tropas"] as $tipo => $cantidad) {
    $stmt = $conn->prepare("
        INSERT INTO tropas (usuario_id, tipo, cantidad)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE cantidad=?
    ");
    $stmt->bind_param("isii", $usuario_id, $tipo, $cantidad, $cantidad);
    $stmt->execute();
}

echo json_encode(["success" => true]);
