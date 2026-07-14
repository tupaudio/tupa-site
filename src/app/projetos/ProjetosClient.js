'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { projetos } from '@/data/projetos';

function ProjetoCard({ projeto, index }) {
  const [imgIndex, setImgIndex] = useState(1);
  const isPar = index % 2 === 0;

  // Antes havia um mapa manual (prefixos) só com 3 projetos hardcoded —
  // qualquer projeto novo quebrava silenciosamente. A página de detalhe
  // do projeto já usa o id direto como prefixo da imagem, então
  // replicamos o mesmo padrão aqui pra manter os dois consistentes.
  const prefixo = projeto.id;

  useEffect(() => {
    const timer = setInterval(() => {
      setImgIndex((prev) => (prev === 3 ? 1 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [projeto.id]);

  return (
    <div className={`flex flex-col ${isPar ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
      <div className="md:w-1/2 space-y-4">
        <h2 className="text-3xl font-serif text-tupaGold">{projeto.nome}</h2>
        <p className="text-tupaSilver text-lg leading-relaxed">{projeto.resumo}</p>
        <Link
          href={`/projetos/${projeto.id}`}
          className="inline-block border border-tupaGold text-tupaGold px-6 py-2 rounded hover:bg-tupaGold hover:text-tupaBlack transition-all font-bold"
        >
          Ver história completa
        </Link>
      </div>

      <div className="md:w-1/2 w-full">
        <div className="h-80 w-full overflow-hidden rounded shadow-2xl border border-tupaWood relative">
          <Link href={`/projetos/${projeto.id}`}>
            <img
              src={`/img/projetos/${prefixo}${imgIndex}.png`}
              alt={projeto.nome}
              className="w-full h-full object-cover transition-all duration-700 cursor-pointer hover:scale-105 hover:opacity-90"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProjetosClient() {
  return (
    <main className="max-w-6xl mx-auto p-10 space-y-24 text-tupaOffWhite">
      <h1 className="text-4xl font-serif text-tupaGold text-center uppercase tracking-widest mb-16">
        Nossos Projetos
      </h1>

      {projetos.map((projeto, index) => (
        <ProjetoCard key={projeto.id} projeto={projeto} index={index} />
      ))}
    </main>
  );
}