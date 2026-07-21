// app/sucesso/SucessoClient.js
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SucessoClient() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta pegar o ID da URL (payment_id ou external_reference)
    const paymentId = searchParams.get('payment_id');
    const externalRef = searchParams.get('external_reference');
    
    if (paymentId) {
      setOrderId(paymentId);
      setLoading(false);
      return;
    }
    
    if (externalRef) {
      setOrderId(externalRef);
      setLoading(false);
      return;
    }

    // Se não veio na URL, busca o último pedido
    const fetchLastOrder = async () => {
      try {
        const response = await fetch('/api/status-pagamento?status=approved&limit=1');
        const data = await response.json();
        if (data.external_reference) {
          setOrderId(data.external_reference);
        } else if (data.payment_id) {
          setOrderId(data.payment_id);
        } else {
          setOrderId('TUP-' + Date.now().toString().slice(-6));
        }
      } catch (error) {
        console.error('Erro ao buscar ID do pedido:', error);
        setOrderId('TUP-' + Date.now().toString().slice(-6));
      } finally {
        setLoading(false);
      }
    };

    fetchLastOrder();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tupaBlack">
        <div className="w-12 h-12 border-4 border-tupaGold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tupaBlack text-tupaOffWhite p-6">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Ícone de sucesso */}
        <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-serif text-tupaGold">🎸 Pedido Confirmado!</h1>
        
        <p className="text-tupaSilver text-lg">
          Seu pedido foi recebido e está sendo processado.
        </p>

        {/* ID do pedido */}
        <div className="bg-tupaGrey border border-tupaWood/30 rounded-lg p-4 space-y-2">
          <p className="text-sm text-tupaSilver">Número do pedido:</p>
          <p className="text-2xl font-bold text-tupaGold font-mono tracking-wider">
            #{orderId}
          </p>
          <p className="text-xs text-tupaSilver/60">
            Guarde este número para futuras referências
          </p>
        </div>

        <div className="bg-tupaGrey border border-tupaWood/30 rounded-lg p-4 text-left space-y-1 text-sm">
          <p className="text-tupaSilver">📧 <span className="text-tupaGold">E-mail de confirmação</span> enviado para seu e-mail.</p>
          <p className="text-tupaSilver">📦 <span className="text-tupaGold">Prazo de produção:</span> 30 a 60 dias úteis</p>
          <p className="text-tupaSilver">🚚 <span className="text-tupaGold">Entrega:</span> Você receberá o código de rastreio por e-mail.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link 
            href="/loja" 
            className="flex-1 bg-tupaGold text-tupaBlack px-6 py-3 rounded font-bold hover:bg-white transition-colors"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  );
}