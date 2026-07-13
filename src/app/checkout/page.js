'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const { cart } = useCart();
  const [formData, setFormData] = useState({
    nome: '', doc: '', email: '', telefone: '',
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: ''
  });

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const processarPagamento = async () => {
    // 1. Aqui validamos se os campos obrigatórios estão preenchidos
    // 2. Chamamos a API de checkout passando os dados do formulário
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, cliente: formData }) // Enviamos os dados do cliente
    });
    
    const data = await res.json();
    if (data.init_point) window.location.href = data.init_point;
  };

  return (
    <main className="max-w-4xl mx-auto p-10 text-tupaOffWhite">
      <h1 className="text-3xl font-serif text-tupaGold mb-8 uppercase tracking-widest">Finalizar Encomenda</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Formulário de Faturamento */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-tupaGold mb-4">Dados para Nota Fiscal</h2>
          <input name="nome" placeholder="Nome Completo / Razão Social" onChange={handleChange} className="w-full bg-tupaGrey p-3 rounded" />
          <input name="doc" placeholder="CPF / CNPJ" onChange={handleChange} className="w-full bg-tupaGrey p-3 rounded" />
          <input name="email" placeholder="E-mail" onChange={handleChange} className="w-full bg-tupaGrey p-3 rounded" />
        </section>

        {/* Formulário de Entrega */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-tupaGold mb-4">Endereço de Entrega</h2>
          <input name="cep" placeholder="CEP" onChange={handleChange} className="w-full bg-tupaGrey p-3 rounded" />
          <input name="rua" placeholder="Logradouro" onChange={handleChange} className="w-full bg-tupaGrey p-3 rounded" />
          <div className="flex gap-2">
            <input name="numero" placeholder="Nº" onChange={handleChange} className="w-20 bg-tupaGrey p-3 rounded" />
            <input name="complemento" placeholder="Comp." onChange={handleChange} className="flex-grow bg-tupaGrey p-3 rounded" />
          </div>
        </section>
      </div>

      <button onClick={processarPagamento} className="mt-12 w-full bg-tupaGold text-tupaBlack py-4 font-bold text-lg uppercase rounded">
        Ir para Pagamento
      </button>
    </main>
  );
}