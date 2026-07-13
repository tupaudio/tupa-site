export default function Sucesso() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-4xl font-serif text-tupaGold mb-6">Pedido Confirmado!</h1>
      <p className="text-tupaOffWhite mb-8">
        O seu Tupã já está em nossa bancada sendo preparado. Receberá as atualizações em breve.
      </p>
      <a href="/" className="bg-tupaGold text-tupaBlack px-8 py-3 rounded font-bold">Voltar para Início</a>
    </main>
  );
}