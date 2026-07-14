import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

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
    // Além disso, auto_return exige URL pública em https — em localhost
    // ele rejeita, então só ativamos quando a URL não for local.
    const urlPublicaValida = baseUrl.startsWith('https://');

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
    };

    // Só inclui auto_return se a URL for pública — evita o erro de validação
    if (urlPublicaValida) {
      corpo.auto_return = 'approved';
    }

    const result = await preference.create({ body: corpo });

    return NextResponse.json({ init_point: result.init_point });

  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}