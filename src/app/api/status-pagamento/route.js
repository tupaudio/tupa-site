import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// =========================================================
// TUPÃ ÁUDIO — Consulta de status de pagamento
// Usada pela página /pendente pra checar, a cada poucos segundos,
// se o Pix já foi aprovado — sem precisar do cliente atualizar a
// página ou depender só do e-mail.
// =========================================================

export async function GET(request) {
  const paymentId = request.nextUrl.searchParams.get('payment_id');

  if (!paymentId) {
    return NextResponse.json({ error: 'payment_id é obrigatório' }, { status: 400 });
  }

  try {
    const resposta = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
    });
    const pagamento = await resposta.json();

    if (!resposta.ok) {
      return NextResponse.json({ status: 'desconhecido' });
    }

    return NextResponse.json({ status: pagamento.status });
  } catch (erro) {
    return NextResponse.json({ status: 'desconhecido' });
  }
}