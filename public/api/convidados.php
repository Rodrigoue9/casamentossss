<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM convidados ORDER BY nome ASC");
        $convidados = $stmt->fetchAll();
        echo json_encode(["success" => true, "data" => $convidados]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Erro ao buscar dados: " . $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    $raw_input = file_get_contents('php://input');
    $data = json_decode($raw_input, true);

    if (!$data || !isset($data['action'])) {
        echo json_encode(["success" => false, "message" => "Acao nao informada."]);
        exit;
    }

    $action = $data['action'];

    if ($action === 'delete') {
        $id = filter_var($data['id'] ?? 0, FILTER_VALIDATE_INT);
        if (!$id) {
            echo json_encode(["success" => false, "message" => "ID invalido."]);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM convidados WHERE id = :id");
            $stmt->execute(['id' => $id]);
            echo json_encode(["success" => true, "message" => "Convidado excluido com sucesso."]);
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => "Erro ao excluir: " . $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'update') {
        $id = filter_var($data['id'] ?? 0, FILTER_VALIDATE_INT);
        $nome = filter_var($data['nome'] ?? '', FILTER_DEFAULT);
        $telefone = filter_var($data['telefone'] ?? '', FILTER_DEFAULT);
        $acompanhantes = filter_var($data['acompanhantes'] ?? 0, FILTER_VALIDATE_INT);
        $mensagem = filter_var($data['mensagem'] ?? '', FILTER_DEFAULT);
        $presenca = isset($data['presenca']) ? (int)$data['presenca'] : 1;

        if (!$id || empty($nome) || empty($telefone)) {
            echo json_encode(["success" => false, "message" => "Dados incompletos para atualizacao."]);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE convidados SET nome = :nome, telefone = :telefone, acompanhantes = :acompanhantes, mensagem = :mensagem, presenca = :presenca WHERE id = :id");
            $stmt->execute([
                'id' => $id,
                'nome' => $nome,
                'telefone' => $telefone,
                'acompanhantes' => $acompanhantes,
                'mensagem' => $mensagem,
                'presenca' => $presenca
            ]);
            echo json_encode(["success" => true, "message" => "Convidado atualizado com sucesso."]);
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => "Erro ao atualizar: " . $e->getMessage()]);
        }
        exit;
    }
}
