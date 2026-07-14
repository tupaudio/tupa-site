import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { randomUUID } from 'crypto';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });

export async function POST(req) {
  try {
    const { items, cliente } = await req.json();

    // Nome e e-mail são obrigatórios — sem eles, não sabemos pra quem
    // emitir a nota fiscal nem como contatar o cliente sobre o pedido.
    if (!cliente?.nome?.trim() || !cliente?.email?.trim()) {
      return NextResponse.json(
        { error: 'Nome e e-mail são obrigatórios para finalizar a compra.' },
        { status: 400 }
      );
    }

    const preference = new Preference(client);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    // O Mercado Pago só aceita "approved" (ou omitir o campo).
    // Além disso, auto_return e notification_url exigem URL pública em
    // https — em localhost ele rejeita/ignora, então só ativamos quando
    // a URL não for local (ex: já publicada na Vercel).
    const urlPublicaValida = baseUrl.startsWith('https://');

    // Identificador único deste pedido — o webhook usa isso pra saber
    // a qual pedido a notificação de pagamento se refere.
    const externalReference = randomUUID();

    const corpo = {
      items: items.map(item => ({
        title: item.nome,
        unit_price: Number(item.preco),
        quantity: item.quantidade || 1,
        currency_id: 'BRL',
      })),
      payer: {
        name: cliente.nome.trim(),
        email: cliente.email.trim(),
      },
      back_urls: {
        success: `${baseUrl}/carrinho/sucesso`,
        failure: `${baseUrl}/carrinho/falha`,
        pending: `${baseUrl}/carrinho/pendente`
      },
      external_reference: externalReference,
      // Metadata: guardamos os dados do pedido aqui porque este projeto
      // ainda não tem banco de dados — o webhook lê essas infos direto
      // da resposta do Mercado Pago pra montar o e-mail/WhatsApp.
      metadata: {
        cliente_nome: cliente.nome.trim(),
        cliente_email: cliente.email.trim(),
        itens_resumo: items.map((i) => `${i.quantidade || 1}x ${i.nome}`).join(', '),
      },
    };

    // Só inclui auto_return/notification_url se a URL for pública — em
    // localhost o Mercado Pago rejeita (é exatamente o erro que já vimos)
    if (urlPublicaValida) {
      corpo.auto_return = 'approved';
      corpo.notification_url = `${baseUrl}/api/webhooks/mercadopago`;
    }

    const result = await preference.create({ body: corpo });

    return NextResponse.json({ init_point: result.init_point });

  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}