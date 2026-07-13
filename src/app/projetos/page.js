'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { projetos } from '@/data/projetos';

function ProjetoCard({ projeto, index }) {
  const [imgIndex, setImgIndex] = useState(1);
  const isPar = index % 2 === 0;

  // Mapa de prefixos conforme os nomes dos seus arquivos (boitata1.png, iaci1.png...)
  const prefixos = {
    "boitata": "boitata",
    "iaci": "iaci",
    "ara": "ara"
  };

  const prefixo = prefixos[projeto.id];

  // Alterna as 3 imagens a cada 3 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setImgIndex((prev) => (prev === 3 ? 1 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [projeto.id]);

  return (
    <div className={`flex flex-col ${isPar ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
      {/* Texto */}
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

      {/* Card de Imagem Dinâmico (AGORA CLICÁVEL COM EFEITO PREMIUM) */}
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

export default function ProjetosPage() {
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