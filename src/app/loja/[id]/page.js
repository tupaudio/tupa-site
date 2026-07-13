"use client";
import CalculadoraFrete from '@/components/CalculadoraFrete'; // Ajuste o caminho se necessário
import { produtos } from '../../../data/produtos';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/context/CartContext'; // Importação do contexto

export default function DetalheProduto() {
  const params = useParams();
  const id = params.id;
  const { addToCart } = useCart(); // Hook para adicionar ao carrinho
  
  // Busca o produto pelo ID
  const produto = produtos.find(p => String(p.id) === String(id));
  
  const [imgSelecionada, setImgSelecionada] = useState(1);

  if (!produto) {
    return (
      <div className="min-h-screen flex items-center justify-center text-tupaGold">
        <h1 className="text-2xl">Produto não encontrado.</h1>
      </div>
    );
  }

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
              <img src={`/img/${produto.pastaImagens}/${n}.png`} className="w-full h-16 object-cover hover:opacity-75 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Coluna 2: Informações Técnicas */}
      <div className="flex flex-col">
        <h1 className="text-4xl font-serif text-tupaGold mb-6 uppercase tracking-widest">
          {produto.nome}
        </h1>
        
        {/* Especificações */}
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

            <button 
              onClick={() => addToCart(produto)}
              className="w-full text-center bg-tupaGold text-tupaBlack py-3 rounded hover:bg-white transition-colors uppercase font-bold tracking-widest text-lg"
              >
                Adicionar ao Carrinho
            </button>

{/* NOVA CALCULADORA DE FRETE AQUI */}
<CalculadoraFrete itens={[{ ...produto, quantidade: 1 }]} />
        {/* Detalhes Técnicos */}
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