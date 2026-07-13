import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });

export async function POST(req) {
  try {
    const { items, cliente } = await req.json();

    const preference = new Preference(client);
    
    // Simplificamos as URLs para evitar erros de validação
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const result = await preference.create({
      body: {
        items: items.map(item => ({
          title: item.nome,
          unit_price: Number(item.preco),
          quantity: item.quantidade || 1,
          currency_id: 'BRL',
        })),
        payer: {
          name: cliente?.nome || "Cliente",
          email: cliente?.email || "cliente@tupa.com",
        },
        back_urls: {
          success: `${baseUrl}/carrinho/sucesso`,
          failure: `${baseUrl}/carrinho/falha`,
          pending: `${baseUrl}/carrinho/pendente`
        },
        // Removemos o auto_return temporariamente para evitar o erro de validação
        auto_return: 'all' 
      }
    });

    return NextResponse.json({ init_point: result.init_point });
    
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}