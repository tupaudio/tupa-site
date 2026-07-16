// ✅ versão robusta com @react-email/components
import { Html, Head, Body, Preview, Heading, Text, Section } from '@react-email/components';

export default function OrderConfirmation({ order, customer }) {
  const customerName = customer?.name || 'Cliente';
  const valorFormatado = Number(order?.amount).toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL'
  });

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Seu pedido na Tupã Áudio foi confirmado!</Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', color: '#111' }}>
        <Section>
          <Heading>Confirmação do pedido — Tupã Áudio</Heading>
          <Text>Olá {customerName},</Text>
          <Text>Recebemos o pagamento e seu pedido foi confirmado.</Text>
          <Text><strong>Pedido:</strong> {order?.id}</Text>
          <Text><strong>Valor:</strong> {valorFormatado}</Text>
          {order?.items?.length > 0 && (
            <Section>
              <Text><strong>Itens:</strong></Text>
              <ul>
                {order.items.map((it, i) => (
                  <li key={i}>{it.title} x{it.quantity || 1}</li>
                ))}
              </ul>
            </Section>
          )}
          <Text>Em breve sua encomenda será preparada para envio.</Text>
          <Text>Obrigado por comprar na Tupã Áudio.</Text>
        </Section>
      </Body>
    </Html>
  );
}
