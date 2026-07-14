import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
const paymentClient = new Payment(client);

export async function POST(req) {
  try {
    const body = await req.json();
    const topic = body.topic || body.type || null;
    const dataId = body.id || body.data?.id || body.data?.id || body['data.id'];

    if (!dataId) {
      console.warn('Webhook Mercado Pago sem id de pagamento:', body);
      return NextResponse.json({ received: true }, { status: 400 });
    }

    // Para IPN do Mercado Pago, podemos usar o ID recebido para buscar o pagamento.
    const paymentResult = await paymentClient.get({ id: dataId.toString() });
    const payment = paymentResult.response || paymentResult;
    const status = payment?.status;

    console.info('Mercado Pago webhook recebido:', { id: dataId, status, topic });

    if (status === 'approved') {
      // TODO: enviar e-mail para a oficina e para o cliente.
      // Exemplo de placeholders:
      // await sendEmailToWorkshop({ orderId: dataId, customerEmail: payment?.payer?.email });
      // await sendEmailToCustomer({ email: payment?.payer?.email, orderId: dataId });
      console.info('Pagamento aprovado - disparar e-mails de oficina e cliente.');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook Mercado Pago:', error);
    return NextResponse.json({ error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
