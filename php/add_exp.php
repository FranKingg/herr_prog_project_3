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

$exp_ganada = intval($input["exp"] ?? 0);
if ($exp_ganada <= 0) {
    echo json_encode(["error" => "Exp inválida"]);
    exit;
}

$sql = $conn->query("SELECT exp, exp_max, nivel FROM usuarios WHERE id=$usuario_id");
$u = $sql->fetch_assoc();

$exp     = intval($u["exp"]);
$exp_max = intval($u["exp_max"]);
$nivel   = intval($u["nivel"]);

$exp += $exp_ganada;

$subio_nivel = false;

while ($exp >= $exp_max) {
    $exp -= $exp_max;
    $nivel++;
    $exp_max = round($exp_max * 1.35);
    $subio_nivel = true;
}

$stmt = $conn->prepare("UPDATE usuarios SET exp=?, exp_max=?, nivel=? WHERE id=?");
$stmt->bind_param("iiii", $exp, $exp_max, $nivel, $usuario_id);
$stmt->execute();

echo json_encode([
    "exp" => $exp,
    "exp_max" => $exp_max,
    "nivel" => $nivel,
    "subio_nivel" => $subio_nivel
]);
