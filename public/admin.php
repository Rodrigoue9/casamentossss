<?php
session_start();
require_once 'api/config.php';

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
            <form id="add-form" class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label class="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold block mb-2">Nome do Convidado / Família</label>
                    <input type="text" id="add-nome" required placeholder="Ex: Tio João e Família" class="w-full px-4 py-2.5 bg-[#0f0b18]/60 border border-[#dfba53]/15 focus:border-[#dfba53] rounded-xl text-sm text-white outline-none">
                </div>
                <div>
                    <label class="text-[10px] uppercase tracking-wider text-[#d4c5e2]/70 font-semibold block mb-2">Acompanhantes Máx.</label>
                    <input type="number" id="add-max" min="0" default="0" placeholder="0" class="w-full px-4 py-2.5 bg-[#0f0b18]/60 border border-[#dfba53]/15 focus:border-[#dfba53] rounded-xl text-sm text-white outline-none">
                </div>
                <button type="submit" class="py-2.5 px-6 rounded-xl bg-[#dfba53] text-[#0f0b18] text-xs uppercase tracking-wider font-bold hover:bg-[#dfba53]/85 transition-all">
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
                    <button id="btn-copy-link" class="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wide hover:bg-emerald-500/20">
                        Copiar Link
                    </button>
                    <a id="btn-wa-link" target="_blank" class="px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold uppercase tracking-wide hover:bg-green-500 flex items-center justify-center">
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
                            <td colspan="7" class="p-8 text-center text-[#d4c5e2]/40">Carregando convidados...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <script>
        let guests = [];
        const siteUrl = window.location.origin + window.location.pathname.replace('admin.php', '');

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
                }
            } catch (err) {
                console.error('Error loading dashboard:', err);
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
                tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-[#d4c5e2]/40">Nenhum convidado encontrado.</td></tr>`;
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
                        <td class="p-4">${statusBadge}</td>
                        <td class="p-4 text-center">${compText} / <span class="opacity-60">${g.acompanhantes_max}</span></td>
                        <td class="p-4 font-mono text-[#d4c5e2]/80">${g.telefone || '-'}</td>
                        <td class="p-4 max-w-xs truncate italic" title="${g.mensagem || ''}">${g.mensagem || '-'}</td>
                        <td class="p-4 text-right space-x-1 shrink-0">
                            <button onclick="copyToClipboard('${link}', this)" class="p-1 px-2 rounded bg-[#dfba53]/10 hover:bg-[#dfba53]/20 border border-[#dfba53]/20 text-[#dfba53] font-semibold text-[10px]">Copiar</button>
                            <a href="${waUrl}" target="_blank" class="p-1 px-2 inline-block rounded bg-green-600/10 hover:bg-green-600/20 border border-green-500/30 text-green-400 font-semibold text-[10px]">WhatsApp</a>
                            <button onclick="deleteGuest(${g.id})" class="p-1 px-2 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-[10px]">Excluir</button>
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

            try {
                const response = await fetch('api/admin_api.php?action=add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, acompanhantes_max })
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

        // Initial Load
        loadDashboardData();
    </script>
    <?php endif; ?>

</body>
</html>
