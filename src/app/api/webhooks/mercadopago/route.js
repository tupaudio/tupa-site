import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import OrderConfirmation from '@/emails/OrderConfirmation';
import WorkshopNotification from '@/emails/WorkshopNotification';

// =========================================================
// TUPÃ ÁUDIO — Webhook do Mercado Pago
// Recebe a notificação de mudança de status de pagamento,
// confirma o pagamento direto na API do Mercado Pago (nunca
// confiamos só no que chega na notificação) e, se aprovado,
// dispara e-mail pra oficina + cliente (usando os templates
// React já prontos em src/emails/) e um WhatsApp pra você.
//
// Variáveis de ambiente necessárias (Netlify → Site configuration → Environment variables):
//   MERCADO_PAGO_ACCESS_TOKEN → já existe, reaproveitado aqui
//   RESEND_API_KEY            → chave da Resend (envio de e-mail)
//   EMAIL_REMETENTE           → e-mail de onde os avisos saem (ex: pedidos@tupaaudio.com.br)
//   EMAIL_OFICINA             → seu e-mail, recebe aviso de novo pedido
//   CALLMEBOT_PHONE           → seu número de WhatsApp (com DDI, ex: 5527999999999)
//   CALLMEBOT_APIKEY          → chave gerada pelo CallMeBot
// =========================================================

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
  try {
    const params = request.nextUrl.searchParams;
    const corpo = await request.json().catch(() => ({}));

    const paymentId = params.get('data.id') || corpo?.data?.id || params.get('id');
    const tipo = params.get('type') || corpo?.type;

    if (!paymentId || (tipo && tipo !== 'payment')) {
      return NextResponse.json({ ok: true });
    }

    const respostaMP = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
    });
    const pagamento = await respostaMP.json();

    if (!respostaMP.ok) {
      return NextResponse.json({ ok: true });
    }

    if (pagamento.status === 'approved') {
      const nomeCliente = pagamento.metadata?.cliente_nome || pagamento.payer?.first_name || 'Cliente';
      const emailCliente = pagamento.metadata?.cliente_email || pagamento.payer?.email;
      const telefoneCliente = pagamento.metadata?.cliente_telefone || '';
      const enderecoCliente = pagamento.metadata?.cliente_endereco || '';

      let itens = [];
      try {
        itens = JSON.parse(pagamento.metadata?.itens_json || '[]');
      } catch {
        itens = [];
      }

      const order = {
        id: pagamento.external_reference || pagamento.id,
        amount: pagamento.transaction_amount,
        items: itens,
      };
      const customer = { name: nomeCliente, email: emailCliente, telefone: telefoneCliente, endereco: enderecoCliente };
      const payment = { id: pagamento.id, status: pagamento.status, payment_method_id: pagamento.payment_method_id };

      await Promise.allSettled([
        enviarEmailOficina({ order, customer, payment }),
        enviarEmailCliente({ order, customer }),
        enviarWhatsAppOficina({ order, customer, payment }),
        descontarEstoque(order.items),
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

async function enviarEmailOficina({ order, customer, payment }) {
  if (!resend || !process.env.EMAIL_OFICINA) return;

  await resend.emails.send({
    from: process.env.EMAIL_REMETENTE,
    to: process.env.EMAIL_OFICINA,
    subject: `🔨 Novo pedido pago — ${customer.name}`,
    react: <WorkshopNotification order={order} customer={customer} payment={payment} />,
  });
}

async function enviarEmailCliente({ order, customer }) {
  if (!resend || !customer.email) return;

  await resend.emails.send({
    from: process.env.EMAIL_REMETENTE,
    to: customer.email,
    subject: 'Seu pedido na Tupã Áudio foi confirmado 🎸',
    react: <OrderConfirmation order={order} customer={customer} />,
  });
}

async function enviarWhatsAppOficina({ order, customer, payment }) {
  if (!process.env.CALLMEBOT_PHONE || !process.env.CALLMEBOT_APIKEY) return;

  const listaItens = order.items.map((i) => `${i.quantity}x ${i.title}`).join(', ');
  const texto = encodeURIComponent(
    `🔨 Novo pedido pago!\nCliente: ${customer.name}\nTel: ${customer.telefone || 'não informado'}\nEndereço: ${customer.endereco || 'não informado'}\nItens: ${listaItens}\nTotal: R$ ${Number(order.amount).toFixed(2)}\nID MP: ${payment.id}`
  );

  await fetch(
    `https://api.callmebot.com/whatsapp.php?phone=${process.env.CALLMEBOT_PHONE}&text=${texto}&apikey=${process.env.CALLMEBOT_APIKEY}`
  );
}

async function descontarEstoque(itens) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tabela = process.env.AIRTABLE_TABLE_NAME || 'Produtos';
  if (!token || !baseId) return;

  for (const item of itens) {
    // O item "frete" (e qualquer item sem id) não tem produto no
    // Airtable pra descontar — pula.
    if (!item.id) continue;

    try {
      // 1) Encontra o registro do produto pelo ProdutoID
      const busca = await fetch(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tabela)}?filterByFormula=${encodeURIComponent(`{ProdutoID}='${item.id}'`)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const resultado = await busca.json();
      const registro = resultado.records?.[0];
      if (!registro) continue; // produto não cadastrado no Airtable ainda

      // 2) Calcula o novo estoque (nunca deixa ficar negativo)
      const estoqueAtual = Number(registro.fields?.Estoque) || 0;
      const novoEstoque = Math.max(0, estoqueAtual - (item.quantity || 1));

      // 3) Atualiza o registro
      await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tabela)}/${registro.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: { Estoque: novoEstoque } }),
      });
    } catch (erro) {
      console.error(`Erro ao descontar estoque do produto ${item.id}:`, erro);
      // Continua tentando os outros itens mesmo se um falhar
    }
  }
}