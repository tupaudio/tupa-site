'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function AdicionarAoCarrinho({ produto }) {
  const { addToCart } = useCart();
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);

  const handleAdicionar = () => {
    addToCart({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: quantidade,
      pastaImagens: produto.pastaImagens,
    });
    
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 3000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-tupaSilver text-sm">Quantidade:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
            className="w-8 h-8 border border-tupaWood rounded hover:border-tupaGold transition-colors text-tupaOffWhite"
          >
            −
          </button>
          <span className="w-8 text-center text-tupaOffWhite">{quantidade}</span>
          <button
            type="button"
            onClick={() => setQuantidade(quantidade + 1)}
            className="w-8 h-8 border border-tupaWood rounded hover:border-tupaGold transition-colors text-tupaOffWhite"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdicionar}
        className="w-full bg-tupaGold text-tupaBlack py-3 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors"
      >
        {adicionado ? '✓ Adicionado!' : 'Adicionar ao Carrinho'}
      </button>
    </div>
  );
}
