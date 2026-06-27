<?php
// CORS Headers to allow requests from local dev server or static build
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$db_host = 'localhost';
$db_name = 'rodr6126_casamento';
$db_user = 'rodr6126_casamento';
$db_pass = '9Zo#,rg1Uo2E';

// Admin Configuration
$admin_password = 'rodrigogabrielle'; // Altere aqui para a senha do seu painel administrativo

// Mercado Pago Configuration
// Adicione seu Access Token de Produção ou Teste (ex: APP_USR-...)
$mercadopago_access_token = 'APP_USR-3577566475146705-081914-d2272071648705cd7f8bee3d708e022d-301020592'; 

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    error_log("Erro na conexao com o banco de dados: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Erro interno no servidor. Por favor, tente novamente mais tarde."
    ]);
    exit;
}
