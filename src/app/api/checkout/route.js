// src/app/api/checkout/route.js
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { randomUUID } from 'crypto';

export async function POST(req) {
  try {
    // 1. Validação do Token
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
      return NextResponse.json(
        { error: 'Pagamento não configurado no servidor.' },
        { status: 500 }
      );
    }
    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });

    // 2. Parse e Validação dos Dados
    const { items, cliente } = await req.json();

    if (!items?.length) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
    }
    if (!cliente?.nome?.trim() || !cliente?.email?.trim()) {
      return NextResponse.json(
        { error: 'Nome e e-mail são obrigatórios.' },
        { status: 400 }
      );
    }

    const preference = new Preference(client);
    const baseUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const externalReference = randomUUID();

    // 3. Validação e sanitização do documento
    let identification = null;
    if (cliente.doc) {
      const docNumbers = cliente.doc.replace(/\D/g, '');
      if (docNumbers.length === 11) {
        identification = {
          type: 'CPF',
          number: docNumbers,
        };
      } else if (docNumbers.length === 14) {
        identification = {
          type: 'CNPJ',
          number: docNumbers,
        };
      }
      // Se não for CPF nem CNPJ, não envia identificação
    }

    // 4. Montagem do Corpo da Preferência
    const corpo = {
      items: items.map(item => ({
        title: item.nome.substring(0, 256),
        unit_price: Number(item.preco),
        quantity: Math.max(1, item.quantidade || 1),
        currency_id: 'BRL',
      })),
      payer: {
        name: cliente.nome.trim().substring(0, 256),
        email: cliente.email.trim().substring(0, 256),
        ...(identification && { identification }),
      },
      back_urls: {
        // ✅ CORRIGIDO: Inclui external_reference na URL de sucesso
        success: `${baseUrl}/sucesso?external_reference=${externalReference}`,
        failure: `${baseUrl}/falha`,
        pending: `${baseUrl}/pendente`,
      },
      auto_return: 'approved',
      external_reference: externalReference,
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      metadata: {
        cliente_nome: cliente.nome.trim().substring(0, 100),
        cliente_email: cliente.email.trim().substring(0, 100),
        cliente_telefone: (cliente.telefone || '').substring(0, 20),
        cliente_endereco: cliente.endereco
          ? `${cliente.endereco.rua}, ${cliente.endereco.numero} ${cliente.endereco.complemento || ''} — ${cliente.endereco.bairro}, ${cliente.endereco.cidade}/${cliente.endereco.uf}`.substring(0, 200)
          : '',
        // Limita a quantidade de itens para não estourar o limite do MP (500 caracteres)
        itens_json: JSON.stringify(items.slice(0, 5).map((i) => ({ 
          id: i.id, 
          title: i.nome.substring(0, 50), 
          quantity: i.quantidade || 1 
        }))),
      },
    };

    // 5. Criação da Preferência e Resposta
    const result = await preference.create({ body: corpo });
    
    return NextResponse.json({
      init_point: result.init_point,
      external_reference: externalReference,
    });

  } catch (error) {
    console.error("Erro crítico no checkout:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Erro interno ao processar pagamento.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}