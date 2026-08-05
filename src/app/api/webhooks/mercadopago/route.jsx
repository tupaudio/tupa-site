// src/app/api/webhooks/mercadopago/route.jsx

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createHmac, timingSafeEqual } from 'crypto';
import OrderConfirmation from '@/emails/OrderConfirmation';
import WorkshopNotification from '@/emails/WorkshopNotification';

// ============================================================
// VALIDAÇÃO DA ASSINATURA DO WEBHOOK (SEGURANÇA)
// ============================================================
function validateMercadoPagoSignature(request) {
  const xSignature = request.headers.get('x-signature');
  const xRequestId = request.headers.get('x-request-id');

  if (!xSignature || !xRequestId) {
    console.warn('[webhook] Sem assinatura - pode ser teste local');
    return true; // Em produção, retorne false
  }

  try {
    const parts = xSignature.split(',');
    let ts = null;
    let sig = null;

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 'ts') ts = value;
      if (key === 'v1') sig = value;
    }

    if (!ts || !sig) {
      console.warn('[webhook] Assinatura incompleta');
      return false;
    }

    const timestamp = parseInt(ts, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      console.warn('[webhook] Timestamp muito antigo');
      return false;
    }

    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    if (!secret) {
      console.warn('[webhook] MERCADO_PAGO_WEBHOOK_SECRET não configurado');
      return true; // Em produção, retorne false
    }

    // IMPORTANTE: "crypto" já vem importado no topo do arquivo.
    // require('crypto') NÃO funciona no Cloudflare Workers e
    // derrubava essa validação silenciosamente (retornando false
    // e bloqueando o webhook inteiro antes de chegar nos e-mails).
    const payload = `${ts}\n${xRequestId}`;
    const hmac = createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    return timingSafeEqual(
      Buffer.from(sig, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('[webhook] Erro na validação da assinatura:', error);
    return false;
  }
}

// ============================================================
// WEBHOOK PRINCIPAL
// ============================================================
export async function POST(request) {
  if (!validateMercadoPagoSignature(request)) {
    console.warn('[webhook] Assinatura inválida - rejeitando');
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
  }

  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  console.log('[webhook mercadopago] recebido');

  try {
    const params = request.nextUrl.searchParams;
    const corpo = await request.json().catch(() => ({}));
    console.log('[webhook mercadopago] query:', Object.fromEntries(params), 'corpo:', corpo);

    const paymentId = params.get('data.id') || corpo?.data?.id || params.get('id');
    const tipo = params.get('type') || corpo?.type;

    if (!paymentId || (tipo && tipo !== 'payment')) {
      console.log('[webhook mercadopago] ignorado — sem paymentId ou tipo diferente de payment. tipo:', tipo);
      return NextResponse.json({ ok: true });
    }

    const respostaMP = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
    });
    const pagamento = await respostaMP.json();
    console.log('[webhook mercadopago] status do pagamento:', pagamento.status, 'id:', paymentId);

    if (!respostaMP.ok) {
      console.error('[webhook mercadopago] erro ao consultar pagamento na API do MP:', pagamento);
      return NextResponse.json({ ok: true });
    }

    if (pagamento.status === 'approved') {
      console.log('[webhook mercadopago] pagamento aprovado, disparando notificações...');

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
      const customer = {
        name: nomeCliente,
        email: emailCliente,
        telefone: telefoneCliente,
        endereco: enderecoCliente,
      };
      const payment = {
        id: pagamento.id,
        status: pagamento.status,
        payment_method_id: pagamento.payment_method_id,
      };

      const resultados = await Promise.allSettled([
        enviarEmailOficina({ order, customer, payment, resend }),
        enviarEmailCliente({ order, customer, resend }),
        enviarWhatsAppOficina({ order, customer, payment }),
        descontarEstoque(order.items),
      ]);

      const nomes = ['email-oficina', 'email-cliente', 'whatsapp-oficina', 'desconto-estoque'];
      resultados.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`[webhook mercadopago] falhou: ${nomes[i]}:`, r.reason);
        } else {
          console.log(`[webhook mercadopago] ok: ${nomes[i]}`);
        }
      });
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Erro no webhook do Mercado Pago:', error);
    return NextResponse.json({ ok: true });
  }
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

