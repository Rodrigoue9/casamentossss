<?php
require_once 'config.php';
session_start();

$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true) ?? [];

$action = isset($_GET['action']) ? $_GET['action'] : ($data['action'] ?? '');

if ($action === 'login') {
    $password = $data['password'] ?? '';
    if ($password === $admin_password) {
        $_SESSION['admin_logged_in'] = true;
        echo json_encode(["success" => true, "message" => "Login realizado com sucesso!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Senha incorreta."]);
    }
    exit;
}

if ($action === 'logout') {
    $_SESSION['admin_logged_in'] = false;
    session_destroy();
    echo json_encode(["success" => true, "message" => "Logout realizado com sucesso!"]);
    exit;
}

// All other actions require active admin session
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Acesso nao autorizado."]);
    exit;
}

function slugify($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return empty($text) ? 'convidado' : $text;
}

try {
    if ($action === 'stats') {
        // Query database for stats
        $total = $pdo->query("SELECT COUNT(*) FROM convidados")->fetchColumn();
        $confirmados_sim = $pdo->query("SELECT COUNT(*) FROM convidados WHERE presenca = 1")->fetchColumn();
        $confirmados_nao = $pdo->query("SELECT COUNT(*) FROM convidados WHERE presenca = 0")->fetchColumn();
        $pendentes = $pdo->query("SELECT COUNT(*) FROM convidados WHERE presenca = -1")->fetchColumn();
        
        // Sum total people attending = sum(1 for each guest confirming yes) + sum(companions for each guest confirming yes)
        $total_pessoas = $pdo->query("SELECT SUM(1 + acompanhantes) FROM convidados WHERE presenca = 1")->fetchColumn() ?? 0;

        echo json_encode([
            "success" => true,
            "data" => [
                "total" => $total,
                "confirmados_sim" => $confirmados_sim,
                "confirmados_nao" => $confirmados_nao,
                "pendentes" => $pendentes,
                "total_pessoas" => $total_pessoas
            ]
        ]);
        exit;
    }

    if ($action === 'list') {
        $stmt = $pdo->query("SELECT id, nome, slug, acompanhantes_max, telefone, acompanhantes, mensagem, presenca, confirmed_at, created_at FROM convidados ORDER BY created_at DESC");
        $convidados = $stmt->fetchAll();
        echo json_encode(["success" => true, "data" => $convidados]);
        exit;
    }

    if ($action === 'add') {
        $nome = trim($data['nome'] ?? '');
        $acompanhantes_max = isset($data['acompanhantes_max']) ? (int)$data['acompanhantes_max'] : 0;

        if (empty($nome)) {
            echo json_encode(["success" => false, "message" => "O nome do convidado e obrigatorio."]);
            exit;
        }

        // Generate unique slug
        $base_slug = slugify($nome);
        $slug = $base_slug;
        
        $dup_stmt = $pdo->prepare("SELECT id FROM convidados WHERE slug = :slug");
        $i = 1;
        while (true) {
            $dup_stmt->execute(['slug' => $slug]);
            if (!$dup_stmt->fetch()) {
                break;
            }
            $slug = $base_slug . '-' . $i;
            $i++;
        }

        $stmt = $pdo->prepare("INSERT INTO convidados (nome, slug, acompanhantes_max, presenca) VALUES (:nome, :slug, :acompanhantes_max, -1)");
        $stmt->execute([
            'nome' => $nome,
            'slug' => $slug,
            'acompanhantes_max' => $acompanhantes_max
        ]);

        echo json_encode(["success" => true, "message" => "Convidado adicionado com sucesso!", "data" => ["slug" => $slug]]);
        exit;
    }

    if ($action === 'delete') {
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        if (!$id) {
            echo json_encode(["success" => false, "message" => "ID invalido."]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM convidados WHERE id = :id");
        $stmt->execute(['id' => $id]);
        
        echo json_encode(["success" => true, "message" => "Convidado excluido com sucesso."]);
        exit;
    }

    echo json_encode(["success" => false, "message" => "Acao desconhecida."]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erro no servidor: " . $e->getMessage()]);
}
