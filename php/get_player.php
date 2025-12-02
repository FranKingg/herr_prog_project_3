<?php
session_start();
require_once "../db/mysql.php";

header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "No autenticado"]);
    exit;
}

$usuario_id = $_SESSION["user_id"];

$sqlUser = $conn->query("SELECT nivel, exp, exp_max, nickname FROM usuarios WHERE id=$usuario_id");
$user = $sqlUser->fetch_assoc();

$sqlRec = $conn->query("SELECT oro, madera, piedra FROM recursos WHERE usuario_id=$usuario_id");
$rec = $sqlRec->fetch_assoc();

$sqlProg = $conn->query("SELECT oleada_actual FROM progreso WHERE usuario_id=$usuario_id");
$prog = $sqlProg->fetch_assoc();

echo json_encode([
    "nivel"   => intval($user["nivel"]),
    "exp"     => intval($user["exp"]),
    "exp_max" => intval($user["exp_max"]),
    "nickname"=> $user["nickname"],
    "oro"     => intval($rec["oro"]),
    "madera"  => intval($rec["madera"]),
    "piedra"  => intval($rec["piedra"]),
    "oleada"  => intval($prog["oleada_actual"])
]);
