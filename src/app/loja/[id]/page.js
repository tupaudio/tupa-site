// src/app/loja/[id]/page.js
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { produtos } from '@/data/produtos';
import AdicionarAoCarrinho from '@/components/AdicionarAoCarrinho';

// =========================================================
// METADADOS DINÂMICOS PARA SEO
// =========================================================
export async function generateMetadata({ params }) {
  const produto = produtos.find(p => p.id === parseInt(params.id));
  
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
  const produto = produtos.find(p => p.id === parseInt(params.id));
  
  if (!produto) {
    notFound();
  }

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-10">
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
        {/* Imagem do Produto - Otimizada com next/image */}
        <div className="relative aspect-square bg-tupaGrey border border-tupaWood rounded-lg overflow-hidden">
          <Image
            src={`/img/${produto.pastaImagens}/1.png`}
            alt={produto.nome}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={false}
            quality={85}
          />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-serif text-tupaGold">{produto.nome}</h1>
          <p className="text-2xl font-bold text-tupaOffWhite">
            {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          
          <div className="prose prose-invert prose-tupaGold">
            <p className="text-tupaOffWhite">{produto.descricao}</p>
          </div>

          <AdicionarAoCarrinho produto={produto} />
        </div>
      </div>
    </main>
  );
}