"use client";
import CalculadoraFrete from '@/components/CalculadoraFrete';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export default function DetalheProdutoClient({ produto }) {
  const { addToCart } = useCart();
  const [imgSelecionada, setImgSelecionada] = useState(1);
  const [prazo, setPrazo] = useState(null);

  useEffect(() => {
    fetch('/api/estoque')
      .then((r) => r.json())
      .then((estoque) => {
        const info = estoque[String(produto.id)];
        if (info) setPrazo(info);
      })
      .catch(() => {});
  }, [produto.id]);

  return (
    <main className="max-w-6xl mx-auto p-10 grid md:grid-cols-2 gap-12 text-tupaOffWhite font-sans">

      {/* Coluna 1: Galeria de Imagens */}
      <div className="space-y-4">
        <img
          src={`/img/${produto.pastaImagens}/${imgSelecionada}.png`}
          alt={produto.nome}
          className="w-full h-96 object-cover rounded border border-tupaWood shadow-2xl"
        />
        <div className="grid grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button key={n} onClick={() => setImgSelecionada(n)} className="border border-tupaWood rounded overflow-hidden">
              <img
                src={`/img/${produto.pastaImagens}/${n}.png`}
                alt={`${produto.nome} — foto ${n}`}
                className="w-full h-16 object-cover hover:opacity-75 transition-opacity"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Coluna 2: Informações Técnicas */}
      <div className="flex flex-col">
        <h1 className="text-4xl font-serif text-tupaGold mb-6 uppercase tracking-widest">
          {produto.nome}
        </h1>

        <div className="bg-tupaGrey p-6 rounded border border-tupaWood mb-6 shadow-md">
          <h2 className="text-tupaGold font-bold mb-4 uppercase text-xs tracking-wider border-b border-tupaWood pb-2">
            Especificações Técnicas
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><strong>Tecnologia:</strong> {produto.tecnologia}</p>
            <p><strong>Potência:</strong> {produto.especificacoes?.potencia || 'N/A'}</p>
            <p><strong>Entradas:</strong> {produto.especificacoes?.entradasSaidas || 'N/A'}</p>
            <p><strong>Controles:</strong> {produto.especificacoes?.controles || 'N/A'}</p>
            <p><strong>Peso:</strong> {produto.pesoKg} kg</p>
            <p><strong>Dimensões:</strong> {produto.dimensoes} cm</p>
          </div>
        </div>

        {prazo && (
          <div className={`mb-6 p-4 rounded border ${prazo.estoque > 0 ? 'border-tupaVerdeMusgo bg-tupaVerdeMusgo/10' : 'border-tupaWood bg-tupaGrey'}`}>
            {prazo.estoque > 0 ? (
              <p className="text-tupaVerdeMusgo font-bold text-sm">
                ✓ Peça pré-fabricada disponível — pronto em até {prazo.prazoComEstoque} dias após a compra
              </p>
            ) : (
              <p className="text-tupaSilver text-sm">
                Sob encomenda — montagem do zero, prazo de até {prazo.prazoSobEncomenda} dias após a compra
              </p>
            )}
          </div>
        )}

        <button
          onClick={() => addToCart(produto)}
          className="w-full text-center bg-tupaGold text-tupaBlack py-3 rounded hover:bg-white transition-colors uppercase font-bold tracking-widest text-lg"
        >
          Adicionar ao Carrinho
        </button>

        <CalculadoraFrete itens={[{ ...produto, quantidade: 1 }]} />

        <div className="border-t border-tupaWood pt-8">
          <h2 className="text-2xl font-serif text-tupaGold mb-4">Detalhes Técnicos</h2>
          <p className="leading-relaxed text-tupaSilver text-justify whitespace-pre-line">
            {produto.descricaoLonga}
          </p>
        </div>
      </div>
    </main>
  );
}