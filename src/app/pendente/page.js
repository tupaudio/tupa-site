export default function Pendente() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-4xl font-serif text-tupaGold mb-6">Pagamento em Análise</h1>
      <p className="text-tupaOffWhite mb-8 max-w-md">
        Recebemos o seu pedido! Estamos aguardando a compensação do pagamento pelo Mercado Pago. 
        Assim que o banco confirmar, enviaremos uma notificação para o seu e-mail.
      </p>
      <div className="bg-tupaGrey p-6 rounded border border-tupaWood">
        <p className="text-sm text-tupaSilver">Dúvidas? Entre em contato conosco via WhatsApp.</p>
      </div>
      <a href="/" className="mt-8 text-tupaGold underline">Voltar para o site</a>
    </main>
  );
}