'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link'; // Adicionado
import { useCart } from '@/context/CartContext';

export default function AmplifierCard({ produto }) {
  const { addToCart } = useCart();
  const [prazo, setPrazo] = useState(null);

  useEffect(() => {
    fetch('/api/estoque')
      .then((r) => r.json())
      .then((estoque) => {
        const info = estoque[String(produto?.id)];
        if (info) setPrazo(info);
      })
      .catch(() => {});
  }, [produto?.id]);

  if (!produto) return null;

  const { nome, categoria, descricao, pastaImagens } = produto;
  
  // Convenção única de imagens do projeto: 1.png a 6.png dentro de
  // /img/<pastaImagens>/ — a mesma usada na página de detalhe do produto.
  // (Antes este componente usava HeroShot.png/BackPanel.png/etc,
  // incompatível com a página de detalhe — unificado aqui.)
  const imagens = ['1.png', '2.png', '3.png', '4.png'];
  const [index, setIndex] = useState(0);

  const getCor = () => {
    switch(categoria) {
      case "Kunumi": return "text-tupaMarrom";
      case "Guitarra": return "text-tupaBege";
      case "Baixo": return "text-tupaVerdeMusgo";
      default: return "text-tupaGold";
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % imagens.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border border-tupaWood bg-tupaGrey p-6 rounded-lg transition-all hover:border-tupaGold group shadow-lg flex flex-col h-full">
      
      {/* Container da Imagem (AGORA CLICÁVEL) */}
      <div className="h-64 mb-6 rounded overflow-hidden relative border border-tupaWood/50">
        <Link href={`/loja/${produto.id}`}>
          <img 
            src={`/img/${pastaImagens}/${imagens[index]}`} 
            alt={nome} 
            className="w-full h-full object-cover transition-all duration-700 ease-in-out cursor-pointer hover:scale-105 hover:opacity-90"
            onError={(e) => {
              e.target.onerror = null; // evita loop se o placeholder também faltar
              e.target.src = '/img/placeholder-produto.png'; // mesmo arquivo usado no checkout (OtimizadaImagem)
            }}
          />
        </Link>
        
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 pointer-events-none">
          {imagens.map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-colors ${index === i ? 'bg-tupaGold' : 'bg-white/50'}`} 
            />
          ))}
        </div>
      </div>

      {/* Informações do Produto */}
      <h3 className={`text-2xl font-serif mb-3 ${getCor()}`}>
        {nome}
      </h3>
      <p className="text-tupaOffWhite text-sm mb-3 leading-relaxed flex-grow">
        {descricao}
      </p>

      {prazo && (
        <p className="text-xs mb-4">
          {prazo.estoque > 0 ? (
            <span className="text-tupaVerdeMusgo font-bold">
              ✓ Peça pré-fabricada — pronto em até {prazo.prazoComEstoque} dias
            </span>
          ) : (
            <span className="text-tupaSilver">
              Sob encomenda — prazo de até {prazo.prazoSobEncomenda} dias
            </span>
          )}
        </p>
      )}
      
      {/* Botões de Ação */}
      <div className="mt-auto space-y-3">
        <button 
          onClick={() => addToCart(produto)}
          className="w-full text-center bg-tupaBlack text-tupaGold border border-tupaGold py-2 rounded hover:bg-tupaGold hover:text-tupaBlack transition-colors uppercase font-bold text-sm tracking-widest"
        >
          Adicionar ao Carrinho
        </button>
        
        <Link 
          href={`/loja/${produto.id}`} 
          className="block w-full text-center text-tupaSilver text-xs underline hover:text-tupaGold transition-colors"
        >
          Ver detalhes técnicos
        </Link>
      </div>
    </div>
  );
}