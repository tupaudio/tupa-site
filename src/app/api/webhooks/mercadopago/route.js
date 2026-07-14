import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import Resend from 'resend';
import { render } from '@react-email/render';
import OrderConfirmation from '@/emails/OrderConfirmation';
import WorkshopNotification from '@/emails/WorkshopNotification';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
const paymentClient = new Payment(client);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const topic = body.topic || body.type || null;
    const dataId = body.id || body.data?.id || body['data.id'] || body.data?.resource?.id;

    if (!dataId) {
      console.warn('Webhook Mercado Pago sem id de pagamento:', body);
      return NextResponse.json({ received: true }, { status: 400 });
    }

    const paymentResult = await paymentClient.get({ id: dataId.toString() });
    const payment = paymentResult.response || paymentResult;
    const status = payment?.status;

    console.info('Mercado Pago webhook recebido:', { id: dataId, status, topic });

    if (status === 'approved') {
      try {
        const customerEmail = payment?.payer?.email;
        const order = {
          id: payment?.id,
          amount: payment?.transaction_amount,
          items: payment?.additional_info?.items || [],
        };

        if (customerEmail) {
          const htmlCustomer = render(<OrderConfirmation order={order} customer={payment?.payer} />);
          await resend.emails.send({
            from: process.env.TUPA_EMAIL_FROM || 'Tupã Áudio <no-reply@tupaaudio.com>',
            to: customerEmail,
            subject: `Confirmação do pedido ${order.id}`,
            html: htmlCustomer,
          });
        }

        const workshopEmail = process.env.TUPA_WORKSHOP_EMAIL || 'oficina@tupaaudio.com';
        const htmlWorkshop = render(<WorkshopNotification order={order} customer={payment?.payer} payment={payment} />);
        await resend.emails.send({
          from: process.env.TUPA_EMAIL_FROM || 'Tupã Áudio <no-reply@tupaaudio.com>',
          to: workshopEmail,
          subject: `Novo pedido aprovado ${order.id}`,
          html: htmlWorkshop,
        });

        console.info('E-mails enviados (cliente e oficina) para pagamento aprovado', { id: dataId });
      } catch (sendError) {
        console.error('Erro ao enviar e-mails do webhook:', sendError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook Mercado Pago:', error);
    return NextResponse.json({ error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
