import { NextResponse } from 'next/server';

// =========================================================
// TUPÃ ÁUDIO — Webhook do Mercado Pago
// Recebe a notificação de mudança de status de pagamento,
// confirma o pagamento direto na API do Mercado Pago (nunca
// confiamos só no que chega na notificação) e, se aprovado,
// dispara e-mail pra oficina + cliente e um WhatsApp pra você.
//
// Variáveis de ambiente necessárias (Vercel → Settings → Environment Variables):
//   MERCADO_PAGO_ACCESS_TOKEN → já existe, reaproveitado aqui
//   RESEND_API_KEY            → chave da Resend (envio de e-mail)
//   EMAIL_REMETENTE           → e-mail de onde os avisos saem (ex: pedidos@tupaaudio.com.br)
//   EMAIL_OFICINA             → seu e-mail, recebe aviso de novo pedido
//   CALLMEBOT_PHONE           → seu número de WhatsApp (com DDI, ex: 5527999999999)
//   CALLMEBOT_APIKEY          → chave gerada pelo CallMeBot (veja o passo a passo)
// =========================================================

export async function POST(request) {
  try {
    const params = request.nextUrl.searchParams;
    const corpo = await request.json().catch(() => ({}));

    // O Mercado Pago manda o id do pagamento na query OU no corpo,
    // dependendo do tipo de notificação — cobrimos os dois formatos.
    const paymentId = params.get('data.id') || corpo?.data?.id || params.get('id');
    const tipo = params.get('type') || corpo?.type;

    if (!paymentId || (tipo && tipo !== 'payment')) {
      return NextResponse.json({ ok: true }); // ignora notificações que não são de pagamento
    }

    // Confirma o pagamento direto na API do Mercado Pago (fonte confiável —
    // nunca confie só no conteúdo da notificação recebida)
    const respostaMP = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
    });
    const pagamento = await respostaMP.json();

    if (!respostaMP.ok) {
      return NextResponse.json({ ok: true });
    }

    // Só age quando o pagamento estiver de fato aprovado
    if (pagamento.status === 'approved') {
      const nomeCliente = pagamento.metadata?.cliente_nome || pagamento.payer?.first_name || 'Cliente';
      const emailCliente = pagamento.metadata?.cliente_email || pagamento.payer?.email;
      const itens = pagamento.metadata?.itens_resumo || 'Ver detalhes no painel do Mercado Pago';
      const total = pagamento.transaction_amount;

      await Promise.allSettled([
        enviarEmailOficina({ nomeCliente, emailCliente, itens, total, paymentId }),
        enviarEmailCliente({ nomeCliente, emailCliente, itens, total }),
        enviarWhatsAppOficina({ nomeCliente, itens, total, paymentId }),
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro no webhook do Mercado Pago:', error);
    // Sempre responde 200 — se devolvermos erro, o Mercado Pago fica
    // reenviando a mesma notificação repetidamente.
    return NextResponse.json({ ok: true });
  }
}

async function enviarEmailOficina({ nomeCliente, emailCliente, itens, total, paymentId }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_OFICINA) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_REMETENTE,
      to: process.env.EMAIL_OFICINA,
      subject: `🔨 Novo pedido pago — ${nomeCliente}`,
      html: `
        <h2>Novo pedido aprovado!</h2>
        <p><strong>Cliente:</strong> ${nomeCliente} (${emailCliente || 'sem e-mail'})</p>
        <p><strong>Itens:</strong> ${itens}</p>
        <p><strong>Total:</strong> R$ ${Number(total).toFixed(2)}</p>
        <p><strong>ID do pagamento (Mercado Pago):</strong> ${paymentId}</p>
      `,
    }),
  });
}

async function enviarEmailCliente({ nomeCliente, emailCliente, itens, total }) {
  if (!process.env.RESEND_API_KEY || !emailCliente) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_REMETENTE,
      to: emailCliente,
      subject: 'Seu pedido na Tupã Áudio foi confirmado 🎸',
      html: `
        <h2>Obrigado pela compra, ${nomeCliente}!</h2>
        <p>Recebemos seu pagamento e seu pedido já entrou na fila da nossa bancada.</p>
        <p><strong>Itens:</strong> ${itens}</p>
        <p><strong>Total:</strong> R$ ${Number(total).toFixed(2)}</p>
        <p>Em breve você recebe atualizações sobre a produção e o envio.</p>
      `,
    }),
  });
}

async function enviarWhatsAppOficina({ nomeCliente, itens, total, paymentId }) {
  if (!process.env.CALLMEBOT_PHONE || !process.env.CALLMEBOT_APIKEY) return;

  const texto = encodeURIComponent(
    `🔨 Novo pedido pago!\nCliente: ${nomeCliente}\nItens: ${itens}\nTotal: R$ ${Number(total).toFixed(2)}\nID MP: ${paymentId}`
  );

  await fetch(
    `https://api.callmebot.com/whatsapp.php?phone=${process.env.CALLMEBOT_PHONE}&text=${texto}&apikey=${process.env.CALLMEBOT_APIKEY}`
  );
}