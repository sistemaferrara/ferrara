// ===================================
// APP MAIN - Application Logic
// ===================================

// As funções são globais, não é necessário desestruturar de window.Utils se utils.js for carregado antes.
// 
// As funções são globais, não é necessário desestruturar de window.Components se components.js for carregado antes.
// 

// State
let currentModule = 'dashboard';
let editingClienteId = null;
let editingProdutoId = null;

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', async function() {
    initializeApp();
});

async function initializeApp() {
    // Setup navigation
    setupNavigation();
    
    // Setup sidebar toggle
    setupSidebarToggle();
    
    // Load initial module
    await navigateTo('dashboard');
}

// ===================================
// NAVIGATION
// ===================================
function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const module = item.dataset.module;
            await navigateTo(module);
            
            // Close sidebar on mobile
            if (window.innerWidth < 1024) {
                closeSidebar();
            }
        });
    });
}

async function navigateTo(module) {
    currentModule = module;
    
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.module === module) {
            item.classList.add('active');
        }
    });
    
    // Render module content
    const mainContent = document.getElementById('mainContent');
    let html = '';
    
    switch(module) {
        case 'dashboard':
            html = await window.Components.renderDashboard();
            break;
        case 'clientes':
            html = await window.Components.renderClientes();
            setupClientesSearch();
            break;
        case 'produtos':
            html = await window.Components.renderProdutos();
            setupProdutosSearch();
            break;
        case 'vendas':
            html = await window.Components.renderVendas();
            setupProdutosVendaSearch();
            break;
        default:
            html = await window.Components.renderDashboard();
    }
    
    mainContent.innerHTML = html;
    mainContent.scrollTop = 0;
}

// ===================================
// SIDEBAR
// ===================================
function setupSidebarToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarClose = document.getElementById('sidebarClose');
    
    menuToggle.addEventListener('click', openSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    sidebarClose.addEventListener('click', closeSidebar);
}

function openSidebar() {
    document.getElementById('sidebar').classList.add('active');
    document.getElementById('sidebarOverlay').classList.add('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

// ===================================
// CLIENTES FUNCTIONS
// ===================================
function setupClientesSearch() {
    const searchInput = document.getElementById('searchClientes');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', window.Utils.debounce(async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const clientes = await API.getClientes();
        const filtered = clientes.filter(c => 
            c.nome.toLowerCase().includes(searchTerm) ||
            c.email.toLowerCase().includes(searchTerm) ||
            c.telefone.includes(searchTerm)
        );
        
        const grid = document.getElementById('clientesGrid');
        if (grid) {
            grid.innerHTML = window.Components.renderClientesList(filtered);
        }
    }, 300));
}

function openClienteModal(clienteId = null) {
    editingClienteId = clienteId;
    
    const modal = window.Components.createModal('clienteModal', clienteId ? 'Editar Cliente' : 'Novo Cliente', `
        <form id="clienteForm">
            <div class="form-group">
                <label class="form-label">Nome *</label>
                <input type="text" class="form-input" id="clienteNome" required />
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-input" id="clienteEmail" required />
                </div>
                <div class="form-group">
                    <label class="form-label">Telefone *</label>
                    <input type="tel" class="form-input" id="clienteTelefone" required />
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">CPF/CNPJ</label>
                <input type="text" class="form-input" id="clienteCpfCnpj" />
            </div>
            
            <div class="form-group">
                <label class="form-label">Endereço</label>
                <input type="text" class="form-input" id="clienteEndereco" />
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Cidade</label>
                    <input type="text" class="form-input" id="clienteCidade" />
                </div>
                <div class="form-group">
                    <label class="form-label">Estado</label>
                    <input type="text" class="form-input" id="clienteEstado" maxlength="2" />
                </div>
                <div class="form-group">
                    <label class="form-label">CEP</label>
                    <input type="text" class="form-input" id="clienteCep" />
                </div>
            </div>
        </form>
    `, {
        confirmText: clienteId ? 'Atualizar' : 'Adicionar',
        onConfirm: salvarCliente
    });
    
    // Se estiver editando, preencher formulário
    if (clienteId) {
        preencherFormularioCliente(clienteId);
    }
    
    // Add input masks
    setupInputMasks();
}

