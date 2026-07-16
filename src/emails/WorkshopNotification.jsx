import { Html, Head, Body, Preview, Heading, Text, Section } from '@react-email/components';

export default function WorkshopNotification({ order, customer, payment }) {
  const customerName = customer?.name || 'Cliente';
  const valorFormatado = Number(order?.amount).toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL'
  });

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Novo pedido aprovado — {customerName}</Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', color: '#111' }}>
        <Section>
          <Heading>Novo pedido aprovado — Tupã Oficina</Heading>

          <Text><strong>Pedido ID:</strong> {order?.id}</Text>
          <Text><strong>Cliente:</strong> {customerName} &lt;{customer?.email}&gt;</Text>
          <Text><strong>Telefone:</strong> {customer?.telefone || 'não informado'}</Text>
          <Text><strong>Endereço:</strong> {customer?.endereco || 'não informado'}</Text>
          <Text><strong>Valor total:</strong> {valorFormatado}</Text>

          {order?.items?.length > 0 && (
            <Section>
              <Text><strong>Itens do pedido:</strong></Text>
              <ul>
                {order.items.map((it, i) => (
                  <li key={i}>{it.title} x{it.quantity || 1}</li>
                ))}
              </ul>
            </Section>
          )}

          <Text><strong>Dados do pagamento:</strong></Text>
          <Text>ID MP: {payment?.id}</Text>
          <Text>Status: {payment?.status}</Text>
          <Text>Método: {payment?.payment_method_id}</Text>

          <Text>Por favor, procedam com a montagem e envio do amplificador.</Text>
        </Section>
      </Body>
    </Html>
  );
}
