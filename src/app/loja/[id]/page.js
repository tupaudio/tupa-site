// src/app/loja/[id]/page.js
import { produtos } from '@/data/produtos';
import DetalheProdutoClient from './DetalheProdutoClient';

// Força o Next.js a tentar renderizar a página dinamicamente 
// mesmo se o ID não foi gerado no momento do build
export const dynamicParams = true; 

export default async function ProdutoPage({ params }) {
  // Garante a compatibilidade com o Next.js assíncrono
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  
  // Busca o produto no array
  const produto = produtos.find(p => p.id === id);
  
  // Se realmente não existir o ID (ex: /loja/2 ou /loja/6), exibe o aviso
  if (!produto) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h3>Produto não encontrado</h3>
        <p style={{ marginTop: '1rem' }}> O produto que você procura não está disponível.</p>
        <a href="/loja" style={{ textDecoration: 'underline', display: 'block', marginTop: '1.5rem' }}>
          Voltar para a loja
        </a>
      </div>
    );
  }

  return <DetalheProdutoClient produto={produto} />;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  const produto = produtos.find(p => p.id === id);
  
  if (!produto) {
    return { title: 'Produto não encontrado | Tupã Audio' };
  }

  return {
    title: `${produto.nome} | Tupã Audio`,
    description: produto.descricao,
  };
}