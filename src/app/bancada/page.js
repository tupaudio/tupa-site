const secoes = [
  {
    titulo: "Montagem Ponto a Ponto",
    texto: "A alma da Tupã nasce aqui, desde o projeto até a montagem final. Cada componente é posicionado e soldado à mão, garantindo que o caminho do sinal seja o mais puro e eficiente possível.",
    imagens: ["/img/bancada/solda1.png", "/img/bancada/solda2.png", "/img/bancada/solda3.png"],
    textoDireita: true
  },
  {
    titulo: "Testes Rigorosos",
    texto: "Um amplificador Tupã não sai da oficina sem ser colocado à prova. Analisamos ruído, potência real em bancada, garantindo que o timbre que projetamos é exatamente o que você vai receber.",
    imagens: ["/img/bancada/teste1.png", "/img/bancada/teste2.png", "/img/bancada/teste3.png"],
    textoDireita: false // Texto na esquerda, imagens na direita
  },
  {
    titulo: "Proteção no Envio",
    texto: "Respeitamos a sua encomenda até a entrega. Utilizamos embalagens reforçadas com proteção contra impacto e umidade, garantindo que a peça chegue intacta à sua porta.",
    imagens: ["/img/bancada/envio1.png", "/img/bancada/envio2.png", "/img/bancada/envio3.png"],
    textoDireita: true
  }
];

export default function Bancada() {
  return (
    <main className="max-w-6xl mx-auto p-10 space-y-20 text-tupaOffWhite">
      <h1 className="text-4xl font-serif text-tupaGold text-center uppercase tracking-widest mb-10">
        A Bancada
      </h1>

      {secoes.map((secao, i) => (
        <section 
          key={i} 
          className={`flex flex-col ${secao.textoDireita ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10`}
        >
          {/* Lado do Texto */}
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-3xl font-serif text-tupaGold">{secao.titulo}</h2>
            <p className="leading-relaxed text-tupaSilver text-lg">{secao.texto}</p>
          </div>

          {/* Painel Dinâmico de Imagens */}
          <div className="md:w-1/2 grid grid-cols-2 gap-4">
            <img src={secao.imagens[0]} className="col-span-2 rounded shadow-lg border border-tupaWood" />
            <img src={secao.imagens[1]} className="rounded shadow-lg border border-tupaWood" />
            <img src={secao.imagens[2]} className="rounded shadow-lg border border-tupaWood" />
          </div>
        </section>
      ))}
    </main>
  );
}