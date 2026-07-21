import { siteData } from '../content/siteData';

export default function Home() {
  return (
    <div className="min-h-screen bg-tupaBlack text-tupaOffWhite p-10">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center py-20 border-b border-tupaGold">
        <h1 className="text-6xl font-serif text-tupaGold mb-4">{siteData.hero.titulo}</h1>
        <p className="text-tupaSilver text-xl">{siteData.hero.subtitulo}</p>
      </section>

      {/* Manifesto */}
      <section className="py-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-serif text-tupaGold mb-6">{siteData.manifesto.titulo}</h2>
        <p className="text-lg leading-relaxed">{siteData.manifesto.texto}</p>
      </section>

      {/* Oficina */}
      <section className="py-20 bg-tupaGrey rounded-xl p-10 max-w-3xl mx-auto border border-tupaWood">
        <h2 className="text-3xl font-serif text-tupaGold mb-6">{siteData.oficina.titulo}</h2>
        <p className="text-lg leading-relaxed text-tupaSilver">{siteData.oficina.descricao}</p>
      </section>
    </div>
  );
}