import React from 'react';

export default function WorkshopNotification({ order, customer, payment }) {
  const customerName = customer?.first_name || customer?.name || '';
  return (
    <html>
      <body style={{ fontFamily: 'Arial, sans-serif', color: '#111' }}>
        <h1>Novo pedido aprovado — Tupã Oficina</h1>
        <p>Pedido ID: <strong>{order?.id}</strong></p>
        <p>Cliente: {customerName} &lt;{customer?.email}&gt;</p>
        <p>Valor total: R$ {order?.amount}</p>
        {order?.items?.length > 0 && (
          <div>
            <p><strong>Itens:</strong></p>
            <ul>
              {order.items.map((it, i) => (
                <li key={i}>{it.title} x{it.quantity || 1}</li>
              ))}
            </ul>
          </div>
        )}
        <p>Dados do pagamento (resumo):</p>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify({ id: payment?.id, status: payment?.status, payment_method: payment?.payment_method_id }, null, 2)}</pre>
        <p>Por favor, procedam com a montagem e envio do amplificador.</p>
      </body>
    </html>
  );
}
