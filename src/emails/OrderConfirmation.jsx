import React from 'react';

export default function OrderConfirmation({ order, customer }) {
  const customerName = customer?.first_name || customer?.name || '';
  return (
    <html>
      <body style={{ fontFamily: 'Arial, sans-serif', color: '#111' }}>
        <h1>Confirmação do pedido — Tupã Áudio</h1>
        <p>Olá {customerName},</p>
        <p>Recebemos o pagamento e seu pedido foi confirmado.</p>
        <p><strong>Pedido:</strong> {order?.id}</p>
        <p><strong>Valor:</strong> R$ {order?.amount}</p>
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
        <p>Em breve sua encomenda será preparada para envio.</p>
        <p>Obrigado por comprar na Tupã Áudio.</p>
      </body>
    </html>
  );
}
