// ===================================
// COMPONENTS - UI Modules
// ===================================

const { Toast, Loading, formatCurrency, formatDate, formatDateTime, validateEmail, validateCPF, validateCNPJ, formatCPFCNPJ, formatPhone, formatCEP } = window.Utils;
const { getClientes, adicionarCliente, atualizarCliente, excluirCliente, getProdutos, adicionarProduto, atualizarProduto, excluirProduto, getVendas, adicionarVenda } = window.API;

// ===================================
// DASHBOARD MODULE
// ===================================
async function renderDashboard() {
    Loading.show();
    
    try {
        const [clientes, produtos, vendas] = await Promise.all([
            getClientes(),
            getProdutos(),
            getVendas()
        ]);

        const totalVendas = vendas.reduce((sum, v) => sum + v.total, 0);

        return `
            <div class="fade-in">
                <div class="card-header" style="margin-bottom: 2rem;">
                    <h1 class="card-title" style="font-size: 2rem;">Dashboard</h1>
                </div>

                <div class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3" style="gap: 1.5rem; margin-bottom: 2rem;">
                    <div class="stat-card">
                        <div class="stat-card-icon primary">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <div class="stat-card-value">${clientes.length}</div>
                        <div class="stat-card-label">Total de Clientes</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-icon success">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                <path d="M20 7h-9M14 17H5M15 12H5"/>
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                            </svg>
                        </div>
                        <div class="stat-card-value">${produtos.length}</div>
                        <div class="stat-card-label">Total de Produtos</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-icon warning">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                <circle cx="9" cy="21" r="1"/>
                                <circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                        </div>
                        <div class="stat-card-value">${vendas.length}</div>
                        <div class="stat-card-label">Total de Vendas</div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Resumo Financeiro</h2>
                    </div>
                    <div class="card-body">
                        <div style="font-size: 2.5rem; font-weight: 700; color: var(--color-success); margin-bottom: 0.5rem;">
                            ${formatCurrency(totalVendas)}
                        </div>
                        <p style="color: var(--color-text-tertiary);">Total em vendas</p>
                    </div>
                </div>

                ${vendas.length > 0 ? `
                    <div class="card" style="margin-top: 2rem;">
                        <div class="card-header">
                            <h2 class="card-title">Últimas Vendas</h2>
                        </div>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Total</th>
                                        <th>Pagamento</th>
                                        <th class="hide-mobile">Data</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${vendas.slice(0, 5).map(venda => `
                                        <tr>
                                            <td>${venda.cliente.nome}</td>
                                            <td style="font-weight: 600; color: var(--color-success);">${formatCurrency(venda.total)}</td>
                                            <td>
                                                ${venda.pagamento.tipo === 'avista' ? 'À Vista' : 
                                                  venda.pagamento.tipo === 'pix' ? 'PIX' : 
                                                  `Cartão ${venda.pagamento.parcelas}x`}
                                            </td>
                                            <td class="hide-mobile">${formatDateTime(venda.dataVenda)}</td>
                                            <td>
                                                <span class="badge badge-success">${venda.status}</span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        return '<div class="empty-state"><p>Erro ao carregar dashboard</p></div>';
    } finally {
        Loading.hide();
    }
}

// ===================================
// CLIENTES MODULE
// ===================================
async function renderClientes() {
    Loading.show();
    
    try {
        const clientes = await getClientes();

        const html = `
            <div class="fade-in">
                <div class="card-header" style="margin-bottom: 2rem;">
                    <h1 class="card-title" style="font-size: 2rem;">Gestão de Clientes</h1>
                    <button class="btn btn-primary" onclick="openClienteModal()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Novo Cliente
                    </button>
                </div>

                <div class="card" style="margin-bottom: 1.5rem;">
                    <div class="search-bar">
                        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input type="text" class="search-input" id="searchClientes" placeholder="Buscar clientes..." />
                    </div>
                </div>

                ${clientes.length > 0 ? `
                    <div class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3" id="clientesGrid">
                        ${renderClientesList(clientes)}
                    </div>
                ` : `
                    <div class="empty-state">
                        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <h3 class="empty-state-title">Nenhum cliente cadastrado</h3>
                        <p class="empty-state-description">Comece adicionando seu primeiro cliente</p>
                        <button class="btn btn-primary" onclick="openClienteModal()">Adicionar Cliente</button>
                    </div>
                `}
            </div>
        `;

        return html;
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        return '<div class="empty-state"><p>Erro ao carregar clientes</p></div>';
    } finally {
        Loading.hide();
    }
}

function renderClientesList(clientes) {
    return clientes.map(cliente => `
        <div class="card" data-cliente-id="${cliente.id}">
            <div class="card-header">
                <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--color-text-primary);">${cliente.nome}</h3>
            </div>
            <div class="card-body" style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span style="font-size: 0.875rem;">${cliente.email}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span style="font-size: 0.875rem;">${formatPhone(cliente.telefone)}</span>
                </div>
                ${cliente.cidade ? `
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span style="font-size: 0.875rem;">${cliente.cidade}, ${cliente.estado}</span>
                    </div>
                ` : ''}
            </div>
            <div class="card-footer">
                <button class="btn btn-sm btn-secondary" onclick="editarCliente('${cliente.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmarExclusaoCliente('${cliente.id}', '${cliente.nome}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Excluir
                </button>
            </div>
        </div>
    `).join('');
}

// Continua...

// ===================================
// PRODUTOS MODULE
// ===================================
async function renderProdutos() {
    Loading.show();
    
    try {
        const produtos = await getProdutos();

        const html = `
            <div class="fade-in">
                <div class="card-header" style="margin-bottom: 2rem;">
                    <h1 class="card-title" style="font-size: 2rem;">Gestão de Produtos</h1>
                    <button class="btn btn-primary" onclick="openProdutoModal()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Novo Produto
                    </button>
                </div>

                <div class="card" style="margin-bottom: 1.5rem;">
                    <div class="search-bar">
                        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input type="text" class="search-input" id="searchProdutos" placeholder="Buscar produtos..." />
                    </div>
                </div>

                ${produtos.length > 0 ? `
                    <div class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3 grid-cols-lg-4" id="produtosGrid">
                        ${renderProdutosList(produtos)}
                    </div>
                ` : `
                    <div class="empty-state">
                        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 7h-9M14 17H5M15 12H5"/>
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                        </svg>
                        <h3 class="empty-state-title">Nenhum produto cadastrado</h3>
                        <p class="empty-state-description">Comece adicionando seu primeiro produto</p>
                        <button class="btn btn-primary" onclick="openProdutoModal()">Adicionar Produto</button>
                    </div>
                `}
            </div>
        `;

        return html;
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        return '<div class="empty-state"><p>Erro ao carregar produtos</p></div>';
    } finally {
        Loading.hide();
    }
}

function renderProdutosList(produtos) {
    return produtos.map(produto => {
        const estoqueClass = produto.estoque === 0 ? 'badge-error' : produto.estoque < 10 ? 'badge-warning' : 'badge-success';
        const estoqueText = produto.estoque === 0 ? 'SEM ESTOQUE' : `${produto.estoque} unid.`;
        
        return `
            <div class="card" data-produto-id="${produto.id}">
                ${produto.foto ? `
                    <div style="width: 100%; height: 160px; overflow: hidden; border-radius: 0.75rem 0.75rem 0 0; margin: -1.5rem -1.5rem 1rem -1.5rem;">
                        <img src="${produto.foto}" alt="${produto.nome}" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                ` : `
                    <div style="width: 100%; height: 160px; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); border-radius: 0.75rem 0.75rem 0 0; margin: -1.5rem -1.5rem 1rem -1.5rem; display: flex; align-items: center; justify-content: center;">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                    </div>
                `}
                <div class="card-header">
                    <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--color-text-primary);">${produto.nome}</h3>
                    <span class="badge ${estoqueClass}">${estoqueText}</span>
                </div>
                <div class="card-body">
                    ${produto.descricao ? `<p style="font-size: 0.875rem; color: var(--color-text-tertiary); margin-bottom: 1rem;">${produto.descricao}</p>` : ''}
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">
                            ${formatCurrency(produto.preco)}
                        </div>
                        ${produto.categoria ? `
                            <div style="display: inline-flex; align-items: center; gap: 0.5rem;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                                </svg>
                                <span style="font-size: 0.75rem; color: var(--color-text-tertiary);">${produto.categoria}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-secondary" onclick="editarProduto('${produto.id}')" ${produto.estoque === 0 ? '' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmarExclusaoProduto('${produto.id}', '${produto.nome}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Excluir
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ===================================
// VENDAS MODULE
// ===================================
let carrinhoAtual = [];
let clienteSelecionado = null;

async function renderVendas() {
    Loading.show();
    
    try {
        const [produtos, clientes, vendas] = await Promise.all([
            getProdutos(),
            getClientes(),
            getVendas()
        ]);

        // Guardar dados globalmente para uso posterior
        window.produtosDisponiveis = produtos;
        window.clientesDisponiveis = clientes;

        const html = `
            <div class="fade-in">
                <div class="card-header" style="margin-bottom: 2rem;">
                    <h1 class="card-title" style="font-size: 2rem;">Nova Venda</h1>
                    <button class="btn btn-primary" id="btnVerCarrinho" onclick="verCarrinho()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        Carrinho (<span id="carrinhoCount">0</span>)
                    </button>
                </div>

                <div class="card" style="margin-bottom: 1.5rem;">
                    <div class="card-header">
                        <h2 class="card-title">Selecionar Cliente</h2>
                    </div>
                    <div class="card-body">
                        <select class="form-select" id="selectCliente" onchange="selecionarCliente(this.value)">
                            <option value="">Escolha um cliente...</option>
                            ${clientes.map(c => `<option value="${c.id}">${c.nome} - ${c.email}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 1.5rem;">
                    <div class="card-header">
                        <h2 class="card-title">Produtos Disponíveis</h2>
                    </div>
                    <div class="search-bar" style="padding: 0 1.5rem 1.5rem;">
                        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input type="text" class="search-input" id="searchProdutosVenda" placeholder="Buscar produtos..." />
                    </div>
                    <div class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3" id="produtosVendaGrid" style="padding: 0 1.5rem 1.5rem;">
                        ${renderProdutosVenda(produtos)}
                    </div>
                </div>

                ${vendas.length > 0 ? `
                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title">Histórico de Vendas</h2>
                        </div>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Itens</th>
                                        <th>Total</th>
                                        <th>Pagamento</th>
                                        <th class="hide-mobile">Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${vendas.map(venda => `
                                        <tr>
                                            <td>${venda.cliente.nome}</td>
                                            <td>${venda.itens.length} item(ns)</td>
                                            <td style="font-weight: 600; color: var(--color-success);">${formatCurrency(venda.total)}</td>
                                            <td>
                                                ${venda.pagamento.tipo === 'avista' ? 'À Vista' : 
                                                  venda.pagamento.tipo === 'pix' ? 'PIX' : 
                                                  `Cartão ${venda.pagamento.parcelas}x`}
                                            </td>
                                            <td class="hide-mobile">${formatDateTime(venda.dataVenda)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        return html;
    } catch (error) {
        console.error('Erro ao carregar vendas:', error);
        return '<div class="empty-state"><p>Erro ao carregar vendas</p></div>';
    } finally {
        Loading.hide();
    }
}

function renderProdutosVenda(produtos) {
    return produtos.map(produto => {
        const estoqueDisponivel = produto.estoque > 0;
        
        return `
            <div class="card" style="opacity: ${estoqueDisponivel ? 1 : 0.6};">
                ${produto.foto ? `
                    <div style="width: 100%; height: 120px; overflow: hidden; border-radius: 0.75rem 0.75rem 0 0; margin: -1.5rem -1.5rem 1rem -1.5rem;">
                        <img src="${produto.foto}" alt="${produto.nome}" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                ` : ''}
                <div class="card-body">
                    <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem;">${produto.nome}</h3>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.5rem;">
                        ${formatCurrency(produto.preco)}
                    </div>
                    <p style="font-size: 0.75rem; color: var(--color-text-tertiary);">
                        Estoque: ${produto.estoque} unid.
                    </p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-success" 
                            onclick="adicionarAoCarrinho('${produto.id}')"
                            ${!estoqueDisponivel ? 'disabled' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        ${estoqueDisponivel ? 'Adicionar' : 'Sem Estoque'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Export components
window.Components = {
    renderDashboard,
    renderClientes,
    renderProdutos,
    renderVendas,
    renderClientesList,
    renderProdutosList,
    renderProdutosVenda
};
