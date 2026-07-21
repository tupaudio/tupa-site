export const metadata = {
  title: 'Política de Privacidade — Tupã Áudio',
  description: 'Como a Tupã Áudio trata os dados dos seus clientes durante o processo de compra.',
};

export default function PrivacidadePage() {
  return (
    <div className="max-w-4xl mx-auto p-10 min-h-screen">
      <h1 className="text-4xl font-serif text-tupaGold mb-12 text-center uppercase tracking-widest">
        Política de Privacidade
      </h1>

      <div className="space-y-6 text-tupaSilver text-lg leading-relaxed">
        <p>
          Durante o processo de compra, você informará apenas os dados cadastrais essenciais para cobrança, emissão de nota fiscal e envio da encomenda. Estas informações são utilizadas estritamente para o processamento de suas compras. Os seus dados cadastrais só poderão ser acessados e alterados por você mesmo, em sua área restrita de cliente.
        </p>
        <p>
          Com prévia autorização, enviamos e-mails informando as novidades da oficina e lançamentos em nossa loja, porém você pode solicitar o não recebimento a qualquer momento.
        </p>
        <p>
          Ressaltamos que a Tupã Áudio não tem acesso a dados bancários sigilosos, como números de cartões ou senhas. O pagamento é processado em ambiente 100% seguro através das intermediadoras de pagamento (Mercado Pago, PIX), e os dados são informados diretamente à administradora do cartão de forma criptografada, não ficando armazenados em nossos servidores.
        </p>
        <h2 className="text-2xl font-serif text-tupaGold mt-10 mb-4">Cookies</h2>
        <p>
          Esta é uma loja segura e utiliza a tecnologia de Cookies apenas para proporcionar mais facilidade no momento de sua compra. O objetivo dos Cookies é customizar ao máximo sua navegação no site, permitindo maior facilidade e agilidade no processo de pesquisa e finalização de pedido.
        </p>
      </div>
    </div>
  );
}