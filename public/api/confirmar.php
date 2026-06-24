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

$id = isset($data['id']) ? (int)$data['id'] : null;
$nome = filter_var($data['nome'] ?? '', FILTER_DEFAULT);
$telefone = filter_var($data['telefone'] ?? '', FILTER_DEFAULT);
$acompanhantes = filter_var($data['acompanhantes'] ?? 0, FILTER_VALIDATE_INT);
$mensagem = filter_var($data['mensagem'] ?? '', FILTER_DEFAULT);
$presenca = isset($data['presenca']) ? (int)$data['presenca'] : 1;

if ($acompanhantes === false || $acompanhantes < 0) {
    $acompanhantes = 0;
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
    if ($id) {
        // 1. DYNAMIC RSVP: Update existing pre-registered guest
        // Let's check if the guest exists
        $stmt = $pdo->prepare("SELECT id, acompanhantes_max FROM convidados WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $guest = $stmt->fetch();

        if (!$guest) {
            echo json_encode(["success" => false, "message" => "Convidado nao encontrado."]);
            exit;
        }

        // Cap companions to guest's max companions allowed
        if ($acompanhantes > $guest['acompanhantes_max']) {
            $acompanhantes = $guest['acompanhantes_max'];
        }

        $update_stmt = $pdo->prepare("UPDATE convidados SET 
            telefone = :telefone, 
            acompanhantes = :acompanhantes, 
            mensagem = :mensagem, 
            presenca = :presenca, 
            confirmed_at = CURRENT_TIMESTAMP 
            WHERE id = :id");
        
        $update_stmt->execute([
            'telefone' => $telefone,
            'acompanhantes' => $acompanhantes,
            'mensagem' => $mensagem,
            'presenca' => $presenca,
            'id' => $id
        ]);

        echo json_encode(["success" => true, "message" => "Presenca registrada com sucesso!"]);
        exit;
    } else {
        // 2. FALLBACK MANUAL RSVP: Insert/Update using Name/Phone (no pre-registration link used)
        if (empty($nome) || empty($telefone)) {
            echo json_encode(["success" => false, "message" => "Nome e telefone sao obrigatorios."]);
            exit;
        }

        // Check if there is already a manual/pre-existing guest with the same name & phone
        $check_stmt = $pdo->prepare("SELECT id FROM convidados WHERE nome = :nome AND telefone = :telefone");
        $check_stmt->execute(['nome' => $nome, 'telefone' => $telefone]);
        $existing = $check_stmt->fetch();

        if ($existing) {
            $update_stmt = $pdo->prepare("UPDATE convidados SET 
                acompanhantes = :acompanhantes, 
                mensagem = :mensagem, 
                presenca = :presenca, 
                confirmed_at = CURRENT_TIMESTAMP 
                WHERE id = :id");
            
            $update_stmt->execute([
                'acompanhantes' => $acompanhantes,
                'mensagem' => $mensagem,
                'presenca' => $presenca,
                'id' => $existing['id']
            ]);

            echo json_encode(["success" => true, "message" => "Confirmacao atualizada com sucesso!"]);
            exit;
        } else {
            // Generate unique slug
            $base_slug = slugify($nome);
            $slug = $base_slug;
            
            // Loop to ensure uniqueness of slug
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

            $insert_stmt = $pdo->prepare("INSERT INTO convidados 
                (nome, slug, acompanhantes_max, telefone, acompanhantes, mensagem, presenca, confirmed_at) 
                VALUES 
                (:nome, :slug, :acompanhantes_max, :telefone, :acompanhantes, :mensagem, :presenca, CURRENT_TIMESTAMP)");
            
            $insert_stmt->execute([
                'nome' => $nome,
                'slug' => $slug,
                'acompanhantes_max' => $acompanhantes, // Max equals what they confirmed
                'telefone' => $telefone,
                'acompanhantes' => $acompanhantes,
                'mensagem' => $mensagem,
                'presenca' => $presenca
            ]);

            echo json_encode(["success" => true, "message" => "Presenca registrada com sucesso!"]);
            exit;
        }
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erro ao processar confirmacao: " . $e->getMessage()]);
}
