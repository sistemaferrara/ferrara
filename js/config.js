// ===================================
// SUPABASE CONFIGURATION
// ===================================

window.SUPABASE_CONFIG = {
    url: 'https://seu-projeto.supabase.co',
    key: 'sua-anon-key-aqui'
};

// ===================================
// API CLASS
// ===================================
class SupabaseAPI {
    constructor() {
        this.baseURL = window.SUPABASE_CONFIG.url;
        this.headers = {
            'apikey': window.SUPABASE_CONFIG.key,
            'Authorization': `Bearer ${window.SUPABASE_CONFIG.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    // CLIENTES
    async getClientes() {
        const response = await fetch(`${this.baseURL}/rest/v1/clientes?select=*&order=nome.asc`, {
            headers: this.headers
        });
        return response.json();
    }

    async adicionarCliente(cliente) {
        const response = await fetch(`${this.baseURL}/rest/v1/clientes`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(cliente)
        });
        return response.json();
    }

    async atualizarCliente(cliente) {
        const response = await fetch(`${this.baseURL}/rest/v1/clientes?id=eq.${cliente.id}`, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify({
                nome: cliente.nome,
                email: cliente.email,
                telefone: cliente.telefone,
                cpfCnpj: cliente.cpfCnpj,
                endereco: cliente.endereco,
                cidade: cliente.cidade,
                estado: cliente.estado,
                cep: cliente.cep
            })
        });
        return response.json();
    }

    async excluirCliente(id) {
        const response = await fetch(`${this.baseURL}/rest/v1/clientes?id=eq.${id}`, {
            method: 'DELETE',
            headers: this.headers
        });
        return response.json();
    }

    // PRODUTOS
    async getProdutos() {
        const response = await fetch(`${this.baseURL}/rest/v1/produtos?select=*&order=nome.asc`, {
            headers: this.headers
        });
        return response.json();
    }

    async adicionarProduto(produto) {
        const response = await fetch(`${this.baseURL}/rest/v1/produtos`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(produto)
        });
        return response.json();
    }

    async atualizarProduto(produto) {
        const response = await fetch(`${this.baseURL}/rest/v1/produtos?id=eq.${produto.id}`, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify({
                nome: produto.nome,
                descricao: produto.descricao,
                preco: produto.preco,
                estoque: produto.estoque,
                categoria: produto.categoria,
                foto: produto.foto
            })
        });
        return response.json();
    }

    async excluirProduto(id) {
        const response = await fetch(`${this.baseURL}/rest/v1/produtos?id=eq.${id}`, {
            method: 'DELETE',
            headers: this.headers
        });
        return response.json();
    }

    // VENDAS
    async getVendas() {
        const response = await fetch(`${this.baseURL}/rest/v1/vendas?select=*&order=created_at.desc`, {
            headers: this.headers
        });
        return response.json();
    }

    async adicionarVenda(venda) {
        const vendaData = {
            cliente_id: venda.cliente.id,
            cliente_nome: venda.cliente.nome,
            cliente_email: venda.cliente.email,
            itens: JSON.stringify(venda.itens),
            total: venda.total,
            forma_pagamento: venda.pagamento.tipo,
            detalhes_pagamento: JSON.stringify(venda.pagamento),
            status: venda.status
        };

        const response = await fetch(`${this.baseURL}/rest/v1/vendas`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(vendaData)
        });
        return response.json();
    }

    // DASHBOARD
    async getDashboardStats() {
        const [clientes, produtos, vendas] = await Promise.all([
            this.getClientes(),
            this.getProdutos(), 
            this.getVendas()
        ]);

        return {
            totalClientes: clientes.length,
            totalProdutos: produtos.length,
            totalVendas: vendas.length,
            vendasHoje: vendas.filter(v => 
                new Date(v.created_at).toDateString() === new Date().toDateString()
            ).length,
            receitaMes: vendas
                .filter(v => {
                    const vendaDate = new Date(v.created_at);
                    const now = new Date();
                    return vendaDate.getMonth() === now.getMonth() && 
                           vendaDate.getFullYear() === now.getFullYear();
                })
                .reduce((sum, v) => sum + v.total, 0)
        };
    }
}

// Global API instance
window.API = new SupabaseAPI();