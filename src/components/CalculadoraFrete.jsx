//src/app/components/CalculadoraFrete.js
'use client';
import { useState, useEffect } from 'react';

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

  const calcularFrete = async (cepParaCalcular) => {
    const cepLimpo = (cepParaCalcular || cep).replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setErro('Digite um CEP válido com 8 dígitos.');
      return;
    }

    setErro('');
    setCarregando(true);
    setOpcoes([]);
    setSelecionado(null);
    onSelecionar(null);

    try {
      const res = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cepDestino: cepLimpo, itens }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao calcular frete. Tente novamente.');
        return;
      }

      // Monta opções retornadas pelo Melhor Envio + frete local fixo
      const opcoesReais = data.map((t) => ({
        id: String(t.id),
        nome: `${t.company?.name} — ${t.name}`,
        valor: parseFloat(t.price),
        prazo: `${t.delivery_range?.min}–${t.delivery_range?.max} dias úteis`,
      }));

      const freteLocal = {
        id: 'local',
        nome: 'Frete local — a combinar com o fabricante',
        valor: 0,
        prazo: 'A combinar',
      };

      const todasOpcoes = [...opcoesReais, freteLocal];
      setOpcoes(todasOpcoes);

      // Não pré-seleciona nenhuma — cliente escolhe conscientemente
      setSelecionado(null);
      onSelecionar(null);

    } catch (err) {
      console.error('[CalculadoraFrete] Erro:', err);
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Debounce: calcula automaticamente quando o CEP fica completo
  useEffect(() => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    const timer = setTimeout(() => calcularFrete(cep), 600);
    return () => clearTimeout(timer);
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
          onClick={() => calcularFrete(cep)}
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
