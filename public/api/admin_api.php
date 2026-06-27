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
        $stmt = $pdo->query("SELECT id, nome, slug, acompanhantes_max, tratamento, telefone, acompanhantes, mensagem, presenca, confirmed_at, created_at FROM convidados ORDER BY created_at DESC");
        $convidados = $stmt->fetchAll();
        echo json_encode(["success" => true, "data" => $convidados]);
        exit;
    }

    if ($action === 'add') {
        $nome = trim($data['nome'] ?? '');
        $acompanhantes_max = isset($data['acompanhantes_max']) ? (int)$data['acompanhantes_max'] : 0;
        $tratamento = trim($data['tratamento'] ?? 'Jeová');

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

        $stmt = $pdo->prepare("INSERT INTO convidados (nome, slug, acompanhantes_max, tratamento, presenca) VALUES (:nome, :slug, :acompanhantes_max, :tratamento, -1)");
        $stmt->execute([
            'nome' => $nome,
            'slug' => $slug,
            'acompanhantes_max' => $acompanhantes_max,
            'tratamento' => $tratamento
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

    if ($action === 'payment_stats') {
        // Obter estatísticas financeiras consolidadas
        $total_arrecadado = $pdo->query("SELECT SUM(valor) FROM pagamentos WHERE status = 'approved'")->fetchColumn() ?? 0;
        $total_cartao = $pdo->query("SELECT SUM(valor) FROM pagamentos WHERE status = 'approved' AND metodo = 'credit_card'")->fetchColumn() ?? 0;
        $total_pix = $pdo->query("SELECT SUM(valor) FROM pagamentos WHERE status = 'approved' AND metodo IN ('pix_mp', 'pix_direto', 'manual')")->fetchColumn() ?? 0;
        $total_pendente = $pdo->query("SELECT SUM(valor) FROM pagamentos WHERE status = 'pending'")->fetchColumn() ?? 0;
        $doadores_count = $pdo->query("SELECT COUNT(*) FROM pagamentos WHERE status = 'approved'")->fetchColumn();
        
        // Obter distribuição por métodos
        $stmt_dist = $pdo->query("SELECT metodo, SUM(valor) as total, COUNT(*) as qtd FROM pagamentos WHERE status = 'approved' GROUP BY metodo");
        $metodos_dist = $stmt_dist->fetchAll();
        
        // Obter dados para o gráfico de evolução no tempo (últimos 30 dias com arrecadações)
        $stmt_chart = $pdo->query("SELECT DATE(created_at) as data, SUM(valor) as total FROM pagamentos WHERE status = 'approved' GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC LIMIT 30");
        $arrecadacao_diaria = $stmt_chart->fetchAll();

        echo json_encode([
            "success" => true,
            "data" => [
                "total_arrecadado" => floatval($total_arrecadado),
                "total_cartao" => floatval($total_cartao),
                "total_pix" => floatval($total_pix),
                "total_pendente" => floatval($total_pendente),
                "doadores_count" => intval($doadores_count),
                "metodos_dist" => $metodos_dist,
                "arrecadacao_diaria" => $arrecadacao_diaria
            ]
        ]);
        exit;
    }

    if ($action === 'payment_list') {
        $stmt = $pdo->query("SELECT p.id, p.convidado_id, c.nome as convidado_nome, p.valor, p.metodo, p.status, p.mp_payment_id, p.created_at FROM pagamentos p LEFT JOIN convidados c ON p.convidado_id = c.id ORDER BY p.created_at DESC");
        $pagamentos = $stmt->fetchAll();
        echo json_encode(["success" => true, "data" => $pagamentos]);
        exit;
    }

    if ($action === 'payment_add') {
        $convidado_id = isset($data['convidado_id']) && $data['convidado_id'] !== '' ? intval($data['convidado_id']) : null;
        $valor = isset($data['valor']) ? floatval($data['valor']) : 0;
        $metodo = trim($data['metodo'] ?? 'manual');

        if ($valor <= 0) {
            echo json_encode(["success" => false, "message" => "O valor do pagamento deve ser maior que zero."]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO pagamentos (convidado_id, valor, metodo, status) VALUES (?, ?, ?, 'approved')");
        $stmt->execute([$convidado_id, $valor, $metodo]);

        echo json_encode(["success" => true, "message" => "Contribuição registrada com sucesso!"]);
        exit;
    }

    if ($action === 'payment_delete') {
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        if (!$id) {
            echo json_encode(["success" => false, "message" => "ID inválido."]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM pagamentos WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(["success" => true, "message" => "Contribuição excluída com sucesso."]);
        exit;
    }

    echo json_encode(["success" => false, "message" => "Acao desconhecida."]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erro no servidor: " . $e->getMessage()]);
}
