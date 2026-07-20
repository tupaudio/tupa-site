// src/app/loja/[id]/page.js
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { produtos } from '@/data/produtos';
import DetalheProdutoClient from './DetalheProdutoClient';

// =========================================================
// METADADOS DINÂMICOS PARA SEO
// =========================================================
export async function generateMetadata({ params }) {
  // Aguarda o params ser resolvido
  const { id } = await params;
  const produto = produtos.find(p => p.id === parseInt(id));
  
  if (!produto) {
    return {
      title: 'Produto não encontrado',
    };
  }

  const descricao = `${produto.nome} - Amplificador valve tone artesanal da Tupã Áudio. ${produto.descricaoCurta || 'Construído sob medida com alma de tubo.'}`;
  const url = `${process.env.SITE_URL || 'https://www.tupaaudio.com.br'}/loja/${produto.id}`;

  return {
    title: produto.nome,
    description: descricao,
    keywords: `${produto.nome}, amplificador valvulado, valve tone, tube amp, amplificador artesanal`,
    openGraph: {
      title: produto.nome,
      description: descricao,
      url: url,
      images: [
        {
          url: `/img/${produto.pastaImagens}/1.png`,
          width: 800,
          height: 800,
          alt: produto.nome,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: produto.nome,
      description: descricao,
      images: [`/img/${produto.pastaImagens}/1.png`],
    },
    alternates: {
      canonical: url,
    },
  };
}

// =========================================================
// COMPONENTE DA PÁGINA
// =========================================================
export default function ProdutoPage({ params }) {
  // Aguarda o params ser resolvido (Next.js 15+)
  const { id } = params;
  const produto = produtos.find(p => p.id === parseInt(id));
  
  // Se não encontrar o produto, retorna 404
  if (!produto) {
    notFound();
  }

  // Usa o componente cliente para a parte interativa
  return <DetalheProdutoClient produto={produto} />;
}