<?php
session_start();
require_once "../db/conexion.php";

header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "No autenticado"]);
    exit;
}

$usuario_id = $_SESSION["user_id"];
$input = json_decode(file_get_contents("php://input"), true);

$oleada = intval($input["oleada"]);

$stmt = $conn->prepare("UPDATE progreso SET oleada_actual=? WHERE usuario_id=?");
$stmt->bind_param("ii", $oleada, $usuario_id);
$stmt->execute();

echo json_encode(["success" => true]);
