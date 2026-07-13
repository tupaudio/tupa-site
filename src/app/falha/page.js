export default function Falha() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-4xl font-serif text-red-600 mb-6">Algo deu errado.</h1>
      <p className="text-tupaOffWhite mb-8 max-w-md">
        Não conseguimos processar o pagamento neste momento. Não se preocupe, nenhum valor foi debitado.
      </p>
      <div className="flex gap-4">
        <a href="/carrinho" className="bg-tupaGold text-tupaBlack px-8 py-3 rounded font-bold hover:bg-white transition-all">
          Tentar novamente
        </a>
        <a href="/" className="border border-tupaGold text-tupaGold px-8 py-3 rounded font-bold hover:bg-tupaGold hover:text-tupaBlack transition-all">
          Voltar ao Início
        </a>
      </div>
    </main>
  );
}