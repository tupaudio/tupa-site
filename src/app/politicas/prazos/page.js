export const metadata = {
  title: 'Prazos e Entrega — Tupã Áudio',
  description: 'Como funciona o envio dos amplificadores Tupã Áudio: transportadoras, prazos e rastreamento.',
};

export default function PrazosPage() {
  return (
    <div className="max-w-4xl mx-auto p-10 min-h-screen">
      <h1 className="text-4xl font-serif text-tupaGold mb-12 text-center uppercase tracking-widest">
        Prazos e Entrega
      </h1>

      <div className="space-y-6 text-tupaSilver text-lg leading-relaxed">
        <p>
          A Tupã Áudio atua em parceria com os Correios (PAC e Sedex), além de transportadoras terceirizadas consolidadas como Jadlog e Loggi, visando a integridade física dos equipamentos que saem da nossa oficina até chegarem à sua casa ou estúdio.
        </p>
        <p>
          Nossas coletas e entregas ocorrem de segunda a sexta-feira, em horário comercial. A escolha da empresa de transporte é realizada com base nas dimensões do gabinete do amplificador e na localidade de destino do cliente.
        </p>
        <p>
          O prazo de entrega informado no momento da compra passa a valer a partir da data em que o seu pedido for faturado e despachado. Lembramos que, no caso de amplificadores encomendados na modalidade "Custom Shop" ou "Sob Encomenda", existe um prazo prévio de montagem artesanal que é somado ao prazo de envio (prazo este sempre informado no ato da compra).
        </p>
        <p>
          Assim que o equipamento sair da nossa bancada, você receberá um código de rastreamento no e-mail cadastrado para acompanhar todos os detalhes da viagem do seu amplificador.
        </p>
        <p>
          Se precisar de mais informações ou tiver qualquer problema com a sua entrega, contate-nos imediatamente pelo WhatsApp <a href="https://wa.me/5527999563227" target="_blank" rel="noopener noreferrer" className="text-tupaGold font-bold hover:underline">(27) 99956-3227</a> ou pelo e-mail <a href="mailto:tupaaudio@outlook.com" className="text-tupaGold font-bold hover:underline">tupaaudio@outlook.com</a>.
        </p>
      </div>
    </div>
  );
}