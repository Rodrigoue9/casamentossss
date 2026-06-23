<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Metodo nao permitido."]);
    exit;
}

$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Dados invalidos."]);
    exit;
}

$nome = filter_var($data['nome'] ?? '', FILTER_DEFAULT);
$telefone = filter_var($data['telefone'] ?? '', FILTER_DEFAULT);
$acompanhantes = filter_var($data['acompanhantes'] ?? 0, FILTER_VALIDATE_INT);
$mensagem = filter_var($data['mensagem'] ?? '', FILTER_DEFAULT);
$presenca = isset($data['presenca']) ? (int)$data['presenca'] : 1;

if (empty($nome) || empty($telefone)) {
    echo json_encode(["success" => false, "message" => "Nome e telefone sao campos obrigatorios."]);
    exit;
}

if ($acompanhantes === false || $acompanhantes < 0) {
    $acompanhantes = 0;
}

try {
    // Check if entry already exists for same name & phone to update instead of insert duplicate
    $check_stmt = $pdo->prepare("SELECT id FROM convidados WHERE nome = :nome AND telefone = :telefone");
    $check_stmt->execute(['nome' => $nome, 'telefone' => $telefone]);
    $existing = $check_stmt->fetch();

    if ($existing) {
        $stmt = $pdo->prepare("UPDATE convidados SET acompanhantes = :acompanhantes, mensagem = :mensagem, presenca = :presenca, created_at = CURRENT_TIMESTAMP WHERE id = :id");
        $stmt->execute([
            'acompanhantes' => $acompanhantes,
            'mensagem' => $mensagem,
            'presenca' => $presenca,
            'id' => $existing['id']
        ]);
        echo json_encode(["success" => true, "message" => "Confirmacao atualizada com sucesso!"]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO convidados (nome, telefone, acompanhantes, mensagem, presenca) VALUES (:nome, :telefone, :acompanhantes, :mensagem, :presenca)");
        $stmt->execute([
            'nome' => $nome,
            'telefone' => $telefone,
            'acompanhantes' => $acompanhantes,
            'mensagem' => $mensagem,
            'presenca' => $presenca
        ]);
        echo json_encode(["success" => true, "message" => "Presenca confirmada com sucesso!"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erro ao salvar dados: " . $e->getMessage()]);
}
