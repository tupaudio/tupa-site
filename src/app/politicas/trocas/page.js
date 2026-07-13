export default function TrocasPage() {
  return (
    <main className="max-w-4xl mx-auto p-10 min-h-screen">
      <h1 className="text-4xl font-serif text-tupaGold mb-12 text-center uppercase tracking-widest">
        Trocas e Devoluções
      </h1>
      
      <div className="space-y-6 text-tupaSilver text-lg leading-relaxed">
        <h2 className="text-2xl font-serif text-tupaGold mt-8 mb-4">Garantia e Produtos com Defeito</h2>
        <p>
          Todos os amplificadores e equipamentos da Tupã Áudio são construídos à mão e rigorosamente testados em bancada. Caso o produto apresente algum defeito, o prazo para solicitar avaliação e reparo, ou troca se necessário, é de até 90 (noventa) dias corridos após o recebimento.
        </p>
        <p>
          O equipamento deverá retornar acompanhado de todos os acessórios e, de preferência, em sua embalagem original para proteção no transporte. Sendo constatado defeito de fabricação dentro da garantia legal, o cliente tem direito ao conserto gratuito ou, na impossibilidade de solução em até 30 dias, à substituição do item ou devolução do valor.
        </p>

        <h2 className="text-2xl font-serif text-tupaGold mt-10 mb-4">Devolução por Arrependimento</h2>
        <p>
          O cliente pode solicitar a devolução por arrependimento em até 7 (sete) dias corridos após o recebimento da compra online. O produto deve ser devolvido rigorosamente sem marcas de uso, acompanhado de todos os acessórios e nota fiscal. Após a análise das condições do produto na nossa oficina, daremos andamento ao processo de reembolso pelo mesmo método de pagamento utilizado.
        </p>

        <h2 className="text-2xl font-serif text-tupaGold mt-10 mb-4">Condições Gerais</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Não realizamos trocas ou devoluções de produtos danificados por mau uso (ex: ligação em voltagem incorreta, quebra física de válvulas, etc);</li>
          <li>Reservamo-nos o direito de recusar a troca ou devolução caso o equipamento não cumpra aos critérios informados acima;</li>
          <li>Para iniciar o processo de suporte, entre em contato com nossa bancada via WhatsApp <a href="https://wa.me/5527999563227" target="_blank" rel="noopener noreferrer" className="text-tupaGold font-bold hover:underline">(27) 99956-3227</a> ou e-mail <a href="mailto:tupaaudio@outlook.com" className="text-tupaGold font-bold hover:underline">tupaaudio@outlook.com</a>.</li>
        </ul>
      </div>
    </main>
  );
}