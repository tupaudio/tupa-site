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

    // 3. Montagem do Corpo da Preferência
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
        ...(cliente.doc && {
          identification: {
            type: cliente.doc.replace(/\D/g, '').length > 11 ? 'CNPJ' : 'CPF',
            number: cliente.doc.replace(/\D/g, ''),
          }
        }),
      },
      back_urls: {
        success: `${baseUrl}/sucesso`,
        failure: `${baseUrl}/falha`,
        pending: `${baseUrl}/pendente`,
      },
      auto_return: 'approved',
      external_reference: externalReference,
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      metadata: {
        cliente_nome: cliente.nome.trim(),
        cliente_email: cliente.email.trim(),
        cliente_telefone: cliente.telefone || '',
        cliente_endereco: cliente.endereco
          ? `${cliente.endereco.rua}, ${cliente.endereco.numero} ${cliente.endereco.complemento || ''} — ${cliente.endereco.bairro}, ${cliente.endereco.cidade}/${cliente.endereco.uf}`
          : '',
        itens_json: JSON.stringify(items.map((i) => ({ id: i.id, title: i.nome, quantity: i.quantidade || 1 }))),
      },
    };

    // 4. Criação da Preferência e Resposta (agora com external_reference incluído de verdade)
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