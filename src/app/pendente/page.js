// src/app/pendente/page.js
'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PendenteConteudo() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
  const [status, setStatus] = useState('checking');
  const [tentativas, setTentativas] = useState(0);

  useEffect(() => {
    if (!paymentId) {
      setStatus('error');
      return;
    }

    // Primeiro, verifica imediatamente
    verificarStatus();

    // Depois, configura o intervalo
    const intervalo = setInterval(() => {
      verificarStatus();
    }, 3000); // A cada 3 segundos

    return () => clearInterval(intervalo);
  }, [paymentId]);

  const verificarStatus = async () => {
    try {
      const res = await fetch(`/api/status-pagamento?payment_id=${paymentId}`);
      const data = await res.json();

      setTentativas(t => t + 1);

      if (data.status === 'approved') {
        setStatus('approved');
        // Redireciona para a página de sucesso após 1 segundo
        setTimeout(() => {
          router.push(`/sucesso?payment_id=${paymentId}`);
        }, 1000);
        return;
      } else if (data.status === 'rejected' || data.status === 'cancelled') {
        setStatus('rejected');
        setTimeout(() => {
          router.push(`/falha?payment_id=${paymentId}`);
        }, 1000);
        return;
      } else if (data.status === 'pending' || data.status === 'in_process') {
        setStatus('pending');
      } else {
        setStatus('unknown');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setStatus('error');
    }
  };

  const cansouDeEsperar = tentativas > 40; // ~2 minutos

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <div className="bg-tupaGrey border border-tupaWood rounded-lg p-8 max-w-md w-full">
        <h1 className="text-4xl font-serif text-tupaGold mb-6">Pagamento em Análise</h1>
        
        {status === 'pending' && (
          <>
            <p className="text-tupaOffWhite mb-8">
              Recebemos o seu pedido! Estamos aguardando a compensação do pagamento.
              {!cansouDeEsperar && ' Assim que aprovar, você será redirecionado automaticamente.'}
            </p>
            
            {!cansouDeEsperar ? (
              <div className="flex items-center justify-center gap-3 text-tupaSilver text-sm">
                <span className="w-3 h-3 border-2 border-tupaGold border-t-transparent rounded-full animate-spin" />
                Verificando pagamento...
              </div>
            ) : (
              <div className="bg-tupaBlack p-4 rounded border border-tupaWood/30">
                <p className="text-sm text-tupaSilver">
                  Está demorando mais que o normal. Não se preocupe — assim que aprovar, você recebe um
                  e-mail de confirmação. Se tiver dúvidas, fale conosco pelo WhatsApp.
                </p>
                <button
                  onClick={() => verificarStatus()}
                  className="mt-4 bg-tupaGold text-tupaBlack px-6 py-2 rounded font-bold hover:bg-white transition-colors"
                >
                  Verificar agora
                </button>
              </div>
            )}
          </>
        )}

        {status === 'approved' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-serif text-tupaGold mb-2">Pagamento confirmado!</h2>
            <p className="text-tupaSilver">Redirecionando para a página de sucesso...</p>
          </>
        )}

        {status === 'rejected' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-2xl font-serif text-red-400 mb-2">Pagamento não aprovado</h2>
            <p className="text-tupaSilver mb-4">O pagamento foi recusado ou cancelado.</p>
            <a href="/carrinho" className="inline-block bg-tupaGold text-tupaBlack px-6 py-2 rounded font-bold hover:bg-white transition-colors">
              Voltar ao carrinho
            </a>
          </>
        )}

        {(status === 'error' || status === 'unknown') && (
          <>
            <p className="text-tupaSilver mb-6">Não foi possível verificar o status do pagamento.</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => verificarStatus()}
                className="bg-tupaGold text-tupaBlack px-6 py-2 rounded font-bold hover:bg-white transition-colors"
              >
                Tentar novamente
              </button>
              <a href="/" className="text-tupaGold hover:underline">
                Voltar para a loja
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Pendente() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-tupaGold">Carregando...</div>
      </div>
    }>
      <PendenteConteudo />
    </Suspense>
  );
}