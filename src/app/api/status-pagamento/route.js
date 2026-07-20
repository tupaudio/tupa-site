// src/app/api/status-pagamento/route.js
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');

  try {
    // Se já tivermos o paymentId, consulta direta (mais rápido)
    if (paymentId) {
      const resposta = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
      });
      if (resposta.ok) {
        const pagamento = await resposta.json();
        return NextResponse.json({ status: pagamento.status });
      }
    }

    // Se não tiver o paymentId, busca pelo external_reference
    if (externalReference) {
      const resposta = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${externalReference}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
      });

      if (resposta.ok) {
        const busca = await resposta.json();
        // Pega o pagamento mais recente com essa referência
        if (busca.results && busca.results.length > 0) {
          const ultimoPagamento = busca.results[0];
          return NextResponse.json({ 
            status: ultimoPagamento.status,
            payment_id: ultimoPagamento.id 
          });
        }
      }
    }

    return NextResponse.json({ status: 'pending' }); // Fallback se não encontrar nada ainda
  } catch (erro) {
    console.error('Erro na API status-pagamento:', erro);
    return NextResponse.json({ status: 'pending', error: 'Erro interno' });
  }
}