async function preencherFormularioCliente(clienteId) {
    const clientes = await API.getClientes();
    const cliente = clientes.find(c => c.id === clienteId);
    
    if (cliente) {
        document.getElementById('clienteNome').value = cliente.nome;
        document.getElementById('clienteEmail').value = cliente.email;
        document.getElementById('clienteTelefone').value = cliente.telefone;
        document.getElementById('clienteCpfCnpj').value = cliente.cpfCnpj || '';
        document.getElementById('clienteEndereco').value = cliente.endereco || '';
        document.getElementById('clienteCidade').value = cliente.cidade || '';
        document.getElementById('clienteEstado').value = cliente.estado || '';
        document.getElementById('clienteCep').value = cliente.cep || '';
    }
}

async function salvarCliente() {
    const form = document.getElementById('clienteForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    
    const cliente = {
        nome: document.getElementById('clienteNome').value,
        email: document.getElementById('clienteEmail').value,
        telefone: document.getElementById('clienteTelefone').value,
        cpfCnpj: document.getElementById('clienteCpfCnpj').value,
        endereco: document.getElementById('clienteEndereco').value,
        cidade: document.getElementById('clienteCidade').value,
        estado: document.getElementById('clienteEstado').value.toUpperCase(),
        cep: document.getElementById('clienteCep').value,
    };
    
    // Validations
    if (!window.Utils.validateEmail(cliente.email)) {
        window.Utils.Toast.error('Email inválido');
        return false;
    }
    
    if (cliente.cpfCnpj) {
        const cleanCpfCnpj = cliente.cpfCnpj.replace(/[^\d]/g, '');
        if (cleanCpfCnpj.length === 11 && !window.Utils.validateCPF(cleanCpfCnpj)) {
            window.Utils.Toast.error('CPF inválido');
            return false;
        }
        if (cleanCpfCnpj.length === 14 && !window.Utils.validateCNPJ(cleanCpfCnpj)) {
            window.Utils.Toast.error('CNPJ inválido');
            return false;
        }
    }
    
    try {
        window.Utils.Loading.show();
        
        if (editingClienteId) {
            cliente.id = editingClienteId;
            await API.atualizarCliente(cliente);
        } else {
            await API.adicionarCliente(cliente);
        }
        
        await navigateTo('clientes');
        return true;
    } catch (error) {
        return false;
    } finally {
        window.Utils.Loading.hide();
    }
}

async function editarCliente(clienteId) {
    openClienteModal(clienteId);
}

async function confirmarExclusaoCliente(clienteId, clienteNome) {
    const modal = window.Components.createModal('confirmModal', 'Confirmar Exclusão', `
        <p style="color: var(--color-text-secondary);">
            Tem certeza que deseja excluir o cliente <strong>${clienteNome}</strong>?
            Esta ação não pode ser desfeita.
        </p>
    `, {
        confirmText: 'Excluir',
        confirmClass: 'btn-danger',
        onConfirm: async () => {
            window.Utils.Loading.show();
            await API.excluirCliente(clienteId);
            await navigateTo('clientes');
            window.Utils.Loading.hide();
            return true;
        }
    });
}

// ===================================
// PRODUTOS FUNCTIONS
// ===================================
function setupProdutosSearch() {
    const searchInput = document.getElementById('searchProdutos');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', window.Utils.debounce(async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const produtos = await API.getProdutos();
        const filtered = produtos.filter(p => 
            p.nome.toLowerCase().includes(searchTerm) ||
            (p.categoria && p.categoria.toLowerCase().includes(searchTerm))
        );
        
        const grid = document.getElementById('produtosGrid');
        if (grid) {
            grid.innerHTML = renderProdutosList(filtered);
        }
    }, 300));
}

function openProdutoModal(produtoId = null) {
    editingProdutoId = produtoId;
    
    const modal = window.Components.createModal('produtoModal', produtoId ? 'Editar Produto' : 'Novo Produto', `
        <form id="produtoForm">
            <div class="form-group">
                <label class="form-label">Nome *</label>
                <input type="text" class="form-input" id="produtoNome" required />
            </div>
            
            <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea class="form-textarea" id="produtoDescricao" rows="3"></textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Preço *</label>
                    <input type="number" class="form-input" id="produtoPreco" step="0.01" min="0" required />
                </div>
                <div class="form-group">
                    <label class="form-label">Estoque *</label>
                    <input type="number" class="form-input" id="produtoEstoque" min="0" required />
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Categoria</label>
                <input type="text" class="form-input" id="produtoCategoria" />
            </div>
            
            <div class="form-group">
                <label class="form-label">Foto do Produto</label>
                <input type="file" class="form-input" id="produtoFoto" accept="image/*" />
                <div id="fotoPreview" style="margin-top: 1rem;"></div>
            </div>
        </form>
    `, {
        confirmText: produtoId ? 'Atualizar' : 'Adicionar',
        onConfirm: salvarProduto
    });
    
    // Setup foto preview
    document.getElementById('produtoFoto').addEventListener('change', previewFoto);
    
    // Se estiver editando, preencher formulário
    if (produtoId) {
        preencherFormularioProduto(produtoId);
    }
}

