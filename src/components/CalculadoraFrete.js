'use client';
import { useState, useEffect } from 'react';

// Simulação de cálculo de frete (substituir pela API real)
const calcularFreteSimulado = (cep, itens) => {
  // Simula diferentes valores de frete baseado no CEP
  const ultimoDigito = parseInt(cep.replace(/\D/g, '').slice(-1)) || 0;
  
  const opcoes = [
    { id: 'sedex', nome: 'Sedex', valor: 25 + (ultimoDigito % 5) * 2, prazo: '2-3 dias' },
    { id: 'pac', nome: 'PAC', valor: 15 + (ultimoDigito % 3) * 3, prazo: '5-7 dias' },
    { id: 'local', nome: 'Frete Local', valor: 0, prazo: '1 dia' },
  ];
  
  // Filtra opções baseado no peso/valor dos itens (simplificado)
  const totalItens = itens.reduce((sum, item) => sum + item.quantidade, 0);
  if (totalItens > 5) {
    opcoes[0].valor += 10; // Sedex mais caro para muitas unidades
  }
  
  return opcoes;
};

export default function CalculadoraFrete({ itens, onSelecionar, cepInicial = '' }) {
  const [cep, setCep] = useState(cepInicial);
  const [opcoes, setOpcoes] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  // Sincroniza com o CEP do endereço principal
  useEffect(() => {
    if (cepInicial && cepInicial !== cep) {
      setCep(cepInicial);
    }
  }, [cepInicial]);

  const handleCalcularFrete = () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setErro('Digite um CEP válido com 8 dígitos.');
      return;
    }

    setErro('');
    setCarregando(true);
    setOpcoes([]);
    setSelecionado(null);
    onSelecionar(null);

    // Simula requisição à API de frete
    setTimeout(() => {
      try {
        const opcoesCalculadas = calcularFreteSimulado(cep, itens);
        setOpcoes(opcoesCalculadas);
        // Seleciona a primeira opção por padrão (frete local se disponível)
        const freteLocal = opcoesCalculadas.find(o => o.id === 'local');
        if (freteLocal) {
          setSelecionado(freteLocal);
          onSelecionar(freteLocal);
        } else if (opcoesCalculadas.length > 0) {
          setSelecionado(opcoesCalculadas[0]);
          onSelecionar(opcoesCalculadas[0]);
        }
        setCarregando(false);
      } catch (err) {
        setErro('Erro ao calcular frete. Tente novamente.');
        setCarregando(false);
      }
    }, 800);
  };

  // Debounce para calcular automaticamente quando o CEP muda
  useEffect(() => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      const timer = setTimeout(() => {
        handleCalcularFrete();
      }, 500); // Debounce de 500ms
      return () => clearTimeout(timer);
    }
  }, [cep]);

  const formatarPreco = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="cep-frete" className="text-xs text-tupaSilver block mb-1">
            Calcular frete pelo CEP
          </label>
          <input
            id="cep-frete"
            type="text"
            inputMode="numeric"
            placeholder="Digite o CEP"
            maxLength={9}
            value={cep}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, '').slice(0, 8);
              if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
              setCep(v);
            }}
            className="w-full bg-tupaBlack border border-tupaWood rounded px-4 py-2 text-tupaOffWhite placeholder-tupaSilver/50 focus:outline-none focus:border-tupaGold transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={handleCalcularFrete}
          disabled={carregando || cep.replace(/\D/g, '').length !== 8}
          className="bg-tupaGold text-tupaBlack px-6 py-2 rounded font-bold hover:bg-white transition-colors disabled:opacity-50 self-end sm:self-auto"
        >
          {carregando ? 'Calculando...' : 'Calcular'}
        </button>
      </div>

      {erro && (
        <p className="text-red-400 text-sm" role="alert" aria-live="assertive">
          {erro}
        </p>
      )}

      {opcoes.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs text-tupaSilver">Opções de frete:</p>
          {opcoes.map((opcao) => (
            <label
              key={opcao.id}
              className={`
                flex items-center justify-between p-3 rounded border cursor-pointer transition-colors
                ${selecionado?.id === opcao.id 
                  ? 'border-tupaGold bg-tupaGold/10' 
                  : 'border-tupaWood/30 hover:border-tupaWood'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="frete"
                  value={opcao.id}
                  checked={selecionado?.id === opcao.id}
                  onChange={() => {
                    setSelecionado(opcao);
                    onSelecionar(opcao);
                  }}
                  className="accent-tupaGold"
                />
                <div>
                  <p className="text-sm text-tupaOffWhite">{opcao.nome}</p>
                  <p className="text-xs text-tupaSilver">Prazo: {opcao.prazo}</p>
                </div>
              </div>
              <span className="text-sm text-tupaGold font-bold">
                {opcao.valor === 0 ? 'Grátis' : formatarPreco(opcao.valor)}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}