async function enviarEmailOficina({ order, customer, payment, resend }) {
  if (!resend || !process.env.EMAIL_OFICINA) {
    console.warn('[webhook mercadopago] email-oficina pulado: RESEND_API_KEY ou EMAIL_OFICINA ausente');
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_REMETENTE,
    to: process.env.EMAIL_OFICINA,
    subject: `🔨 Novo pedido pago — ${customer.name}`,
    react: <WorkshopNotification order={order} customer={customer} payment={payment} />,
  });
}

async function enviarEmailCliente({ order, customer, resend }) {
  if (!resend || !customer.email) {
    console.warn('[webhook mercadopago] email-cliente pulado: RESEND_API_KEY ou e-mail do cliente ausente');
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_REMETENTE,
    to: customer.email,
    subject: 'Seu pedido na Tupã Áudio foi confirmado 🎸',
    react: <OrderConfirmation order={order} customer={customer} />,
  });
}

async function enviarWhatsAppOficina({ order, customer, payment }) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_APIKEY;

  if (!phone) {
    console.warn('[webhook] CALLMEBOT_PHONE não configurado');
    return;
  }
  if (!apiKey) {
    console.warn('[webhook] CALLMEBOT_APIKEY não configurado');
    return;
  }

  const phoneClean = phone.replace(/\D/g, '');
  let phoneFormatted = phoneClean;
  if (!phoneFormatted.startsWith('55')) {
    phoneFormatted = '55' + phoneFormatted;
  }
  console.log(`[webhook] Número formatado para WhatsApp: ${phoneFormatted}`);

  const listaItens = order.items.map((i) => `${i.quantity}x ${i.title}`).join('\n• ');
  const total = Number(order.amount).toFixed(2);

  // Link do painel administrativo removido — não usamos painel/BD por enquanto.
  const mensagem =
`🔨 NOVO PEDIDO PAGO!

👤 Cliente: ${customer.name}
📧 E-mail: ${customer.email || 'não informado'}
📱 Telefone: ${customer.telefone || 'não informado'}

📦 Itens:
• ${listaItens}

💰 Total: R$ ${total}

📦 Endereço: ${customer.endereco || 'não informado'}

🆔 ID do pedido: ${order.id}
🆔 ID do pagamento: ${payment.id}`;

  const textoEncoded = encodeURIComponent(mensagem);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneFormatted}&text=${textoEncoded}&apikey=${apiKey}`;

  console.log(`[webhook] Enviando WhatsApp para ${phoneFormatted}...`);

  try {
    const response = await fetch(url);
    const result = await response.text();
    console.log(`[webhook] Resposta do CallMeBot:`, result);
    if (response.ok) {
      console.log('[webhook] ✅ WhatsApp enviado com sucesso!');
    } else {
      console.error('[webhook] ❌ Erro no CallMeBot:', result);
    }
  } catch (error) {
    console.error('[webhook] ❌ Falha ao enviar WhatsApp:', error.message);
  }
}

async function descontarEstoque(itens) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tabela = process.env.AIRTABLE_TABLE_NAME || 'Produtos';

  if (!token || !baseId) {
    console.warn('[webhook mercadopago] desconto-estoque pulado: AIRTABLE_TOKEN ou AIRTABLE_BASE_ID ausente');
    return;
  }

  for (const item of itens) {
    if (!item.id) continue;

    try {
      const busca = await fetch(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tabela)}?filterByFormula=${encodeURIComponent(`{ProdutoID}='${item.id}'`)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const resultado = await busca.json();
      const registro = resultado.records?.[0];

      if (!registro) {
        console.warn(`[webhook] Produto não encontrado no Airtable: ${item.id}`);
        continue;
      }

      const estoqueAtual = Number(registro.fields?.Estoque) || 0;
      const novoEstoque = Math.max(0, estoqueAtual - (item.quantity || 1));

      await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tabela)}/${registro.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: { Estoque: novoEstoque } }),
      });

      console.log(`[webhook] Estoque atualizado: ${item.title} (${estoqueAtual} → ${novoEstoque})`);

    } catch (erro) {
      console.error(`Erro ao descontar estoque do produto ${item.id}:`, erro);
    }
  }
}