function previewFoto(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('fotoPreview').innerHTML = `
                <img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 0.5rem;" />
            `;
        };
        reader.readAsDataURL(file);
    }
}

async function preencherFormularioProduto(produtoId) {
    const produtos = await API.getProdutos();
    const produto = produtos.find(p => p.id === produtoId);
    
    if (produto) {
        document.getElementById('produtoNome').value = produto.nome;
        document.getElementById('produtoDescricao').value = produto.descricao || '';
        document.getElementById('produtoPreco').value = produto.preco;
        document.getElementById('produtoEstoque').value = produto.estoque;
        document.getElementById('produtoCategoria').value = produto.categoria || '';
        
        if (produto.foto) {
            document.getElementById('fotoPreview').innerHTML = `
                <img src="${produto.foto}" style="max-width: 200px; max-height: 200px; border-radius: 0.5rem;" />
            `;
        }
    }
}

async function salvarProduto() {
    const form = document.getElementById('produtoForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    
    const fotoInput = document.getElementById('produtoFoto');
    let fotoBase64 = null;
    
    // Se há novo arquivo, converter para base64
    if (fotoInput.files.length > 0) {
        fotoBase64 = await fileToBase64(fotoInput.files[0]);
    } else if (editingProdutoId) {
        // Se está editando e não mudou foto, manter a foto atual
        const produtos = await API.getProdutos();
        const produtoAtual = produtos.find(p => p.id === editingProdutoId);
        fotoBase64 = produtoAtual?.foto;
    }
    
    const produto = {
        nome: document.getElementById('produtoNome').value,
        descricao: document.getElementById('produtoDescricao').value,
        preco: parseFloat(document.getElementById('produtoPreco').value),
        estoque: parseInt(document.getElementById('produtoEstoque').value),
        categoria: document.getElementById('produtoCategoria').value,
        foto: fotoBase64,
    };
    
    try {
        window.Utils.Loading.show();
        
        if (editingProdutoId) {
            produto.id = editingProdutoId;
            await API.atualizarProduto(produto);
        } else {
            await API.adicionarProduto(produto);
        }
        
        await navigateTo('produtos');
        return true;
    } catch (error) {
        return false;
    } finally {
        window.Utils.Loading.hide();
    }
}

async function editarProduto(produtoId) {
    openProdutoModal(produtoId);
}

async function confirmarExclusaoProduto(produtoId, produtoNome) {
    const modal = window.Components.createModal('confirmModal', 'Confirmar Exclusão', `
        <p style="color: var(--color-text-secondary);">
            Tem certeza que deseja excluir o produto <strong>${produtoNome}</strong>?
            Esta ação não pode ser desfeita.
        </p>
    `, {
        confirmText: 'Excluir',
        confirmClass: 'btn-danger',
        onConfirm: async () => {
            window.Utils.Loading.show();
            await API.excluirProduto(produtoId);
            await navigateTo('produtos');
            window.Utils.Loading.hide();
            return true;
        }
    });
}

// Continua no próximo bloco...

// ===================================
// VENDAS FUNCTIONS
// ===================================
let carrinhoAtual = [];
let clienteSelecionado = null;

function setupProdutosVendaSearch() {
    const searchInput = document.getElementById('searchProdutosVenda');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce((e) => {
        const searchTerm = e.target.value.toLowerCase();
        const produtos = window.produtosDisponiveis || [];
        const filtered = produtos.filter(p => 
            p.nome.toLowerCase().includes(searchTerm) ||
            (p.categoria && p.categoria.toLowerCase().includes(searchTerm))
        );
        
        const grid = document.getElementById('produtosVendaGrid');
        if (grid) {
            grid.innerHTML = renderProdutosVenda(filtered);
        }
    }, 300));
}

