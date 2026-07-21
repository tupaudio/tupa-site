"use client";
import { useState } from 'react';
import { produtos } from '@/data/produtos';
import AmplifierCard from '@/components/AmplifierCard';

export default function LojaClient() {
  const [categoria, setCategoria] = useState('Todos');
  const [tecnologia, setTecnologia] = useState('Todos');

  const categorias = ['Todos', ...new Set(produtos.map(p => p.categoria))];
  const tecnologias = ['Todos', ...new Set(produtos.map(p => p.tecnologia))];

  const filtrados = produtos.filter(p =>
    (categoria === 'Todos' || p.categoria === categoria) &&
    (tecnologia === 'Todos' || p.tecnologia === tecnologia)
  );

  return (
    <div className="min-h-screen bg-tupaBlack p-10">
      <h1 className="text-4xl font-serif text-tupaGold mb-12 text-center uppercase tracking-widest">
        Vitrine
      </h1>

      <div className="flex flex-col md:flex-row gap-6 mb-12 justify-center items-center">
        <div className="flex gap-2">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`px-4 py-2 border rounded transition-all ${categoria === cat ? 'bg-tupaGold text-tupaBlack' : 'border-tupaGold text-tupaGold hover:bg-tupaGold/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {tecnologias.map(tec => (
            <button
              key={tec}
              onClick={() => setTecnologia(tec)}
              className={`px-4 py-2 border rounded transition-all ${tecnologia === tec ? 'bg-tupaWood text-white' : 'border-tupaWood text-tupaSilver hover:bg-tupaWood/20'}`}
            >
              {tec}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {filtrados.map((produto) => (
          <AmplifierCard
            key={produto.id}
            produto={produto}
          />
        ))}
      </div>
    </div>
  );
}