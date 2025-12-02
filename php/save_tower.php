<?php
session_start();
require_once "../db/conexion.php";

if (!isset($_SESSION["user_id"])) exit;

$usuario_id = $_SESSION["user_id"];
$input = json_decode(file_get_contents("php://input"), true);

$vida = intval($input["vida"]);
$nivel = intval($input["nivel"]);

$stmt = $conn->prepare("UPDATE edificios SET nivel=?, vida=? WHERE usuario_id=? AND tipo='base'");
$stmt->bind_param("iii", $nivel, $vida, $usuario_id);
$stmt->execute();

echo json_encode(["success"=>true]);