function selecionarCliente(clienteId) {
    if (!clienteId) {
        clienteSelecionado = null;
        return;
    }
    
    const clientes = window.clientesDisponiveis || [];
    clienteSelecionado = clientes.find(c => c.id === clienteId);
    
    if (clienteSelecionado) {
        Toast.success(`Cliente ${clienteSelecionado.nome} selecionado`);
    }
}

function adicionarAoCarrinho(produtoId) {
    if (!clienteSelecionado) {
        Toast.warning('Selecione um cliente primeiro');
        return;
    }
    
    const produtos = window.produtosDisponiveis || [];
    const produto = produtos.find(p => p.id === produtoId);
    
    if (!produto) {
        window.Utils.Toast.error('Produto não encontrado');
        return;
    }
    
    if (produto.estoque <= 0) {
        window.Utils.Toast.error('Produto sem estoque');
        return;
    }
    
    // Verificar se produto já está no carrinho
    const itemExistente = carrinhoAtual.find(item => item.produto.id === produtoId);
    
    if (itemExistente) {
        if (itemExistente.quantidade >= produto.estoque) {
            Toast.warning('Quantidade máxima atingida para este produto');
            return;
        }
        itemExistente.quantidade++;
        itemExistente.subtotal = itemExistente.quantidade * itemExistente.produto.preco;
    } else {
        carrinhoAtual.push({
            produto: produto,
            quantidade: 1,
            subtotal: produto.preco
        });
    }
    
    atualizarContadorCarrinho();
    Toast.success(`${produto.nome} adicionado ao carrinho`);
}

