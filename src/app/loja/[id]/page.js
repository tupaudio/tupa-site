// src/app/loja/[id]/page.js
import { produtos } from '@/data/produtos';
import DetalheProdutoClient from './DetalheProdutoClient';

export const dynamicParams = true;

export default async function ProdutoPage(props) {
  // Resolução mais segura para o params no Next.js 15
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  // Busca o produto no array
  const produto = produtos.find(p => p.id === id);
  
  if (!produto) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h3>Produto não encontrado</h3>
        <a href="/loja" style={{ textDecoration: 'underline', display: 'block', marginTop: '1.5rem' }}>
          Voltar para a loja
        </a>
      </div>
    );
  }

  // Passa o produto blindado para o componente cliente
  return <DetalheProdutoClient produto={produto} />;
}

export async function generateMetadata(props) {
  const params = await props.params;
  const id = parseInt(params?.id, 10);

  const produto = produtos.find(p => p.id === id);

  if (!produto) {
    return { title: 'Produto não encontrado | Tupã Áudio' };
  }

  const titulo = `${produto.nome} | Tupã Áudio`;
  const descricao = produto.descricao || 'Amplificador artesanal Tupã Áudio.';
  
  // ✅ CORRIGIDO: Verifica se pastaImagens existe antes de montar a URL
  const imagem = produto.pastaImagens 
    ? `/img/${produto.pastaImagens}/1.png` 
    : '/img/placeholder-produto.png';

  return {
    title: titulo,
    description: descricao,
    alternates: {
      canonical: `/loja/${produto.id}`,
    },
    openGraph: {
      title: titulo,
      description: descricao,
      url: `/loja/${produto.id}`,
      images: [{ 
        url: imagem, 
        width: 1200, 
        height: 1200, 
        alt: produto.nome 
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descricao,
      images: [imagem],
    },
  };
}