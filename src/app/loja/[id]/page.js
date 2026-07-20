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
  const params = await props.props ? await props.props.params : await props.params;
  const id = parseInt(params?.id, 10);
  
  const produto = produtos.find(p => p.id === id);
  
  if (!produto) {
    return { title: 'Produto não encontrado | Tupã Audio' };
  }

  return {
    title: `${produto.nome} | Tupã Audio`,
    description: produto.descricao || '',
  };
}