function atualizarContadorCarrinho() {
    const count = carrinhoAtual.reduce((sum, item) => sum + item.quantidade, 0);
    const countElement = document.getElementById('carrinhoCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

function verCarrinho() {
    if (carrinhoAtual.length === 0) {
        Toast.warning('Carrinho vazio');
        return;
    }
    
    const total = carrinhoAtual.reduce((sum, item) => sum + item.subtotal, 0);
    
    const modal = window.Components.createModal('carrinhoModal', 'Carrinho de Compras', `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Qtd</th>
                        <th>Preço</th>
                        <th>Subtotal</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${carrinhoAtual.map((item, index) => `
                        <tr>
                            <td>${item.produto.nome}</td>
                            <td>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <button class="btn-icon" onclick="alterarQuantidade(${index}, -1)">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M5 12h14"/>
                                        </svg>
                                    </button>
                                    <span style="min-width: 2rem; text-align: center;">${item.quantidade}</span>
                                    <button class="btn-icon" onclick="alterarQuantidade(${index}, 1)">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M12 5v14M5 12h14"/>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                            <td>${formatCurrency(item.produto.preco)}</td>
                            <td style="font-weight: 600;">${formatCurrency(item.subtotal)}</td>
                            <td>
                                <button class="btn-icon" onclick="removerDoCarrinho(${index})">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: right; font-weight: 600;">Total:</td>
                        <td colspan="2" style="font-weight: 700; font-size: 1.25rem; color: var(--color-success);">
                            ${formatCurrency(total)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `, {
        confirmText: 'Finalizar Venda',
        onConfirm: () => {
            closeModal('carrinhoModal');
            abrirModalPagamento();
            return false; // Don't close modal yet
        }
    });
}

function alterarQuantidade(index, delta) {
    const item = carrinhoAtual[index];
    const novaQuantidade = item.quantidade + delta;
    
    if (novaQuantidade <= 0) {
        removerDoCarrinho(index);
        return;
    }
    
    if (novaQuantidade > item.produto.estoque) {
        Toast.warning('Quantidade máxima atingida');
        return;
    }
    
    item.quantidade = novaQuantidade;
    item.subtotal = item.quantidade * item.produto.preco;
    
    atualizarContadorCarrinho();
    verCarrinho(); // Refresh modal
}

function removerDoCarrinho(index) {
    carrinhoAtual.splice(index, 1);
    atualizarContadorCarrinho();
    
    if (carrinhoAtual.length === 0) {
        closeModal('carrinhoModal');
        Toast.info('Carrinho vazio');
    } else {
        verCarrinho(); // Refresh modal
    }
}

function abrirModalPagamento() {
    const total = carrinhoAtual.reduce((sum, item) => sum + item.subtotal, 0);
    
    const modal = window.Components.createModal('pagamentoModal', 'Forma de Pagamento', `
        <div style="margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Total da Venda</h3>
            <div style="font-size: 2rem; font-weight: 700; color: var(--color-success);">
                ${formatCurrency(total)}
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Forma de Pagamento *</label>
            <select class="form-select" id="formaPagamento" onchange="mostrarCamposPagamento()">
                <option value="">Selecione...</option>
                <option value="avista">À Vista</option>
                <option value="pix">PIX</option>
                <option value="cartao">Cartão de Crédito</option>
            </select>
        </div>
        
        <div id="camposPagamento"></div>
    `, {
        confirmText: 'Confirmar Venda',
        onConfirm: finalizarVenda
    });
}

function mostrarCamposPagamento() {
    const formaPagamento = document.getElementById('formaPagamento').value;
    const container = document.getElementById('camposPagamento');
    const total = carrinhoAtual.reduce((sum, item) => sum + item.subtotal, 0);
    
    if (formaPagamento === 'pix') {
        container.innerHTML = `
            <div class="form-group">
                <label class="form-label">Data de Vencimento</label>
                <input type="date" class="form-input" id="dataVencimento" required />
            </div>
        `;
    } else if (formaPagamento === 'cartao') {
        container.innerHTML = `
            <div class="form-group">
                <label class="form-label">Número de Parcelas</label>
                <select class="form-select" id="numeroParcelas" onchange="calcularParcelas()">
                    ${Array.from({length: 10}, (_, i) => {
                        const parcela = i + 1;
                        const valorParcela = total / parcela;
                        return `<option value="${parcela}">${parcela}x de ${formatCurrency(valorParcela)}</option>`;
                    }).join('')}
                </select>
            </div>
            <div id="detalheParcelas" style="margin-top: 1rem; padding: 1rem; background: var(--color-bg-secondary); border-radius: 0.5rem;">
                <div style="font-size: 0.875rem; color: var(--color-text-secondary);">
                    Valor da parcela: <strong>${formatCurrency(total)}</strong>
                </div>
            </div>
        `;
        calcularParcelas();
    } else {
        container.innerHTML = '';
    }
}

function calcularParcelas() {
    const total = carrinhoAtual.reduce((sum, item) => sum + item.subtotal, 0);
    const parcelas = parseInt(document.getElementById('numeroParcelas').value);
    const valorParcela = total / parcelas;
    
    document.getElementById('detalheParcelas').innerHTML = `
        <div style="font-size: 0.875rem; color: var(--color-text-secondary);">
            Valor da parcela: <strong>${formatCurrency(valorParcela)}</strong>
        </div>
    `;
}

async function finalizarVenda() {
    const formaPagamento = document.getElementById('formaPagamento').value;
    
    if (!formaPagamento) {
        window.Utils.Toast.error('Selecione a forma de pagamento');
        return false;
    }
    
    const total = carrinhoAtual.reduce((sum, item) => sum + item.subtotal, 0);
    
    let pagamento;
    
    if (formaPagamento === 'avista') {
        pagamento = { tipo: 'avista' };
    } else if (formaPagamento === 'pix') {
        const dataVencimento = document.getElementById('dataVencimento').value;
        if (!dataVencimento) {
            window.Utils.Toast.error('Informe a data de vencimento');
            return false;
        }
        pagamento = { tipo: 'pix', dataVencimento };
    } else if (formaPagamento === 'cartao') {
        const parcelas = parseInt(document.getElementById('numeroParcelas').value);
        const valorParcela = total / parcelas;
        pagamento = { tipo: 'cartao', parcelas, valorParcela };
    }
    
    const venda = {
        cliente: clienteSelecionado,
        itens: carrinhoAtual,
        total,
        pagamento,
        status: 'concluida'
    };
    
    try {
        window.Utils.Loading.show();
        await API.adicionarVenda(venda);
        
        // Gerar PDF
        gerarPDF(venda);
        
        // Limpar carrinho
        carrinhoAtual = [];
        clienteSelecionado = null;
        atualizarContadorCarrinho();
        
        // Recarregar módulo de vendas
        await navigateTo('vendas');
        
        return true;
    } catch (error) {
        return false;
    } finally {
        window.Utils.Loading.hide();
    }
}

// ===================================
// PDF GENERATION
// ===================================
function gerarPDF(venda) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('CUPOM FISCAL', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Data: ${formatDateTime(new Date())}`, 105, 30, { align: 'center' });
    
    // Cliente
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('CLIENTE', 20, 45);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Nome: ${venda.cliente.nome}`, 20, 52);
    doc.text(`Email: ${venda.cliente.email}`, 20, 58);
    doc.text(`Telefone: ${venda.cliente.telefone}`, 20, 64);
    
    // Linha separadora
    doc.line(20, 70, 190, 70);
    
    // Itens
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('ITENS DA VENDA', 20, 78);
    
    let y = 86;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    venda.itens.forEach(item => {
        doc.text(`${item.produto.nome}`, 20, y);
        doc.text(`${item.quantidade}x ${formatCurrency(item.produto.preco)}`, 120, y);
        doc.text(`${formatCurrency(item.subtotal)}`, 170, y, { align: 'right' });
        y += 6;
    });
    
    // Linha separadora
    doc.line(20, y + 2, 190, y + 2);
    y += 10;
    
    // Total
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', 120, y);
    doc.text(formatCurrency(venda.total), 170, y, { align: 'right' });
    
    y += 10;
    
    // Forma de pagamento
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    let formaPagamentoTexto = '';
    if (venda.pagamento.tipo === 'avista') {
        formaPagamentoTexto = 'À Vista';
    } else if (venda.pagamento.tipo === 'pix') {
        formaPagamentoTexto = `PIX - Vencimento: ${formatDate(venda.pagamento.dataVencimento)}`;
    } else {
        formaPagamentoTexto = `Cartão ${venda.pagamento.parcelas}x de ${formatCurrency(venda.pagamento.valorParcela)}`;
    }
    doc.text(`Forma de Pagamento: ${formaPagamentoTexto}`, 20, y);
    
    // Footer
    doc.setFontSize(8);
    doc.text('Sistema de Gestão de Vendas', 105, 280, { align: 'center' });
    
    // Save
    doc.save(`venda-${Date.now()}.pdf`);
}

// ===================================
// MODAL HELPER
// ===================================
function createModal(id, title, content, options = {}) {
    // Remove existing modal if any
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeModal('${id}')"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">${title}</h2>
                <button class="modal-close" onclick="closeModal('${id}')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">${content}</div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('${id}')">Cancelar</button>
                ${options.confirmText ? `
                    <button class="btn ${options.confirmClass || 'btn-primary'}" id="${id}ConfirmBtn">
                        ${options.confirmText}
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup confirm button
    if (options.onConfirm) {
        const confirmBtn = document.getElementById(`${id}ConfirmBtn`);
        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                const result = await options.onConfirm();
                if (result !== false) {
                    closeModal(id);
                }
            });
        }
    }
    
    // Show modal
    setTimeout(() => modal.classList.add('active'), 10);
    
    return modal;
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 200);
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function setupInputMasks() {
    const telefoneInput = document.getElementById('clienteTelefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => {
            e.target.value = formatPhone(e.target.value);
        });
    }
    
    const cpfCnpjInput = document.getElementById('clienteCpfCnpj');
    if (cpfCnpjInput) {
        cpfCnpjInput.addEventListener('input', (e) => {
            e.target.value = formatCPFCNPJ(e.target.value);
        });
    }
    
    const cepInput = document.getElementById('clienteCep');
    if (cepInput) {
        cepInput.addEventListener('input', (e) => {
            e.target.value = formatCEP(e.target.value);
        });
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Export functions to global scope for onclick handlers
window.openClienteModal = openClienteModal;
window.editarCliente = editarCliente;
window.confirmarExclusaoCliente = confirmarExclusaoCliente;
window.openProdutoModal = openProdutoModal;
window.editarProduto = editarProduto;
window.confirmarExclusaoProduto = confirmarExclusaoProduto;
window.selecionarCliente = selecionarCliente;
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.verCarrinho = verCarrinho;
window.alterarQuantidade = alterarQuantidade;
window.removerDoCarrinho = removerDoCarrinho;
window.mostrarCamposPagamento = mostrarCamposPagamento;
window.calcularParcelas = calcularParcelas;
window.closeModal = closeModal;

window.App = {
    navigateTo,
    openClienteModal,
    editarCliente,
    confirmarExclusaoCliente,
    openProdutoModal,
    editarProduto,
    confirmarExclusaoProduto,
    openVendaModal,
    verDetalhesVenda,
    imprimirRecibo
};
