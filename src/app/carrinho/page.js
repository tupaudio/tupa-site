'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import CalculadoraFrete from '@/components/CalculadoraFrete';

export default function CarrinhoPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [doc, setDoc] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState({ rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' });
  const [frete, setFrete] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const subtotal = cart.reduce((soma, item) => soma + Number(item.preco) * item.quantidade, 0);
  const total = subtotal + (frete ? frete.valor : 0);

  const formatarPreco = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const finalizarCompra = async () => {
    setErro('');

    if (!nome.trim() || !email.trim()) {
      setErro('Preencha nome e e-mail para continuar.');
      return;
    }
    if (!email.includes('@')) {
      setErro('Digite um e-mail válido.');
      return;
    }

    setCarregando(true);

    const items = cart.map((item) => ({
      nome: item.nome,
      preco: item.preco,
      quantidade: item.quantidade,
    }));

    if (frete) {
      items.push({ nome: `Frete — ${frete.nome}`, preco: frete.valor, quantidade: 1 });
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          cliente: { nome, email, doc, telefone, endereco },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Não foi possível gerar o pagamento.');
        setCarregando(false);
        return;
      }

      window.location.href = data.init_point;
    } catch (e) {
      setErro('Erro ao conectar com o pagamento. Tente novamente.');
      setCarregando(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-tupaOffWhite p-10">
        <h1 className="text-3xl font-serif text-tupaGold mb-4">Seu carrinho está vazio</h1>
        <Link href="/loja" className="bg-tupaGold text-tupaBlack px-6 py-3 rounded font-bold hover:bg-white transition-colors">
          Ver amplificadores
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-10 grid md:grid-cols-3 gap-12 text-tupaOffWhite">
      {/* Lista de itens */}
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-3xl font-serif text-tupaGold mb-6 uppercase tracking-widest">Carrinho</h1>

        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-4 bg-tupaGrey border border-tupaWood rounded-lg p-4">
            <img
              src={`/img/${item.pastaImagens}/1.png`}
              alt={item.nome}
              className="w-20 h-20 object-cover rounded border border-tupaWood/50"
              onError={(e) => { e.target.onerror = null; e.target.src = '/img/placeholder.png'; }}
            />
            <div className="flex-1">
              <h3 className="font-serif text-lg text-tupaOffWhite">{item.nome}</h3>
              <p className="text-tupaSilver text-sm">{formatarPreco(item.preco)} / unidade</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                className="w-8 h-8 border border-tupaWood rounded hover:border-tupaGold transition-colors"
              >
                −
              </button>
              <span className="w-6 text-center">{item.quantidade}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                className="w-8 h-8 border border-tupaWood rounded hover:border-tupaGold transition-colors"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeFromCart(item.id)}
              className="text-red-400 text-xs underline hover:text-red-300 transition-colors ml-2"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      {/* Resumo / checkout */}
      <div className="bg-tupaGrey border border-tupaWood rounded-lg p-6 h-fit space-y-4">
        <h2 className="text-tupaGold font-serif text-xl mb-2">Resumo do pedido</h2>

        <div className="flex justify-between text-sm text-tupaSilver">
          <span>Subtotal</span>
          <span>{formatarPreco(subtotal)}</span>
        </div>
        {frete && (
          <div className="flex justify-between text-sm text-tupaSilver">
            <span>Frete</span>
            <span>{formatarPreco(frete.valor)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-tupaGold text-lg border-t border-tupaWood pt-3">
          <span>Total</span>
          <span>{formatarPreco(total)}</span>
        </div>

        <CalculadoraFrete itens={cart} onSelecionar={setFrete} />

        <div className="space-y-3 pt-4 border-t border-tupaWood">
          <input
            type="text"
            placeholder="Nome completo / Razão social"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-tupaBlack border border-tupaWood rounded px-4 py-2 text-tupaOffWhite placeholder-tupaSilver/50 focus:outline-none focus:border-tupaGold transition-colors"
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-tupaBlack border border-tupaWood rounded px-4 py-2 text-tupaOffWhite placeholder-tupaSilver/50 focus:outline-none focus:border-tupaGold transition-colors"
          />
          <input
            type="text"
            placeholder="CPF / CNPJ (para nota fiscal)"
            value={doc}
            onChange={(e) => setDoc(e.target.value)}
            className="w-full bg-tupaBlack border border-tupaWood rounded px-4 py-2 text-tupaOffWhite placeholder-tupaSilver/50 focus:outline-none focus:border-tupaGold transition-colors"
          />
          <input
            type="tel"
            placeholder="Telefone / WhatsApp"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full bg-tupaBlack border border-tupaWood rounded px-4 py-2 text-tupaOffWhite placeholder-tupaSilver/50 focus:outline-none focus:border-tupaGold transition-colors"
          />

          <p className="text-tupaGold text-xs uppercase tracking-widest pt-2">Endereço de entrega</p>
          <input
            type="text"
            placeholder="Rua / Logradouro"
            value={endereco.rua}
            onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
            className="w-full bg-tupaBlack border border-tupaWood rounded px-4 py-2 text-tupaOffWhite placeholder-tupaSilver/50 focus:outline-none focus:border-tupaGold transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nº"
              value={endereco.numero}
              onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
              className="w-20 bg-tupaBlack border border-tupaWood rounded px-4 py-2 text-tupaOffWhite placeholder-tupaSilver/50 focus:outline-none focus:border-tupaGold transition-colors"
            />
            <input
              type="text"
              placeholder="Complemento"
              value={endereco.complemento}
              onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
              className="flex-1 bg-tupaBlack border border-tupaWood rounded px-4 py-2 text-tupaOffWhite placeholder-tupaSilver/50 focus:outline-none focus:border-tupaGold transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Bairro"
              value={endereco.bairro}
              onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
              className="flex-1 bg-tupaBlack border border-tupaWood rounded px-4 py-2 text-tupaOffWhite placeholder-tupaSilver/50 focus:outline-none focus:border-tupaGold transition-colors"
            />
            <input
              type="text"
              placeholder="Cidade"
              value={endereco.cidade}
              onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
              className="flex-1 bg-tupaBlack border border-tupaWood rounded px-4 py-2 text-tupaOffWhite placeholder-tupaSilver/50 focus:outline-none focus:border-tupaGold transition-colors"
            />
            <input
              type="text"
              placeholder="UF"
              maxLength={2}
              value={endereco.uf}
              onChange={(e) => setEndereco({ ...endereco, uf: e.target.value.toUpperCase() })}
              className="w-16 bg-tupaBlack border border-tupaWood rounded px-4 py-2 text-tupaOffWhite placeholder-tupaSilver/50 focus:outline-none focus:border-tupaGold transition-colors"
            />
          </div>
        </div>

        {erro && <p className="text-red-400 text-sm">{erro}</p>}

        <button
          onClick={finalizarCompra}
          disabled={carregando}
          className="w-full bg-tupaGold text-tupaBlack py-3 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
        >
          {carregando ? 'Processando...' : 'Finalizar Compra'}
        </button>
      </div>
    </main>
  );
}