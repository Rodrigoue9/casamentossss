<?php
session_start();
require_once 'api/config.php';
header("Content-Type: text/html; charset=UTF-8");

$logged_in = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel de Convidados - Rodrigo & Gabrielle</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        serif: ['Playfair Display', 'serif'],
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #0c0813;
            color: #eae3f1;
        }
        .glassmorphism {
            background: rgba(25, 17, 39, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(223, 186, 83, 0.15);
        }
    </style>
</head>
<body class="font-sans antialiased min-h-screen">

    <?php if (!$logged_in): ?>
    <!-- LOGIN SCREEN -->
    <div class="flex items-center justify-center min-h-screen px-4">
        <div class="max-w-md w-full glassmorphism p-8 rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] text-center">
            <h1 class="font-serif text-3xl text-white font-light mb-2">Painel de Convidados</h1>
            <p class="text-xs text-[#d4c5e2]/60 uppercase tracking-widest font-semibold mb-6">Rodrigo & Gabrielle</p>
            
            <div id="login-error" class="hidden mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300"></div>

            <form id="login-form" class="space-y-4">
                <div class="text-left">
                    <label class="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold block mb-2">Senha de Acesso</label>
                    <input type="password" id="password" required class="w-full px-4 py-3 bg-[#0f0b18]/80 border border-[#dfba53]/25 focus:border-[#dfba53] rounded-xl text-sm text-white outline-none transition-colors">
                </div>
                <button type="submit" class="w-full py-3 rounded-xl bg-[#dfba53] text-[#0f0b18] text-xs uppercase tracking-widest font-bold hover:bg-[#dfba53]/85 transition-all duration-300">
                    Entrar no Painel
                </button>
            </form>
        </div>
    </div>

    <script>
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('login-error');
            errorDiv.classList.add('hidden');

            try {
                const response = await fetch('api/admin_api.php?action=login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                const result = await response.json();
                if (result.success) {
                    window.location.reload();
                } else {
                    errorDiv.innerText = result.message;
                    errorDiv.classList.remove('hidden');
                }
            } catch (err) {
                errorDiv.innerText = 'Erro de conexao.';
                errorDiv.classList.remove('hidden');
            }
        });
    </script>

    <?php else: ?>
    <!-- DASHBOARD PANEL -->
    <header class="border-b border-[#dfba53]/15 bg-[#140e21] py-4 px-6 md:px-12 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-3">
                <span class="font-serif text-2xl font-light text-[#dfba53]">R|G</span>
                <div class="h-6 w-[1px] bg-[#dfba53]/30"></div>
                <h1 class="text-sm font-semibold tracking-wide text-white hidden sm:block">Painel de Controle</h1>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-xs text-[#d4c5e2]/60 hidden md:block">Logado como Administrador</span>
                <button id="btn-logout" class="px-4 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs uppercase tracking-wider font-semibold hover:bg-red-950/20 transition-all">
                    Sair
                </button>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 md:px-12 py-8 space-y-8">
        <!-- TAB SELECTOR -->
        <div class="flex border-b border-[#dfba53]/15 gap-4 overflow-x-auto whitespace-nowrap">
            <button id="tab-guests" class="px-6 py-3 border-b-2 border-[#dfba53] text-[#dfba53] font-semibold text-sm transition-all focus:outline-none cursor-pointer">
                Gestão de Convidados
            </button>
            <button id="tab-finance" class="px-6 py-3 border-b-2 border-transparent text-[#d4c5e2]/60 hover:text-white font-semibold text-sm transition-all focus:outline-none cursor-pointer">
                Presentes & Finanças
            </button>
            <button id="tab-rsvp" class="px-6 py-3 border-b-2 border-transparent text-[#d4c5e2]/60 hover:text-white font-semibold text-sm transition-all focus:outline-none cursor-pointer">
                Respostas do RSVP
            </button>
        </div>

        <!-- TAB 1: GUESTS CONTENT -->
        <div id="content-guests" class="space-y-8">
            <!-- STATS BANNER -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div class="glassmorphism p-5 rounded-2xl text-center">
                    <span class="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 block mb-1">Total Convites</span>
                    <span id="stat-total" class="font-serif text-3xl text-white font-semibold">-</span>
                </div>
                <div class="glassmorphism p-5 rounded-2xl text-center border-l-4 border-l-emerald-500">
                    <span class="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 block mb-1">Confirmaram Sim</span>
                    <span id="stat-yes" class="font-serif text-3xl text-emerald-400 font-semibold">-</span>
                </div>
                <div class="glassmorphism p-5 rounded-2xl text-center border-l-4 border-l-rose-500">
                    <span class="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 block mb-1">Recusaram Não</span>
                    <span id="stat-no" class="font-serif text-3xl text-rose-400 font-semibold">-</span>
                </div>
                <div class="glassmorphism p-5 rounded-2xl text-center border-l-4 border-l-yellow-500">
                    <span class="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 block mb-1">Pendente</span>
                    <span id="stat-pending" class="font-serif text-3xl text-yellow-400 font-semibold">-</span>
                </div>
                <div class="glassmorphism p-5 rounded-2xl text-center bg-[#dfba53]/5 border-l-4 border-l-[#dfba53]">
                    <span class="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 block mb-1">Total Pessoas</span>
                    <span id="stat-people" class="font-serif text-3xl text-[#dfba53] font-semibold">-</span>
                </div>
            </div>

            <!-- ADD GUEST FORM -->
            <div class="glassmorphism p-6 rounded-2xl">
                <h2 class="font-serif text-xl text-white font-light mb-4">Adicionar Convidado</h2>
                <form id="add-form" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label class="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold block mb-2">Nome do Convidado / Família</label>
                        <input type="text" id="add-nome" required placeholder="Ex: Tio João e Família" class="w-full px-4 py-2.5 bg-[#0f0b18]/60 border border-[#dfba53]/15 focus:border-[#dfba53] rounded-xl text-sm text-white outline-none">
                    </div>
                    <div>
                        <label class="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold block mb-2">Acompanhantes Máx.</label>
                        <input type="number" id="add-max" min="0" default="0" placeholder="0" class="w-full px-4 py-2.5 bg-[#0f0b18]/60 border border-[#dfba53]/15 focus:border-[#dfba53] rounded-xl text-sm text-white outline-none">
                    </div>
                    <div>
                        <label class="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold block mb-2">Termo Religioso</label>
                        <select id="add-tratamento" class="w-full px-4 py-2.5 bg-[#0f0b18]/60 border border-[#dfba53]/15 focus:border-[#dfba53] rounded-xl text-sm text-[#eae3f1] outline-none">
                            <option value="Jeová">Jeová</option>
                            <option value="Deus">Deus</option>
                        </select>
                    </div>
                    <button type="submit" class="py-2.5 px-6 rounded-xl bg-[#dfba53] text-[#0f0b18] text-xs uppercase tracking-wider font-bold hover:bg-[#dfba53]/85 transition-all cursor-pointer">
                        Cadastrar e Gerar Link
                    </button>
                </form>

                <!-- Success Link Card -->
                <div id="link-card" class="hidden mt-4 p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span class="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">Convidado adicionado! Link gerado:</span>
                        <span id="generated-link-text" class="text-xs text-[#eae3f1] font-mono break-all"></span>
                    </div>
                    <div class="flex gap-2 shrink-0">
                        <button id="btn-copy-link" class="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wide hover:bg-emerald-500/20 cursor-pointer">
                            Copiar Link
                        </button>
                        <a id="btn-wa-link" target="_blank" class="px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold uppercase tracking-wide hover:bg-green-500 flex items-center justify-center cursor-pointer">
                            Enviar WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            <!-- LIST CONTAINER -->
            <div class="glassmorphism rounded-2xl overflow-hidden">
                <!-- Filter Bar -->
                <div class="p-4 border-b border-[#dfba53]/15 bg-[#140e21]/80 flex flex-col md:flex-row items-center justify-between gap-4">
                    <h3 class="font-serif text-lg text-white font-light">Lista de Convidados</h3>
                    <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <input type="text" id="search-input" placeholder="Buscar convidado..." class="px-4 py-2 bg-[#0f0b18]/60 border border-[#dfba53]/15 rounded-lg text-xs text-white outline-none w-full sm:w-60">
                        <select id="filter-select" class="px-4 py-2 bg-[#0f0b18]/60 border border-[#dfba53]/15 rounded-lg text-xs text-white outline-none">
                            <option value="all">Todos</option>
                            <option value="-1">Pendente</option>
                            <option value="1">Confirmado (Sim)</option>
                            <option value="0">Recusado (Não)</option>
                        </select>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr class="bg-[#140e21]/40 border-b border-[#dfba53]/10 uppercase text-[9px] tracking-wider text-[#d4c5e2]/60">
                                <th class="p-4">Nome</th>
                                <th class="p-4">Link Exclusivo</th>
                                <th class="p-4">Termo</th>
                                <th class="p-4">Status</th>
                                <th class="p-4 text-center">Acomp. Confirmados / Máx</th>
                                <th class="p-4">Telefone</th>
                                <th class="p-4">Mensagem</th>
                                <th class="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="guest-list-tbody" class="divide-y divide-[#dfba53]/5">
                            <!-- Filled dynamically -->
                            <tr>
                                <td colspan="8" class="p-8 text-center text-[#d4c5e2]/40">Carregando convidados...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- TAB 2: FINANCE CONTENT -->
        <div id="content-finance" class="hidden space-y-8">
            <!-- STATS BANNER (FINANCE) -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div class="glassmorphism p-5 rounded-2xl text-center border-l-4 border-l-[#dfba53]">
                    <span class="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 block mb-1">Total Recebido</span>
                    <span id="stat-finance-total" class="font-serif text-2xl text-white font-bold">R$ 0,00</span>
                </div>
                <div class="glassmorphism p-5 rounded-2xl text-center border-l-4 border-l-blue-500">
                    <span class="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 block mb-1">Cartão de Crédito</span>
                    <span id="stat-finance-card" class="font-serif text-2xl text-blue-400 font-bold">R$ 0,00</span>
                </div>
                <div class="glassmorphism p-5 rounded-2xl text-center border-l-4 border-l-teal-500">
                    <span class="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 block mb-1">Pix (Confirmados)</span>
                    <span id="stat-finance-pix" class="font-serif text-2xl text-teal-400 font-bold">R$ 0,00</span>
                </div>
                <div class="glassmorphism p-5 rounded-2xl text-center border-l-4 border-l-purple-500">
                    <span class="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 block mb-1">Total Doadores</span>
                    <span id="stat-finance-count" class="font-serif text-2xl text-purple-400 font-bold">0</span>
                </div>
                <div class="glassmorphism p-5 rounded-2xl text-center border-l-4 border-l-yellow-500">
                    <span class="text-[9px] uppercase tracking-wider text-[#d4c5e2]/60 block mb-1">Pix/Aguardando MP</span>
                    <span id="stat-finance-pending" class="font-serif text-2xl text-yellow-400 font-bold">R$ 0,00</span>
                </div>
            </div>

            <!-- CHARTS GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Donut Chart -->
                <div class="glassmorphism p-6 rounded-2xl flex flex-col items-center">
                    <h3 class="font-serif text-md text-white font-light mb-4 w-full text-left">Distribuição de Recebidos</h3>
                    <div class="relative w-full max-w-[280px]">
                        <canvas id="chart-donut"></canvas>
                    </div>
                </div>

                <!-- Line Chart -->
                <div class="glassmorphism p-6 rounded-2xl">
                    <h3 class="font-serif text-md text-white font-light mb-4">Evolução das Contribuições</h3>
                    <div class="h-64">
                        <canvas id="chart-line"></canvas>
                    </div>
                </div>
            </div>

            <!-- MANUAL PAYMENT & HISTORY GRID -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Manual payment form -->
                <div class="glassmorphism p-6 rounded-2xl md:col-span-1 h-fit">
                    <h3 class="font-serif text-lg text-white font-light mb-4">Registrar Pix Manual</h3>
                    <form id="payment-add-form" class="space-y-4">
                        <div>
                            <label class="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold block mb-2">Convidado Doador (Opcional)</label>
                            <select id="pay-convidado-id" class="w-full px-4 py-2.5 bg-[#0f0b18]/60 border border-[#dfba53]/15 focus:border-[#dfba53] rounded-xl text-sm text-[#eae3f1] outline-none">
                                <option value="">Anônimo / Por Fora</option>
                                <!-- Preenchido dinamicamente -->
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold block mb-2">Valor da Contribuição (R$)</label>
                            <input type="number" step="0.01" min="0.01" id="pay-valor" required placeholder="Ex: 150.00" class="w-full px-4 py-2.5 bg-[#0f0b18]/60 border border-[#dfba53]/15 focus:border-[#dfba53] rounded-xl text-sm text-white outline-none">
                        </div>
                        <div>
                            <label class="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold block mb-2">Método de Entrada</label>
                            <select id="pay-metodo" class="w-full px-4 py-2.5 bg-[#0f0b18]/60 border border-[#dfba53]/15 focus:border-[#dfba53] rounded-xl text-sm text-[#eae3f1] outline-none">
                                <option value="manual">Pix Direto (Chave CPF)</option>
                                <option value="pix_mp">Pix via Mercado Pago</option>
                                <option value="credit_card">Cartão de Crédito</option>
                            </select>
                        </div>
                        <button type="submit" class="w-full py-2.5 rounded-xl bg-[#dfba53] text-[#0f0b18] text-xs uppercase tracking-wider font-bold hover:bg-[#dfba53]/85 transition-all cursor-pointer">
                            Salvar Contribuição
                        </button>
                    </form>
                </div>

                <!-- Payments list -->
                <div class="glassmorphism rounded-2xl overflow-hidden md:col-span-2">
                    <div class="p-4 border-b border-[#dfba53]/15 bg-[#140e21]/80">
                        <h3 class="font-serif text-lg text-white font-light">Histórico de Contribuições</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr class="bg-[#140e21]/40 border-b border-[#dfba53]/10 uppercase text-[9px] tracking-wider text-[#d4c5e2]/60">
                                    <th class="p-4">Doador</th>
                                    <th class="p-4">Valor</th>
                                    <th class="p-4">Forma</th>
                                    <th class="p-4">ID Transação</th>
                                    <th class="p-4">Status</th>
                                    <th class="p-4">Data</th>
                                    <th class="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody id="payment-list-tbody" class="divide-y divide-[#dfba53]/5">
                                <tr>
                                    <td colspan="7" class="p-8 text-center text-[#d4c5e2]/40">Nenhuma contribuição registrada.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- TAB 3: RSVP RESPONSES CONTENT -->
        <div id="content-rsvp" class="hidden space-y-8">
            <div class="glassmorphism rounded-2xl overflow-hidden">
                <div class="p-4 border-b border-[#dfba53]/15 bg-[#140e21]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h3 class="font-serif text-lg text-white font-light">Respostas do RSVP</h3>
                    <span class="text-xs text-[#dfba53]/70 font-semibold" id="rsvp-responses-count">0 resposta(s)</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr class="bg-[#140e21]/40 border-b border-[#dfba53]/10 uppercase text-[9px] tracking-wider text-[#d4c5e2]/60">
                                <th class="p-4">Convidado</th>
                                <th class="p-4">Comparecimento</th>
                                <th class="p-4 text-center">Acompanhantes</th>
                                <th class="p-4">Telefone</th>
                                <th class="p-4">Mensagem aos Noivos</th>
                                <th class="p-4">Confirmado Em</th>
                            </tr>
                        </thead>
                        <tbody id="rsvp-list-tbody" class="divide-y divide-[#dfba53]/5">
                            <tr>
                                <td colspan="6" class="p-8 text-center text-[#d4c5e2]/40">Carregando respostas do RSVP...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>

    <script>
        let guests = [];
        const siteUrl = window.location.origin + window.location.pathname.replace('admin.php', '');

        // Tab switching
        const btnGuests = document.getElementById('tab-guests');
        const btnFinance = document.getElementById('tab-finance');
        const btnRsvp = document.getElementById('tab-rsvp');
        const contentGuests = document.getElementById('content-guests');
        const contentFinance = document.getElementById('content-finance');
        const contentRsvp = document.getElementById('content-rsvp');

        const renderRsvpResponses = () => {
            const tbody = document.getElementById('rsvp-list-tbody');
            tbody.innerHTML = '';
            
            // Filter guests that responded: presenca is 1 or 0
            const responded = guests.filter(g => g.presenca === 1 || g.presenca === 0);
            
            // Sort by confirmed_at DESC
            responded.sort((a, b) => new Date(b.confirmed_at) - new Date(a.confirmed_at));
            
            document.getElementById('rsvp-responses-count').innerText = `${responded.length} resposta(s)`;
            
            if (responded.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-[#d4c5e2]/40">Nenhuma confirmação de presença realizada ainda.</td></tr>`;
                return;
            }
            
            responded.forEach(g => {
                const statusBadge = g.presenca === 1 
                    ? `<span class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase text-[9px]">Sim, comparecerá</span>` 
                    : `<span class="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold uppercase text-[9px]">Não poderá ir</span>`;
                    
                const acompText = g.presenca === 1 
                    ? `<span class="font-semibold text-[#dfba53]">${g.acompanhantes}</span> <span class="opacity-60">/ ${g.acompanhantes_max}</span>` 
                    : '<span class="text-[#d4c5e2]/40">-</span>';
                    
                const dataFormatted = g.confirmed_at ? new Date(g.confirmed_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : '-';
                
                tbody.innerHTML += `
                    <tr class="hover:bg-[#191127]/30 transition-colors">
                        <td class="p-4 font-semibold text-white">${g.nome}</td>
                        <td class="p-4">${statusBadge}</td>
                        <td class="p-4 text-center">${acompText}</td>
                        <td class="p-4 font-mono text-[#d4c5e2]/80">${g.telefone || '-'}</td>
                        <td class="p-4 italic text-white" style="white-space: pre-line;">${g.mensagem || '-'}</td>
                        <td class="p-4 text-[#d4c5e2]/65">${dataFormatted}</td>
                    </tr>
                `;
            });
        };

        const selectTab = (tabName) => {
            const tabs = [
                { btn: btnGuests, content: contentGuests },
                { btn: btnFinance, content: contentFinance },
                { btn: btnRsvp, content: contentRsvp }
            ];
            tabs.forEach(tab => {
                if (tab.btn.id === `tab-${tabName}`) {
                    tab.btn.classList.add('border-[#dfba53]', 'text-[#dfba53]');
                    tab.btn.classList.remove('border-transparent', 'text-[#d4c5e2]/60');
                    tab.content.classList.remove('hidden');
                } else {
                    tab.btn.classList.add('border-transparent', 'text-[#d4c5e2]/60');
                    tab.btn.classList.remove('border-[#dfba53]', 'text-[#dfba53]');
                    tab.content.classList.add('hidden');
                }
            });
            
            if (tabName === 'finance') {
                loadFinanceData();
            } else if (tabName === 'rsvp') {
                renderRsvpResponses();
            }
        };

        btnGuests.addEventListener('click', () => selectTab('guests'));
        btnFinance.addEventListener('click', () => selectTab('finance'));
        btnRsvp.addEventListener('click', () => selectTab('rsvp'));

        // Fetch stats and lists
        const loadDashboardData = async () => {
            try {
                // Fetch Stats
                const statsRes = await fetch('api/admin_api.php?action=stats');
                const statsData = await statsRes.json();
                if (statsData.success) {
                    const s = statsData.data;
                    document.getElementById('stat-total').innerText = s.total;
                    document.getElementById('stat-yes').innerText = s.confirmados_sim;
                    document.getElementById('stat-no').innerText = s.confirmados_nao;
                    document.getElementById('stat-pending').innerText = s.pendentes;
                    document.getElementById('stat-people').innerText = s.total_pessoas;
                }

                // Fetch List
                const listRes = await fetch('api/admin_api.php?action=list');
                const listData = await listRes.json();
                if (listData.success) {
                    guests = listData.data;
                    renderGuests();
                    populateDoadorDropdown();
                }
            } catch (err) {
                console.error('Error loading dashboard:', err);
            }
        };

        const populateDoadorDropdown = () => {
            const dropdown = document.getElementById('pay-convidado-id');
            if (dropdown) {
                dropdown.innerHTML = '<option value="">Anônimo / Por Fora</option>';
                guests.forEach(g => {
                    dropdown.innerHTML += `<option value="${g.id}">${g.nome}</option>`;
                });
            }
        };

        // Render Guest Table
        const renderGuests = () => {
            const tbody = document.getElementById('guest-list-tbody');
            const search = document.getElementById('search-input').value.toLowerCase();
            const filter = document.getElementById('filter-select').value;
            
            tbody.innerHTML = '';

            const filtered = guests.filter(g => {
                const matchesSearch = g.nome.toLowerCase().includes(search);
                const matchesFilter = filter === 'all' || g.presenca.toString() === filter;
                return matchesSearch && matchesFilter;
            });

            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-[#d4c5e2]/40">Nenhum convidado encontrado.</td></tr>`;
                return;
            }

            filtered.forEach(g => {
                const link = `${siteUrl}?p=${g.slug}`;
                
                // Status badge
                let statusBadge = '';
                if (g.presenca === 1) {
                    statusBadge = `<span class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase text-[9px]">Confirmado</span>`;
                } else if (g.presenca === 0) {
                    statusBadge = `<span class="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold uppercase text-[9px]">Recusado</span>`;
                } else {
                    statusBadge = `<span class="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-semibold uppercase text-[9px]">Pendente</span>`;
                }

                // Companion column
                const compText = g.presenca === 1 
                    ? `<span class="font-semibold text-[#dfba53]">${g.acompanhantes}</span>` 
                    : '<span class="text-[#d4c5e2]/40">-</span>';

                // WhatsApp text
                const waText = `Olá ${g.nome}! Criamos um convite digital exclusivo para você e gostaríamos muito de confirmar sua presença. Acesse as informações do nosso casamento e confirme no link: ${link}`;
                const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

                tbody.innerHTML += `
                    <tr class="hover:bg-[#191127]/30 transition-colors">
                        <td class="p-4 font-semibold text-white">${g.nome}</td>
                        <td class="p-4">
                            <div class="flex items-center gap-1">
                                <span class="font-mono text-[10px] text-[#eae3f1]/60 break-all select-all">${link}</span>
                            </div>
                        </td>
                        <td class="p-4 font-semibold text-[#dfba53]">${g.tratamento}</td>
                        <td class="p-4">${statusBadge}</td>
                        <td class="p-4 text-center">${compText} / <span class="opacity-60">${g.acompanhantes_max}</span></td>
                        <td class="p-4 font-mono text-[#d4c5e2]/80">${g.telefone || '-'}</td>
                        <td class="p-4 max-w-xs truncate italic" title="${g.mensagem || ''}">${g.mensagem || '-'}</td>
                        <td class="p-4 text-right space-x-1 shrink-0">
                            <button onclick="copyToClipboard('${link}', this)" class="p-1 px-2 rounded bg-[#dfba53]/10 hover:bg-[#dfba53]/20 border border-[#dfba53]/20 text-[#dfba53] font-semibold text-[10px] cursor-pointer">Copiar</button>
                            <a href="${waUrl}" target="_blank" class="p-1 px-2 inline-block rounded bg-green-600/10 hover:bg-green-600/20 border border-green-500/30 text-green-400 font-semibold text-[10px] cursor-pointer">WhatsApp</a>
                            <button onclick="deleteGuest(${g.id})" class="p-1 px-2 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-[10px] cursor-pointer">Excluir</button>
                        </td>
                    </tr>
                `;
            });
        };

        // Copy Clipboard Helper
        const copyToClipboard = (text, btn) => {
            navigator.clipboard.writeText(text).then(() => {
                const orig = btn.innerText;
                btn.innerText = 'Copiado!';
                btn.classList.add('bg-emerald-500/20', 'text-emerald-400');
                setTimeout(() => {
                    btn.innerText = orig;
                    btn.classList.remove('bg-emerald-500/20', 'text-emerald-400');
                }, 1500);
            });
        };

        // Add Guest Handler
        document.getElementById('add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('add-nome').value;
            const acompanhantes_max = parseInt(document.getElementById('add-max').value) || 0;
            const tratamento = document.getElementById('add-tratamento').value;

            try {
                const response = await fetch('api/admin_api.php?action=add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, acompanhantes_max, tratamento })
                });
                const result = await response.json();
                if (result.success) {
                    const slug = result.data.slug;
                    const link = `${siteUrl}?p=${slug}`;
                    
                    document.getElementById('add-nome').value = '';
                    document.getElementById('add-max').value = '';

                    // Display card
                    document.getElementById('generated-link-text').innerText = link;
                    document.getElementById('btn-copy-link').onclick = (e) => copyToClipboard(link, e.target);
                    
                    const waText = `Olá ${nome}! Criamos um convite digital exclusivo para você e gostaríamos muito de confirmar sua presença. Acesse as informações do nosso casamento e confirme no link: ${link}`;
                    document.getElementById('btn-wa-link').href = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
                    document.getElementById('link-card').classList.remove('hidden');

                    loadDashboardData();
                }
            } catch (err) {
                console.error(err);
            }
        });

        // Delete Guest
        const deleteGuest = async (id) => {
            if (!confirm('Deseja realmente excluir este convidado? Toda a confirmacao de presenca tambem sera perdida.')) return;
            try {
                const response = await fetch('api/admin_api.php?action=delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                const result = await response.json();
                if (result.success) {
                    loadDashboardData();
                }
            } catch (err) {
                console.error(err);
            }
        };

        // Logout
        document.getElementById('btn-logout').addEventListener('click', async () => {
            await fetch('api/admin_api.php?action=logout', { method: 'POST' });
            window.location.reload();
        });

        // Search & Filter listeners
        document.getElementById('search-input').addEventListener('input', renderGuests);
        document.getElementById('filter-select').addEventListener('change', renderGuests);

        // FINANCE DASHBOARD LOGIC
        let donutChartInstance = null;
        let lineChartInstance = null;

        const loadFinanceData = async () => {
            try {
                // Fetch stats
                const statsRes = await fetch('api/admin_api.php?action=payment_stats');
                const statsData = await statsRes.json();
                if (statsData.success) {
                    const s = statsData.data;
                    document.getElementById('stat-finance-total').innerText = s.total_arrecadado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    document.getElementById('stat-finance-card').innerText = s.total_cartao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    document.getElementById('stat-finance-pix').innerText = s.total_pix.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    document.getElementById('stat-finance-count').innerText = s.doadores_count;
                    document.getElementById('stat-finance-pending').innerText = s.total_pendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                    // Donut chart
                    const values = [s.total_pix, s.total_cartao];
                    if (donutChartInstance) {
                        donutChartInstance.data.datasets[0].data = values;
                        donutChartInstance.update();
                    } else {
                        const ctxDonut = document.getElementById('chart-donut').getContext('2d');
                        donutChartInstance = new Chart(ctxDonut, {
                            type: 'doughnut',
                            data: {
                                labels: ['Pix (Direto ou MP)', 'Cartão de Crédito'],
                                datasets: [{
                                    data: values,
                                    backgroundColor: ['#14b8a6', '#3b82f6'],
                                    borderColor: '#0c0813',
                                    borderWidth: 2
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: { color: '#d4c5e2', font: { size: 10 } }
                                    }
                                }
                            }
                        });
                    }

                    // Line chart (Evolution)
                    const timelineLabels = s.arrecadacao_diaria.map(item => {
                        const parts = item.data.split('-');
                        return `${parts[2]}/${parts[1]}`;
                    });
                    const timelineValues = s.arrecadacao_diaria.map(item => parseFloat(item.total));

                    let accum = 0;
                    const timelineAccum = timelineValues.map(v => {
                        accum += v;
                        return accum;
                    });

                    if (lineChartInstance) {
                        lineChartInstance.data.labels = timelineLabels;
                        lineChartInstance.data.datasets[0].data = timelineAccum;
                        lineChartInstance.update();
                    } else {
                        const ctxLine = document.getElementById('chart-line').getContext('2d');
                        lineChartInstance = new Chart(ctxLine, {
                            type: 'line',
                            data: {
                                labels: timelineLabels,
                                datasets: [{
                                    label: 'Total Acumulado',
                                    data: timelineAccum,
                                    borderColor: '#dfba53',
                                    backgroundColor: 'rgba(223, 186, 83, 0.1)',
                                    fill: true,
                                    tension: 0.3,
                                    borderWidth: 2
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    x: { grid: { color: 'rgba(223, 186, 83, 0.05)' }, ticks: { color: '#d4c5e2', font: { size: 9 } } },
                                    y: { grid: { color: 'rgba(223, 186, 83, 0.05)' }, ticks: { color: '#d4c5e2', font: { size: 9 } } }
                                },
                                plugins: {
                                    legend: { display: false }
                                }
                            }
                        });
                    }
                }

                // Fetch list of payments
                const listRes = await fetch('api/admin_api.php?action=payment_list');
                const listData = await listRes.json();
                if (listData.success) {
                    renderPayments(listData.data);
                }
            } catch (err) {
                console.error(err);
            }
        };

        const renderPayments = (payments) => {
            const tbody = document.getElementById('payment-list-tbody');
            tbody.innerHTML = '';

            if (payments.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-[#d4c5e2]/40">Nenhuma contribuição registrada.</td></tr>`;
                return;
            }

            payments.forEach(p => {
                const doador = p.convidado_nome ? p.convidado_nome : '<span class="italic text-[#d4c5e2]/50">Anônimo / Por Fora</span>';
                const valorFormatted = p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                
                let statusBadge = '';
                if (p.status === 'approved') {
                    statusBadge = `<span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[8px] uppercase">Aprovado</span>`;
                } else if (p.status === 'pending') {
                    statusBadge = `<span class="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-semibold text-[8px] uppercase">Pendente</span>`;
                } else {
                    statusBadge = `<span class="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold text-[8px] uppercase">${p.status}</span>`;
                }

                let metodoText = '';
                if (p.metodo === 'credit_card') metodoText = 'Cartão de Crédito';
                else if (p.metodo === 'pix_mp') metodoText = 'Pix (Mercado Pago)';
                else if (p.metodo === 'pix_direto' || p.metodo === 'manual') metodoText = 'Pix Direto';
                else metodoText = p.metodo;

                const dataFormatted = new Date(p.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                tbody.innerHTML += `
                    <tr class="hover:bg-[#191127]/30 transition-colors">
                        <td class="p-4 font-semibold text-white">${doador}</td>
                        <td class="p-4 font-mono font-semibold text-[#dfba53]">${valorFormatted}</td>
                        <td class="p-4 text-[#eae3f1]/80">${metodoText}</td>
                        <td class="p-4 font-mono text-[10px] text-[#d4c5e2]/60">${p.mp_payment_id || '-'}</td>
                        <td class="p-4">${statusBadge}</td>
                        <td class="p-4 text-[#d4c5e2]/65">${dataFormatted}</td>
                        <td class="p-4 text-right">
                            <button onclick="deletePayment(${p.id})" class="p-1 px-2 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-[10px] cursor-pointer">Excluir</button>
                        </td>
                    </tr>
                `;
            });
        };

        // Add manual payment form submission
        document.getElementById('payment-add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const convidado_id = document.getElementById('pay-convidado-id').value;
            const valor = parseFloat(document.getElementById('pay-valor').value);
            const metodo = document.getElementById('pay-metodo').value;

            try {
                const response = await fetch('api/admin_api.php?action=payment_add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ convidado_id, valor, metodo })
                });
                const result = await response.json();
                if (result.success) {
                    document.getElementById('pay-valor').value = '';
                    document.getElementById('pay-convidado-id').value = '';
                    loadFinanceData();
                }
            } catch (err) {
                console.error(err);
            }
        });

        // Delete manual payment
        const deletePayment = async (id) => {
            if (!confirm('Deseja realmente excluir esta contribuição? Isso alterará os totais nos gráficos.')) return;
            try {
                const response = await fetch('api/admin_api.php?action=payment_delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                const result = await response.json();
                if (result.success) {
                    loadFinanceData();
                }
            } catch (err) {
                console.error(err);
            }
        };

        // Initial Load
        loadDashboardData();
    </script>
    <?php endif; ?>

</body>
</html>
