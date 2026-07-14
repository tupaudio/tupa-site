import { produtos } from '@/data/produtos';
import { notFound } from 'next/navigation';
import DetalheProdutoClient from './DetalheProdutoClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const produto = produtos.find(p => String(p.id) === String(id));

  if (!produto) return {};

  return {
    title: `${produto.nome} — Tupã Áudio`,
    description: produto.descricao,
    openGraph: {
      title: produto.nome,
      description: produto.descricao,
      images: [`/img/${produto.pastaImagens}/1.png`],
    },
  };
}

// Gera as páginas de todos os produtos em tempo de build (melhor
// performance e SEO do que buscar tudo em runtime no navegador).
export async function generateStaticParams() {
  return produtos.map((p) => ({ id: String(p.id) }));
}

export default async function Page({ params }) {
  const { id } = await params;
  const produto = produtos.find(p => String(p.id) === String(id));

  if (!produto) notFound();

  return <DetalheProdutoClient produto={produto} />;
}