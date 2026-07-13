'use client';
import { useState } from 'react';

// 1. Mudamos aqui: agora recebe 'itens' (um array)
export default function CalculadoraFrete({ itens }) {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [opcoes, setOpcoes] = useState(null);
  const [erro, setErro] = useState('');

  const handleCalcular = async (e) => {
    e.preventDefault();
    // Previne erros se a calculadora for carregada sem itens
    if (cep.length < 9 || !itens || itens.length === 0) return;

    setLoading(true);
    setErro('');
    setOpcoes(null);
    
    try {
      const res = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 2. Mudamos aqui: envia os 'itens' para a API
        body: JSON.stringify({ cepDestino: cep, itens }) 
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      if (data.length === 0) throw new Error("Nenhum frete disponível para este CEP.");

      const opcoesFormatadas = data.map(op => ({
        nome: `${op.company.name} - ${op.name}`,
        prazo: `${op.delivery_time} dias úteis`,
        valor: parseFloat(op.price)
      }));

      opcoesFormatadas.sort((a, b) => a.valor - b.valor);
      setOpcoes(opcoesFormatadas);
    } catch (err) {
      setErro("Erro ao calcular o frete. Verifique o CEP.");
    } finally {
      setLoading(false);
    }
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    setCep(value.substring(0, 9));
  };

  return (
    <div className="mt-8 border-t border-tupaWood/40 pt-6">
      <h4 className="text-tupaGold font-serif mb-3 text-lg flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
        Calcular Frete e Prazos
      </h4>
      
      <form onSubmit={handleCalcular} className="flex gap-2">
        <input
          type="text"
          placeholder="Digite seu CEP"
          value={cep}
          onChange={handleCepChange}
          className="flex-grow bg-tupaBlack border border-tupaWood rounded px-4 py-2 text-tupaOffWhite placeholder-tupaSilver/50 focus:outline-none focus:border-tupaGold transition-colors"
        />
        <button
          type="submit"
          disabled={loading || cep.length < 9}
          className="bg-tupaWood text-white px-6 py-2 rounded hover:bg-tupaGold hover:text-tupaBlack transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Buscando...' : 'OK'}
        </button>
      </form>

      {/* Mensagem de Erro */}
      {erro && <p className="text-red-400 text-sm mt-3">{erro}</p>}

      {/* Resultado da Busca */}
      {opcoes && (
        <div className="mt-5 space-y-3 animate-fade-in">
          {opcoes.map((opcao, idx) => (
            <div key={idx} className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded border border-tupaWood/20 hover:border-tupaGold/50 transition-colors">
              <div>
                <p className="font-bold text-tupaOffWhite text-sm">{opcao.nome}</p>
                <p className="text-tupaSilver text-xs mt-1">Prazo estimado: {opcao.prazo}</p>
              </div>
              <p className="text-tupaGold font-bold">
                R$ {opcao.valor.toFixed(2).replace('.', ',')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}