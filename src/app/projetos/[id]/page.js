import { projetos } from '@/data/projetos';
import { notFound } from 'next/navigation';

export default async function DetalheProjeto({ params }) {
  const { id } = await params;
  const projeto = projetos.find(p => p.id === id);
  if (!projeto) notFound();

  return (
    <main className="max-w-4xl mx-auto p-10 text-tupaOffWhite">
      <h1 className="text-4xl font-serif text-tupaGold mb-2">{projeto.nome}</h1>
      <p className="text-lg text-tupaSilver mb-8 italic">{projeto.categoria}</p>
      
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[1, 2, 3].map(n => (
          <img key={n} src={`/img/projetos/${id}${n}.png`} className="rounded border border-tupaWood" alt={projeto.nome} />
        ))}
      </div>
      
      <div className="space-y-10">
        <section>
          <h2 className="text-tupaGold font-serif text-2xl mb-4 border-b border-tupaWood pb-2">A História</h2>
          <p className="text-tupaSilver leading-relaxed text-justify">{projeto.historia}</p>
        </section>
        
        <section>
          <h2 className="text-tupaGold font-serif text-2xl mb-4 border-b border-tupaWood pb-2">O Timbre</h2>
          <p className="text-tupaSilver leading-relaxed text-justify">{projeto.timbre}</p>
        </section>
        
        <section>
          <h2 className="text-tupaGold font-serif text-2xl mb-4 border-b border-tupaWood pb-2">Especificações</h2>
          <ul className="list-disc list-inside text-tupaSilver space-y-2">
            {projeto.especificacoes.map((spec, i) => <li key={i}>{spec}</li>)}
          </ul>
        </section>
      </div>
    </main>
  );
}