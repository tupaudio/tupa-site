// src/app/api/checkout/route.js
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { randomUUID } from 'crypto';

export async function POST(req) {
  try {
    // =========================================================
    // 1. VALIDAÇÃO DO TOKEN
    // =========================================================
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
      return NextResponse.json(
        { error: 'Pagamento não configurado no servidor. Contate o administrador.' },
        { status: 500 }
      );
    }

    // =========================================================
    // 2. INICIALIZAÇÃO DO CLIENTE
    // =========================================================
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    });

    // =========================================================
    // 3. PARSE E VALIDAÇÃO DOS DADOS
    // =========================================================
    const { items, cliente } = await req.json();

    // Validação: carrinho vazio
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Carrinho vazio. Adicione itens antes de finalizar.' },
        { status: 400 }
      );
    }

    // Validação: nome e email obrigatórios
    if (!cliente?.nome?.trim() || !cliente?.email?.trim()) {
      return NextResponse.json(
        { error: 'Nome e e-mail são obrigatórios para finalizar a compra.' },
        { status: 400 }
      );
    }

    // Validação: email válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cliente.email.trim())) {
      return NextResponse.json(
        { error: 'Digite um e-mail válido.' },
        { status: 400 }
      );
    }

    // Validação: endereço completo (se fornecido)
    if (cliente.endereco) {
      const { cep, rua, numero, cidade, uf } = cliente.endereco;
      if (!cep?.trim() || !rua?.trim() || !numero?.trim() || !cidade?.trim() || !uf?.trim()) {
        return NextResponse.json(
          { error: 'Preencha o endereço completo (CEP, rua, número, cidade e UF).' },
          { status: 400 }
        );
      }
    }

    // =========================================================
    // 4. PREPARAÇÃO DOS DADOS
    // =========================================================
    const preference = new Preference(client);
    
    // Sanitiza a URL base
    const baseUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
    
    // Verifica se a URL é pública (HTTPS)
    const urlPublicaValida = baseUrl.startsWith('https://');
    
    // Identificador único do pedido
    const externalReference = randomUUID();

    // Prepara os itens para o MercadoPago
    const preferenceItems = items.map(item => ({
      title: item.nome.substring(0, 256), // Limite do MP
      unit_price: Number(item.preco),
      quantity: Math.max(1, item.quantidade || 1),
      currency_id: 'BRL',
    }));

    // =========================================================
    // 5. CONSTRUÇÃO DO CORPO DA PREFERENCE
    // =========================================================
    const corpo = {
      // Itens do carrinho
      items: preferenceItems,

      // Dados do pagador
      payer: {
        name: cliente.nome.trim().substring(0, 256),
        email: cliente.email.trim().substring(0, 256),
        ...(cliente.doc && {
          identification: {
            type: cliente.doc.replace(/\D/g, '').length > 11 ? 'CNPJ' : 'CPF',
            number: cliente.doc.replace(/\D/g, ''),
          }
        }),
        ...(cliente.telefone && {
          phone: {
            number: cliente.telefone.replace(/\D/g, ''),
          }
        }),
        ...(cliente.endereco && {
          address: {
            zip_code: cliente.endereco.cep?.replace(/\D/g, '') || '',
            street_name: cliente.endereco.rua || '',
            street_number: cliente.endereco.numero || '',
            neighborhood: cliente.endereco.bairro || '',
            city: cliente.endereco.cidade || '',
            federal_unit: cliente.endereco.uf || '',
          }
        }),
      },

      // URLs de retorno
      back_urls: {
        success: `${baseUrl}/sucesso`,
        failure: `${baseUrl}/falha`,
        pending: `${baseUrl}/pendente`,
      },

      // Referência externa para o webhook
      external_reference: externalReference,

      // Metadados para o webhook (sem banco de dados)
      metadata: {
        cliente_nome: cliente.nome.trim().substring(0, 100),
        cliente_email: cliente.email.trim().substring(0, 100),
        cliente_telefone: cliente.telefone || '',
        cliente_doc: cliente.doc || '',
        cliente_endereco: cliente.endereco
          ? `${cliente.endereco.rua}, ${cliente.endereco.numero}${cliente.endereco.complemento ? ` ${cliente.endereco.complemento}` : ''} — ${cliente.endereco.bairro}, ${cliente.endereco.cidade}/${cliente.endereco.uf}`.substring(0, 200)
          : '',
        itens_json: JSON.stringify(
          items.map((i) => ({
            id: i.id,
            title: i.nome.substring(0, 100),
            quantity: i.quantidade || 1,
            price: Number(i.preco),
          }))
        ).substring(0, 500),
        total: items.reduce((sum, item) => sum + Number(item.preco) * (item.quantidade || 1), 0).toFixed(2),
      },

      // Configurações adicionais
      statement_descriptor: 'TUPÃ AUDIO',
      binary_mode: true, // Não aceita pagamentos em análise manual
    };

    // =========================================================
    // 6. CONFIGURAÇÕES APENAS PARA PRODUÇÃO (HTTPS)
    // =========================================================
    if (urlPublicaValida) {
      corpo.auto_return = 'approved'; // Redireciona automaticamente quando aprovado
      corpo.notification_url = `${baseUrl}/api/webhooks/mercadopago`;
      
      // Expiração do pagamento (30 minutos)
      corpo.expires = true;
      corpo.expiration_date_from = new Date(Date.now()).toISOString();
      corpo.expiration_date_to = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    } else {
      // Em desenvolvimento, não usa notification_url (MP rejeita localhost)
      console.log('⚠️ Modo desenvolvimento: notification_url desabilitado');
    }

    // =========================================================
    // 7. CRIAÇÃO DA PREFERENCE
    // =========================================================
    console.log(`📦 Criando preferência para ${cliente.nome} - ${items.length} itens`);
    const result = await preference.create({ body: corpo });

    console.log(`✅ Preferência criada: ${result.id}`);

    // =========================================================
    // 8. RESPOSTA
    // =========================================================
    return NextResponse.json({
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      preference_id: result.id,
    });

  } catch (error) {
    // =========================================================
    // 9. TRATAMENTO DE ERROS
    // =========================================================
    console.error('❌ Erro no checkout:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });

    // Erros específicos do MercadoPago
    if (error.response?.data) {
      const mpError = error.response.data;
      const errorMessage = mpError.message || 'Erro ao processar pagamento no MercadoPago.';
      
      // Erros comuns do MP
      if (mpError.status === 400) {
        return NextResponse.json(
          { error: `Dados inválidos: ${errorMessage}` },
          { status: 400 }
        );
      }
      if (mpError.status === 401) {
        return NextResponse.json(
          { error: 'Token do MercadoPago inválido. Contate o administrador.' },
          { status: 500 }
        );
      }
      if (mpError.status === 403) {
        return NextResponse.json(
          { error: 'Permissão negada no MercadoPago. Verifique as configurações.' },
          { status: 500 }
        );
      }
      if (mpError.status === 429) {
        return NextResponse.json(
          { error: 'Muitas requisições. Tente novamente em alguns segundos.' },
          { status: 429 }
        );
      }
    }

    // Erro genérico
    return NextResponse.json(
      { 
        error: 'Erro ao processar pagamento. Tente novamente ou entre em contato pelo WhatsApp.' 
      },
      { status: 500 }
    );
  }
}