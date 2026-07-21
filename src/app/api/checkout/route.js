// src/app/api/checkout/route.js
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { randomUUID } from 'crypto';
import { produtos } from '@/data/produtos';

// Limite de sanidade para a linha de frete (não temos, hoje, uma forma de
// revalidar o valor exato do frete no servidor sem re-chamar o Melhor Envio
// com o mesmo CEP/itens — então blindamos com um teto alto em vez de confiar
// cegamente no valor enviado pelo cliente).
const FRETE_VALOR_MAXIMO = 500;

// ⚠️ SEGURANÇA: nunca confiar no preço enviado pelo cliente.
// Recalcula cada item do carrinho a partir do catálogo (fonte da verdade),
// para impedir que alguém edite o localStorage / intercepte o fetch e
// finalize a compra com um preço arbitrário.
function revalidarItens(itemsRecebidos) {
  const itensValidados = [];

  for (const item of itemsRecebidos) {
    const quantidade = Math.max(1, Math.min(50, Number(item.quantidade) || 1));

    // Linha de frete: não tem id de produto. Aceita, mas com teto de valor.
    const ehFrete = typeof item.nome === 'string' && item.nome.startsWith('Frete');
    if (ehFrete) {
      const valorFrete = Math.max(0, Math.min(FRETE_VALOR_MAXIMO, Number(item.preco) || 0));
      itensValidados.push({
        title: String(item.nome).substring(0, 256),
        unit_price: valorFrete,
        quantity: 1,
        currency_id: 'BRL',
      });
      continue;
    }

    // Item de produto: o preço SEMPRE vem do catálogo, nunca do cliente.
    const produto = produtos.find((p) => String(p.id) === String(item.id));
    if (!produto) {
      throw new Error(`Produto inválido no carrinho (id: ${item.id}).`);
    }

    itensValidados.push({
      title: produto.nome.substring(0, 256),
      unit_price: Number(produto.preco),
      quantity: quantidade,
      currency_id: 'BRL',
    });
  }

  return itensValidados;
}

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

    // 2.1 Revalida preços contra o catálogo ANTES de montar a preferência
    let itensValidados;
    try {
      itensValidados = revalidarItens(items);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
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

    // 4. Montagem do Corpo da Preferência (usa os itens já revalidados,
    //    nunca os valores brutos enviados pelo cliente)
    const corpo = {
      items: itensValidados,
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