// app/api/status-pagamento/route.js
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');
  const status = searchParams.get('status'); // ✅ NOVO: filtro por status
  const limit = parseInt(searchParams.get('limit') || '1'); // ✅ NOVO: limite de resultados

  try {
    // 1. Se já tivermos o paymentId, consulta direta (mais rápido)
    if (paymentId) {
      const resposta = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
      });
      if (resposta.ok) {
        const pagamento = await resposta.json();
        return NextResponse.json({ 
          status: pagamento.status,
          external_reference: pagamento.external_reference,
        });
      }
    }

    // 2. Se não tiver o paymentId, busca pelo external_reference
    if (externalReference) {
      const resposta = await fetch(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${externalReference}`,
        {
          headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
        }
      );

      if (resposta.ok) {
        const busca = await resposta.json();
        if (busca.results && busca.results.length > 0) {
          const ultimoPagamento = busca.results[0];
          return NextResponse.json({ 
            status: ultimoPagamento.status,
            payment_id: ultimoPagamento.id,
            external_reference: ultimoPagamento.external_reference,
          });
        }
      }
    }

    // 3. ✅ NOVO: Busca por status (ex: últimos pedidos aprovados)
    if (status) {
      let url = `https://api.mercadopago.com/v1/payments/search?status=${status}&limit=${limit}`;
      
      // Ordena por data de criação (mais recente primeiro)
      url += '&sort=date_created&criteria=desc';
      
      const resposta = await fetch(url, {
        headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
      });

      if (resposta.ok) {
        const busca = await resposta.json();
        if (busca.results && busca.results.length > 0) {
          const pagamento = busca.results[0];
          return NextResponse.json({ 
            status: pagamento.status,
            payment_id: pagamento.id,
            external_reference: pagamento.external_reference,
          });
        }
      }
    }

    return NextResponse.json({ status: 'pending' });
  } catch (erro) {
    console.error('Erro na API status-pagamento:', erro);
    return NextResponse.json({ status: 'pending', error: 'Erro interno' });
  }
}