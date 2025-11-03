// ===================================
// SUPABASE API - JavaScript Vanilla
// ===================================

// Configuração do Supabase
const SUPABASE_URL = 'https://djrhqdqtvmmrfdbbvfsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcmhxZHF0dm1tcmZkYmJ2ZnNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzUwMzAsImV4cCI6MjA3NzY1MTAzMH0.4D_g_yxMCN5ClR2QDXZIIaVWNOm2y_5_rX-iGe7FYgo';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====================================
// CLIENTES
// ====================================

async function getClientes() {
    try {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        Toast.error('Erro ao buscar clientes');
        return [];
    }
}

async function adicionarCliente(cliente) {
    try {
        const clienteData = {
            nome: cliente.nome || '',
            email: cliente.email || '',
            telefone: cliente.telefone || '',
            endereco: cliente.endereco || '',
            cidade: cliente.cidade || '',
            estado: cliente.estado || '',
            cep: cliente.cep || '',
            cpf_cnpj: cliente.cpfCnpj || '',
        };

        const { data, error } = await supabase
            .from('clientes')
            .insert([clienteData])
            .select()
            .single();

        if (error) throw error;

        Toast.success('Cliente adicionado com sucesso');
        return {
            id: data.id,
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
            endereco: data.endereco || '',
            cidade: data.cidade || '',
            estado: data.estado || '',
            cep: data.cep || '',
            cpfCnpj: data.cpf_cnpj || '',
            dataCriacao: data.created_at,
        };
    } catch (error) {
        console.error('Erro ao adicionar cliente:', error);
        Toast.error('Erro ao adicionar cliente');
        throw error;
    }
}

async function atualizarCliente(cliente) {
    try {
        const { error } = await supabase
            .from('clientes')
            .update({
                nome: cliente.nome,
                email: cliente.email,
                telefone: cliente.telefone,
                endereco: cliente.endereco,
                cidade: cliente.cidade,
                estado: cliente.estado,
                cep: cliente.cep,
                cpf_cnpj: cliente.cpfCnpj,
            })
            .eq('id', cliente.id);

        if (error) throw error;
        Toast.success('Cliente atualizado com sucesso');
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        Toast.error('Erro ao atualizar cliente');
        throw error;
    }
}

async function excluirCliente(id) {
    try {
        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        Toast.success('Cliente excluído com sucesso');
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        Toast.error('Erro ao excluir cliente');
        throw error;
    }
}

// ====================================
// PRODUTOS
// ====================================

async function getProdutos() {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(item => ({
            id: item.id,
            nome: item.nome,
            descricao: item.descricao || '',
            preco: parseFloat(item.preco),
            estoque: item.estoque,
            categoria: item.categoria || '',
            foto: item.imagem_url || null,
            dataCriacao: item.created_at,
        }));
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        Toast.error('Erro ao buscar produtos');
        return [];
    }
}

async function adicionarProduto(produto) {
    try {
        let imagemUrl = produto.foto || null;

        if (produto.foto && produto.foto.startsWith('data:image')) {
            const nomeSegurizado = String(produto?.nome || 'produto').replace(/\s+/g, '-');
            imagemUrl = await uploadImagemProduto(produto.foto, `${Date.now()}-${nomeSegurizado}.jpg`);
        }

        const { data, error } = await supabase
            .from('produtos')
            .insert([{
                nome: produto.nome,
                descricao: produto.descricao,
                preco: produto.preco,
                estoque: produto.estoque,
                categoria: produto.categoria,
                imagem_url: imagemUrl,
            }])
            .select()
            .single();

        if (error) throw error;

        Toast.success('Produto adicionado com sucesso');
        return {
            id: data.id,
            nome: data.nome,
            descricao: data.descricao || '',
            preco: parseFloat(data.preco),
            estoque: data.estoque,
            categoria: data.categoria || '',
            foto: data.imagem_url,
            dataCriacao: data.created_at,
        };
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        Toast.error('Erro ao adicionar produto');
        throw error;
    }
}

async function atualizarProduto(produto) {
    try {
        let imagemUrl = produto.foto || null;

        if (produto.foto && produto.foto.startsWith('data:image')) {
            const nomeSegurizado = String(produto?.nome || 'produto').replace(/\s+/g, '-');
            imagemUrl = await uploadImagemProduto(produto.foto, `${Date.now()}-${nomeSegurizado}.jpg`);
        }

        const { error } = await supabase
            .from('produtos')
            .update({
                nome: produto.nome,
                descricao: produto.descricao,
                preco: produto.preco,
                estoque: produto.estoque,
                categoria: produto.categoria,
                imagem_url: imagemUrl,
            })
            .eq('id', produto.id);

        if (error) throw error;
        Toast.success('Produto atualizado com sucesso');
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        Toast.error('Erro ao atualizar produto');
        throw error;
    }
}

async function excluirProduto(id) {
    try {
        const { error } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        Toast.success('Produto excluído com sucesso');
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        Toast.error('Erro ao excluir produto');
        throw error;
    }
}

