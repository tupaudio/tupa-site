// src/app/api/status-pagamento/route.js
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request) {
  const paymentId = request.nextUrl.searchParams.get('payment_id');

  if (!paymentId) {
    return NextResponse.json({ error: 'payment_id é obrigatório' }, { status: 400 });
  }

  try {
    const resposta = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` 
      },
    });

    if (!resposta.ok) {
      console.error(`Erro ao consultar pagamento ${paymentId}:`, resposta.status);
      return NextResponse.json({ 
        status: 'unknown', 
        error: 'Erro ao consultar pagamento' 
      }, { status: 200 }); // Retorna 200 para não quebrar o cliente
    }

    const pagamento = await resposta.json();
    
    return NextResponse.json({ 
      status: pagamento.status,
      status_detail: pagamento.status_detail,
      payment_id: pagamento.id
    });
  } catch (erro) {
    console.error('Erro na API status-pagamento:', erro);
    return NextResponse.json({ 
      status: 'unknown', 
      error: 'Erro interno' 
    }, { status: 200 });
  }
}