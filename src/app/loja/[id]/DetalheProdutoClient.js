// src/app/loja/[id]/DetalheProdutoClient.js
"use client";
import CalculadoraFrete from '@/components/CalculadoraFrete';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import OtimizadaImagem from '@/components/OtimizadaImagem';
import Link from 'next/link';
import { getImagemProduto } from '@/utils/imagens';

export default function DetalheProdutoClient({ produto }) {
  const { addToCart } = useCart();
  const [imgSelecionada, setImgSelecionada] = useState(1);
  const [prazo, setPrazo] = useState(null);
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    fetch('/api/estoque')
      .then((r) => r.json())
      .then((estoque) => {
        const info = estoque[String(produto.id)];
        if (info) setPrazo(info);
      })
      .catch(() => {});
  }, [produto.id]);

  const handleAdicionarAoCarrinho = () => {
    addToCart({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: quantidade,
      pastaImagens: produto.pastaImagens,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      {/* Breadcrumb para SEO e UX */}
      <nav className="text-sm text-tupaSilver mb-6" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-tupaGold transition-colors">Início</Link>
          </li>
          <li className="text-tupaGold">/</li>
          <li>
            <Link href="/loja" className="hover:text-tupaGold transition-colors">Loja</Link>
          </li>
          <li className="text-tupaGold">/</li>
          <li className="text-tupaGold">{produto.nome}</li>
        </ol>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Coluna 1: Galeria de Imagens */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-tupaGrey border border-tupaWood rounded-lg overflow-hidden">
            <OtimizadaImagem
              src={getImagemProduto(produto, imgSelecionada)}
              alt={produto.nome}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              quality={85}
              fallbackSrc="/img/placeholder-produto.png"
            />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button 
                key={n} 
                onClick={() => setImgSelecionada(n)} 
                className={`border rounded overflow-hidden transition-all ${
                  imgSelecionada === n ? 'border-tupaGold ring-2 ring-tupaGold' : 'border-tupaWood'
                }`}
              >
                <div className="relative aspect-square">
                  <OtimizadaImagem
                    src={getImagemProduto(produto, n)}
                    alt={`${produto.nome} — foto ${n}`}
                    fill
                    className="object-cover hover:opacity-75 transition-opacity"
                    sizes="80px"
                    fallbackSrc="/img/placeholder-produto.png"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Coluna 2: Informações do Produto */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-4xl font-serif text-tupaGold uppercase tracking-widest">
            {produto.nome}
          </h1>
          
          <p className="text-2xl font-bold text-tupaOffWhite">
            {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>

          {/* Especificações Técnicas */}
          <div className="bg-tupaGrey p-6 rounded border border-tupaWood">
            <h2 className="text-tupaGold font-bold mb-4 uppercase text-xs tracking-wider border-b border-tupaWood pb-2">
              Especificações Técnicas
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><strong>Tecnologia:</strong> {produto.tecnologia || 'Valve Tone'}</p>
              <p><strong>Potência:</strong> {produto.especificacoes?.potencia || 'N/A'}</p>
              <p><strong>Entradas:</strong> {produto.especificacoes?.entradasSaidas || 'N/A'}</p>
              <p><strong>Controles:</strong> {produto.especificacoes?.controles || 'N/A'}</p>
              <p><strong>Peso:</strong> {produto.pesoKg || 'N/A'} kg</p>
              <p><strong>Dimensões:</strong> {produto.dimensoes || 'N/A'} cm</p>
            </div>
          </div>

          {/* Prazo de Entrega */}
          {prazo && (
            <div className={`p-4 rounded border ${
              prazo.estoque > 0 
                ? 'border-tupaVerdeMusgo bg-tupaVerdeMusgo/10' 
                : 'border-tupaWood bg-tupaGrey'
            }`}>
              {prazo.estoque > 0 ? (
                <p className="text-tupaVerdeMusgo font-bold text-sm">
                  ✓ Peça pré-fabricada disponível — pronto em até {prazo.prazoComEstoque || 7} dias após a compra
                </p>
              ) : (
                <p className="text-tupaSilver text-sm">
                  Sob encomenda — montagem do zero, prazo de até {prazo.prazoSobEncomenda || 30} dias após a compra
                </p>
              )}
            </div>
          )}

          {/* Seleção de Quantidade */}
          <div className="flex items-center gap-4">
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

          {/* Botão Adicionar ao Carrinho */}
          <button
            onClick={handleAdicionarAoCarrinho}
            className="w-full text-center bg-tupaGold text-tupaBlack py-3 rounded hover:bg-white transition-colors uppercase font-bold tracking-widest text-lg"
          >
            Adicionar ao Carrinho
          </button>

          {/* Calculadora de Frete */}
          <CalculadoraFrete itens={[{ ...produto, quantidade: quantidade }]} />

          {/* Descrição Longa */}
          <div className="border-t border-tupaWood pt-6">
            <h2 className="text-xl font-serif text-tupaGold mb-4">Detalhes Técnicos</h2>
            <p className="leading-relaxed text-tupaSilver text-justify whitespace-pre-line">
              {produto.descricaoLonga || produto.descricao || 'Sem descrição detalhada disponível.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}