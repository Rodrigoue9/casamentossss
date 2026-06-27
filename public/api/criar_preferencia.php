<?php
require_once 'config.php';

// Apenas aceita requisições POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Método não permitido. Utilize POST."
    ]);
    exit;
}

// Verifica se o token de acesso do Mercado Pago está configurado
if (empty($mercadopago_access_token)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error_type" => "token_not_configured",
        "message" => "O token de acesso do Mercado Pago não está configurado no arquivo config.php."
    ]);
    exit;
}

// Obtém o corpo da requisição JSON
$inputData = json_decode(file_get_contents('php://input'), true);
$amount = isset($inputData['valor']) ? floatval($inputData['valor']) : 0;
$guestId = isset($inputData['convidado_id']) ? intval($inputData['convidado_id']) : null;

if ($amount <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Valor de contribuição inválido. Deve ser maior que R$ 0,00."
    ]);
    exit;
}

// Constrói a URL base dinâmica para retornos do checkout (forçando HTTPS exigido pelo Mercado Pago)
$protocol = "https://";
$domainName = $_SERVER['HTTP_HOST'];
$basePath = str_replace("api/criar_preferencia.php", "", $_SERVER['SCRIPT_NAME']);
$baseUrl = $protocol . $domainName . $basePath;
$notificationUrl = $baseUrl . "api/webhook_mercadopago.php";

// Prepara o payload para a API do Mercado Pago
$payload = [
    "items" => [
        [
            "title" => "Presente de Casamento - Rodrigo & Gabrielle",
            "quantity" => 1,
            "unit_price" => $amount,
            "currency_id" => "BRL",
            "description" => "Contribuição para lista de presentes de casamento de Rodrigo & Gabrielle."
        ]
    ],
    "payment_methods" => [
        "excluded_payment_types" => [
            ["id" => "ticket"] // Exclui boleto bancário
        ],
        "installments" => 12 // Permite parcelamento em até 12x
    ],
    "back_urls" => [
        "success" => $baseUrl,
        "failure" => $baseUrl,
        "pending" => $baseUrl
    ],
    "auto_return" => "approved",
    "external_reference" => $guestId !== null ? strval($guestId) : "",
    "notification_url" => $notificationUrl
];

// Inicia cURL para chamada externa ao Mercado Pago
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.mercadopago.com/checkout/preferences');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $mercadopago_access_token
]);

// Executa a requisição
$response = curl_exec($ch);
$httpStatusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    $errorMsg = curl_error($ch);
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erro na comunicação com o Mercado Pago: " . $errorMsg
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// Decodifica a resposta da API do Mercado Pago
$responseData = json_decode($response, true);

if ($httpStatusCode === 200 || $httpStatusCode === 201) {
    echo json_encode([
        "success" => true,
        "init_point" => $responseData['init_point'], // URL para redirecionamento
        "sandbox_init_point" => $responseData['sandbox_init_point'] // URL de testes
    ]);
} else {
    $errorMessage = isset($responseData['message']) ? $responseData['message'] : 'Erro desconhecido ao criar preferência de pagamento.';
    http_response_code($httpStatusCode);
    echo json_encode([
        "success" => false,
        "message" => $errorMessage,
        "raw_response" => $responseData
    ]);
}
