<?php
require_once 'config.php';

// Mercado Pago Webhook / IPN Receiver
// Recebe as notificações de pagamento de forma assíncrona

// 1. Obtém os parâmetros da notificação
// O Mercado Pago pode enviar via parâmetros GET (ex: ?type=payment&data.id=ID) ou via corpo JSON
$paymentId = null;
$type = null;

// Tenta ler parâmetros do GET
if (isset($_GET['type']) && $_GET['type'] === 'payment' && isset($_GET['data_id'])) {
    $paymentId = $_GET['data_id'];
    $type = 'payment';
} elseif (isset($_GET['topic']) && $_GET['topic'] === 'payment' && isset($_GET['id'])) {
    // Legado IPN
    $paymentId = $_GET['id'];
    $type = 'payment';
}

// Se não encontrou no GET, tenta ler no corpo JSON (Webhook V2)
if (!$paymentId) {
    $body = json_decode(file_get_contents('php://input'), true);
    if (isset($body['type']) && $body['type'] === 'payment' && isset($body['data']['id'])) {
        $paymentId = $body['data']['id'];
        $type = 'payment';
    } elseif (isset($body['action']) && strpos($body['action'], 'payment') !== false && isset($body['data']['id'])) {
        $paymentId = $body['data']['id'];
        $type = 'payment';
    }
}

// Se não for uma notificação de pagamento válida, ignora e responde 200 (obrigatório para o Mercado Pago não reenviar)
if (!$paymentId || $type !== 'payment') {
    http_response_code(200);
    echo json_encode(["status" => "ignored", "message" => "Notificação recebida, mas não é do tipo pagamento."]);
    exit;
}

// 2. Consulta os detalhes do pagamento na API do Mercado Pago
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.mercadopago.com/v1/payments/' . $paymentId);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $mercadopago_access_token
]);

$response = curl_exec($ch);
$httpStatusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpStatusCode !== 200) {
    // Responde 500 para o Mercado Pago tentar novamente mais tarde
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro ao consultar o pagamento na API do Mercado Pago."]);
    exit;
}

$paymentData = json_decode($response, true);

// 3. Extrai as informações relevantes do pagamento
$valor = isset($paymentData['transaction_amount']) ? floatval($paymentData['transaction_amount']) : 0;
$status = isset($paymentData['status']) ? $paymentData['status'] : 'pending'; // approved, pending, in_process, rejected, cancelled, refunded
$metodoId = isset($paymentData['payment_method_id']) ? $paymentData['payment_method_id'] : '';
$paymentType = isset($paymentData['payment_type_id']) ? $paymentData['payment_type_id'] : ''; // credit_card, ticket, bank_transfer (pix)

// Mapeia método para o nosso banco
$metodo = 'manual';
if ($paymentType === 'bank_transfer' || $metodoId === 'pix') {
    $metodo = 'pix_mp';
} elseif ($paymentType === 'credit_card') {
    $metodo = 'credit_card';
} else {
    $metodo = $metodoId ? $metodoId : 'mercado_pago';
}

// Identifica o convidado pelo external_reference (ID do convidado)
$convidadoId = null;
if (!empty($paymentData['external_reference'])) {
    $convidadoId = intval($paymentData['external_reference']);
}

// 4. Salva ou atualiza os dados na nossa tabela `pagamentos`
try {
    // Verifica se já existe um registro para esse mp_payment_id
    $stmt = $pdo->prepare("SELECT id FROM pagamentos WHERE mp_payment_id = ?");
    $stmt->execute([$paymentId]);
    $pagamentoExistente = $stmt->fetch();

    if ($pagamentoExistente) {
        // Se já existe, atualiza o status (importante para capturar quando passa de pending para approved)
        $stmtUpdate = $pdo->prepare("UPDATE pagamentos SET status = ?, valor = ? WHERE mp_payment_id = ?");
        $stmtUpdate->execute([$status, $valor, $paymentId]);
        
        echo json_encode(["success" => true, "action" => "updated", "payment_id" => $paymentId]);
    } else {
        // Se não existe, insere o novo pagamento
        $stmtInsert = $pdo->prepare("INSERT INTO pagamentos (convidado_id, valor, metodo, status, mp_payment_id) VALUES (?, ?, ?, ?, ?)");
        $stmtInsert->execute([$convidadoId, $valor, $metodo, $status, $paymentId]);
        
        echo json_encode(["success" => true, "action" => "inserted", "payment_id" => $paymentId]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro ao salvar no banco de dados: " . $e->getMessage()]);
    exit;
}
