'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PendenteConteudo() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
  const [tentativas, setTentativas] = useState(0);

  useEffect(() => {
    if (!paymentId) return;

    const intervalo = setInterval(async () => {
      try {
        const res = await fetch(`/api/status-pagamento?payment_id=${paymentId}`);
        const data = await res.json();

        if (data.status === 'approved') {
          clearInterval(intervalo);
          router.push(`/sucesso?payment_id=${paymentId}`);
        } else if (data.status === 'rejected' || data.status === 'cancelled') {
          clearInterval(intervalo);
          router.push(`/falha?payment_id=${paymentId}`);
        }
      } catch {
        // Se der erro na consulta, só tenta de novo no próximo ciclo
      }
      setTentativas((t) => t + 1);
    }, 4000);

    return () => clearInterval(intervalo);
  }, [paymentId, router]);

  const cansouDeEsperar = tentativas > 30; // ~2 minutos

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-4xl font-serif text-tupaGold mb-6">Pagamento em Análise</h1>
      <p className="text-tupaOffWhite mb-8 max-w-md">
        Recebemos o seu pedido! Estamos aguardando a compensação do pagamento pelo Mercado Pago.
        {!cansouDeEsperar && ' Assim que aprovar, esta página leva você automaticamente pra confirmação.'}
      </p>

      {!cansouDeEsperar ? (
        <div className="flex items-center gap-3 text-tupaSilver text-sm">
          <span className="w-3 h-3 border-2 border-tupaGold border-t-transparent rounded-full animate-spin" />
          Verificando pagamento...
        </div>
      ) : (
        <div className="bg-tupaGrey p-6 rounded border border-tupaWood">
          <p className="text-sm text-tupaSilver">
            Está demorando mais que o normal. Não se preocupe — assim que aprovar, você recebe um
            e-mail de confirmação. Se tiver dúvidas, fale conosco pelo WhatsApp.
          </p>
        </div>
      )}

      <a href="/" className="mt-8 text-tupaGold underline">Voltar para o site</a>
    </main>
  );
}

export default function Pendente() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center text-tupaGold">Carregando...</main>}>
      <PendenteConteudo />
    </Suspense>
  );
}