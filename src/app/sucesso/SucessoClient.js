'use client';

import { useSearchParams } from 'next/navigation';

export default function SucessoClient() {
  const params = useSearchParams();
  const paymentId = params.get('payment_id');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-4xl font-serif text-tupaGold mb-6">Pedido Confirmado!</h1>
      <p className="text-tupaOffWhite mb-4">
        O seu Tupã já está em nossa bancada sendo preparado.
        Receberá as atualizações em breve.
      </p>
      {paymentId && (
        <p className="text-tupaSilver text-sm mb-8">
          Número do pedido: <strong className="text-tupaOffWhite">{paymentId}</strong>
        </p>
      )}
      <a href="/" className="bg-tupaGold text-tupaBlack px-8 py-3 rounded font-bold">
        Voltar para Início
      </a>
    </main>
  );
}
