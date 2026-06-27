<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Metodo nao permitido."]);
    exit;
}

$slug = filter_input(INPUT_GET, 'slug', FILTER_DEFAULT);

if (empty($slug)) {
    echo json_encode(["success" => false, "message" => "Slug nao informado."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, nome, slug, acompanhantes_max, tratamento, presenca, acompanhantes, mensagem, telefone FROM convidados WHERE slug = :slug");
    $stmt->execute(['slug' => $slug]);
    $convidado = $stmt->fetch();

    if ($convidado) {
        echo json_encode([
            "success" => true,
            "data" => $convidado
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Convidado nao encontrado."
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Erro no banco de dados: " . $e->getMessage()
    ]);
}
