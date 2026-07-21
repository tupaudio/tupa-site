// src/app/loja/[id]/not-found.js
import Link from 'next/link';

export default function ProdutoNaoEncontrado() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-4xl font-serif text-tupaGold mb-4">Produto não encontrado</h1>
      <p className="text-tupaSilver mb-8 max-w-md">
        O produto que você está procurando pode ter sido descontinuado ou removido do catálogo.
      </p>
      <Link 
        href="/loja" 
        className="bg-tupaGold text-tupaBlack px-6 py-3 rounded font-bold hover:bg-white transition-colors"
      >
        Ver todos os produtos
      </Link>
    </div>
  );
}