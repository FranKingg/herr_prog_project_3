<?php
session_start();
require_once "../db/conexion.php";

header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "No autenticado"]);
    exit;
}

$usuario_id = $_SESSION["user_id"];

$sql = $conn->query("SELECT oro, madera, piedra FROM recursos WHERE usuario_id=$usuario_id");
$data = $sql->fetch_assoc();

echo json_encode([
    "oro" => intval($data["oro"]),
    "madera" => intval($data["madera"]),
    "piedra" => intval($data["piedra"])
]);