// ====================================
// UPLOAD DE IMAGENS
// ====================================

async function uploadImagemProduto(base64Data, fileName) {
    try {
        const response = await fetch(base64Data);
        const blob = await response.blob();

        const timestamp = Date.now();
        const safeFileName = String(fileName || 'produto').replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFileName = `${timestamp}-${safeFileName}`;
        const filePath = `products/${uniqueFileName}`;

        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(filePath, blob, {
                contentType: blob.type,
                cacheControl: '3600',
                upsert: false,
            });

        if (error) throw error;

        const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Erro ao fazer upload de imagem:', error);
        return base64Data;
    }
}

// ====================================
// VENDAS
// ====================================

async function getVendas() {
    try {
        const { data, error } = await supabase
            .from('vendas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const vendasCompletas = await Promise.all(
            (data || []).map(async (venda) => {
                const { data: itens, error: itensError } = await supabase
                    .from('itens_venda')
                    .select('*')
                    .eq('venda_id', venda.id);

                if (itensError) {
                    console.error('Erro ao buscar itens da venda:', itensError);
                    return null;
                }

                return {
                    id: venda.id,
                    cliente: {
                        id: venda.cliente_id,
                        nome: venda.cliente_nome,
                        email: venda.cliente_email,
                        telefone: venda.cliente_telefone,
                        endereco: '',
                        cidade: '',
                        estado: '',
                        cep: '',
                        cpfCnpj: '',
                        dataCriacao: '',
                    },
                    itens: (itens || []).map((item) => ({
                        produto: {
                            id: item.produto_id,
                            nome: item.produto_nome,
                            descricao: '',
                            preco: parseFloat(item.preco_unitario),
                            estoque: 0,
                            categoria: '',
                            foto: null,
                            dataCriacao: '',
                        },
                        quantidade: item.quantidade,
                        subtotal: parseFloat(item.subtotal),
                    })),
                    total: parseFloat(venda.total),
                    pagamento: venda.forma_pagamento === 'avista'
                        ? { tipo: 'avista' }
                        : venda.forma_pagamento === 'pix'
                        ? { tipo: 'pix', dataVencimento: venda.data_vencimento }
                        : {
                            tipo: 'cartao',
                            parcelas: venda.parcelas,
                            valorParcela: parseFloat(venda.valor_parcela),
                        },
                    dataVenda: venda.created_at,
                    status: venda.status,
                };
            })
        );

        return vendasCompletas.filter(v => v !== null);
    } catch (error) {
        console.error('Erro ao buscar vendas:', error);
        Toast.error('Erro ao buscar vendas');
        return [];
    }
}

async function adicionarVenda(venda) {
    try {
        const { data: vendaData, error: vendaError } = await supabase
            .from('vendas')
            .insert([{
                cliente_id: venda.cliente.id,
                cliente_nome: venda.cliente.nome,
                cliente_email: venda.cliente.email,
                cliente_telefone: venda.cliente.telefone,
                total: venda.total,
                forma_pagamento: venda.pagamento.tipo,
                parcelas: venda.pagamento.tipo === 'cartao' ? venda.pagamento.parcelas : null,
                valor_parcela: venda.pagamento.tipo === 'cartao' ? venda.pagamento.valorParcela : null,
                data_vencimento: venda.pagamento.tipo === 'pix' ? venda.pagamento.dataVencimento : null,
                status: venda.status || 'concluida',
            }])
            .select()
            .single();

        if (vendaError) throw vendaError;

        const itensParaInserir = venda.itens.map((item) => ({
            venda_id: vendaData.id,
            produto_id: item.produto.id,
            produto_nome: item.produto.nome,
            quantidade: item.quantidade,
            preco_unitario: item.produto.preco,
            subtotal: item.subtotal,
        }));

        const { error: itensError } = await supabase
            .from('itens_venda')
            .insert(itensParaInserir);

        if (itensError) throw itensError;

        for (const item of venda.itens) {
            const { data: produtoAtual, error: produtoError } = await supabase
                .from('produtos')
                .select('estoque')
                .eq('id', item.produto.id)
                .single();

            if (produtoError) {
                console.error('Erro ao buscar estoque do produto:', produtoError);
                continue;
            }

            const novoEstoque = produtoAtual.estoque - item.quantidade;

            const { error: updateError } = await supabase
                .from('produtos')
                .update({ estoque: novoEstoque })
                .eq('id', item.produto.id);

            if (updateError) {
                console.error('Erro ao atualizar estoque:', updateError);
            }
        }

        Toast.success('Venda realizada com sucesso');
        return vendaData;
    } catch (error) {
        console.error('Erro ao adicionar venda:', error);
        Toast.error('Erro ao realizar venda');
        throw error;
    }
}

// Export API
window.API = {
    // Clientes
    getClientes,
    adicionarCliente,
    atualizarCliente,
    excluirCliente,
    
    // Produtos
    getProdutos,
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    uploadImagemProduto,
    
    // Vendas
    getVendas,
    adicionarVenda,
};
