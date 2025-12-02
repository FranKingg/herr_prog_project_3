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

$oro    = intval($input["oro"]);
$madera = intval($input["madera"]);
$piedra = intval($input["piedra"]);

$stmt = $conn->prepare("UPDATE recursos SET oro=?, madera=?, piedra=? WHERE usuario_id=?");
$stmt->bind_param("iiii", $oro, $madera, $piedra, $usuario_id);
$stmt->execute();

echo json_encode(["success" => true]);
