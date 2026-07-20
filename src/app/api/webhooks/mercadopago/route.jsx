// src/app/api/webhooks/mercadopago/route.jsx

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
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
    
    const payload = `${ts}\n${xRequestId}`;
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    return crypto.timingSafeEqual(
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
  // ============================================================
  // VALIDAÇÃO DA ASSINATURA (SEGURANÇA) - DESCOMENTE EM PRODUÇÃO
  // ============================================================
 if (!validateMercadoPagoSignature(request)) {
    console.warn('[webhook] Assinatura inválida - rejeitando');
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
  }
  
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  console.log('[webhook mercadopago] recebido');
  
  try {
    // 1. Extrair parâmetros da requisição
    const params = request.nextUrl.searchParams;
    const corpo = await request.json().catch(() => ({}));
    console.log('[webhook mercadopago] query:', Object.fromEntries(params), 'corpo:', corpo);

    // 2. Obter o ID do pagamento
    const paymentId = params.get('data.id') || corpo?.data?.id || params.get('id');
    const tipo = params.get('type') || corpo?.type;

    // 3. Validar se é um pagamento
    if (!paymentId || (tipo && tipo !== 'payment')) {
      console.log('[webhook mercadopago] ignorado — sem paymentId ou tipo diferente de payment. tipo:', tipo);
      return NextResponse.json({ ok: true });
    }

    // 4. Consultar o pagamento na API do Mercado Pago (NUNCA confiar só no que vem na notificação)
    const respostaMP = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
    });
    const pagamento = await respostaMP.json();
    console.log('[webhook mercadopago] status do pagamento:', pagamento.status, 'id:', paymentId);

    // 5. Se a consulta falhar, ainda assim retorna 200 (evita reenvios)
    if (!respostaMP.ok) {
      console.error('[webhook mercadopago] erro ao consultar pagamento na API do MP:', pagamento);
      return NextResponse.json({ ok: true });
    }

    // 6. Se o pagamento foi aprovado, processa o pedido
    if (pagamento.status === 'approved') {
      console.log('[webhook mercadopago] pagamento aprovado, disparando notificações...');
      
      // 6.1 Extrair dados do cliente
      const nomeCliente = pagamento.metadata?.cliente_nome || pagamento.payer?.first_name || 'Cliente';
      const emailCliente = pagamento.metadata?.cliente_email || pagamento.payer?.email;
      const telefoneCliente = pagamento.metadata?.cliente_telefone || '';
      const enderecoCliente = pagamento.metadata?.cliente_endereco || '';

      // 6.2 Extrair itens do pedido
      let itens = [];
      try {
        itens = JSON.parse(pagamento.metadata?.itens_json || '[]');
      } catch {
        itens = [];
      }

      // 6.3 Montar objetos do pedido
      const order = {
        id: pagamento.external_reference || pagamento.id,
        amount: pagamento.transaction_amount,
        items: itens,
      };
      const customer = { 
        name: nomeCliente, 
        email: emailCliente, 
        telefone: telefoneCliente, 
        endereco: enderecoCliente 
      };
      const payment = { 
        id: pagamento.id, 
        status: pagamento.status, 
        payment_method_id: pagamento.payment_method_id 
      };

      // 6.4 Disparar todas as notificações em paralelo
      const resultados = await Promise.allSettled([
        enviarEmailOficina({ order, customer, payment, resend }),
        enviarEmailCliente({ order, customer, resend }),
        enviarWhatsAppOficina({ order, customer, payment }),
        descontarEstoque(order.items),
      ]);

      // 6.5 Log dos resultados
      const nomes = ['email-oficina', 'email-cliente', 'whatsapp-oficina', 'desconto-estoque'];
      resultados.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`[webhook mercadopago] falhou: ${nomes[i]}:`, r.reason);
        } else {
          console.log(`[webhook mercadopago] ok: ${nomes[i]}`);
        }
      });
    }

    // 7. SEMPRE retornar 200 OK
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Erro no webhook do Mercado Pago:', error);
    // Sempre responde 200 — se devolvermos erro, o Mercado Pago fica
    // reenviando a mesma notificação repetidamente.
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
  if (!process.env.CALLMEBOT_PHONE || !process.env.CALLMEBOT_APIKEY) {
    console.warn('[webhook mercadopago] whatsapp pulado: CALLMEBOT_PHONE ou CALLMEBOT_APIKEY ausente');
    return;
  }

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
  
  if (!token || !baseId) {
    console.warn('[webhook mercadopago] desconto-estoque pulado: AIRTABLE_TOKEN ou AIRTABLE_BASE_ID ausente');
    return;
  }

  for (const item of itens) {
    // Pula itens sem ID (ex: frete)
    if (!item.id) continue;

    try {
      // 1) Busca o produto pelo ProdutoID no Airtable
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

      // 2) Calcula o novo estoque (nunca negativo)
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
      
      console.log(`[webhook] Estoque atualizado: ${item.title} (${estoqueAtual} → ${novoEstoque})`);
      
    } catch (erro) {
      console.error(`Erro ao descontar estoque do produto ${item.id}:`, erro);
      // Continua tentando os outros itens mesmo se um falhar
    }
  }
}