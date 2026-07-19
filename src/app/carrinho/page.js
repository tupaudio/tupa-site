'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import CalculadoraFrete from '@/components/CalculadoraFrete';

function IconeLixeira() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
      <path d="M10 11v6"></path>
      <path d="M14 11v6"></path>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
    </svg>
  );
}

export default function CarrinhoPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [doc, setDoc] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState({ cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' });
  const [frete, setFrete] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false); // <-- MANTENHA ESTA

  const buscarEnderecoPorCep = async (cepDigitado) => { // <-- MANTENHA ESTA
    const cepLimpo = cepDigitado.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEndereco((prev) => ({
          ...prev,
          rua: data.logradouro || prev.rua,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          uf: data.uf || prev.uf,
        }));
      }
    } catch {
      // Se a busca falhar, o cliente preenche na mão mesmo — sem problema
    } finally {
      setBuscandoCep(false);
    }
  };

  // REMOVA COMPLETAMENTE ESTE BLOCO DUPLICADO (linhas 49-68 do seu código original)
  // const [buscandoCep, setBuscandoCep] = useState(false); <-- REMOVER
  // const buscarEnderecoPorCep = async (cepDigitado) => { <-- REMOVER
  //   ... 
  // };

  const subtotal = cart.reduce((soma, item) => soma + Number(item.preco) * item.quantidade, 0);
  const total = subtotal + (frete ? frete.valor : 0);

  const formatarPreco = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const validar = () => {
    if (!nome.trim()) return 'Preencha seu nome completo.';
    if (!email.trim()) return 'Preencha seu e-mail.';
    if (!email.includes('@') || !email.includes('.')) return 'Digite um e-mail válido.';
    if (!doc.trim()) return 'Preencha o CPF ou CNPJ (necessário para a nota fiscal).';
    if (!endereco.cep.trim() || !endereco.rua.trim() || !endereco.numero.trim() || !endereco.cidade.trim() || !endereco.uf.trim()) {
      return 'Preencha o endereço de entrega completo (CEP, rua, número, cidade e UF).';
    }
    return null;
  };

  const finalizarCompra = async (e) => {
    e.preventDefault();
    setErro('');

    const mensagemErro = validar();
    if (mensagemErro) {
      setErro(mensagemErro);
      return;
    }

    setCarregando(true);

    const items = cart.map((item) => ({
      id: item.id,
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
    } catch (err) {
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

  const campoClasse = "w-full min-w-0 bg-tupaBlack border border-tupaWood rounded px-4 py-2 text-tupaOffWhite placeholder-tupaSilver/50 focus:outline-none focus:border-tupaGold transition-colors";

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-10 text-tupaOffWhite space-y-8">
      <h1 className="text-3xl font-serif text-tupaGold uppercase tracking-widest">Carrinho</h1>

      {/* Caixa 1: lista de itens */}
      <div className="bg-tupaGrey border border-tupaWood rounded-lg p-6 space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-4 border-b border-tupaWood/30 pb-4 last:border-0 last:pb-0">
            <img
              src={`/img/${item.pastaImagens}/1.png`}
              alt={item.nome}
              className="w-20 h-20 object-cover rounded border border-tupaWood/50 shrink-0"
              onError={(e) => { e.target.onerror = null; e.target.src = '/img/placeholder.png'; }}
            />
            <div className="flex-1 min-w-[140px]">
              <h3 className="font-serif text-lg text-tupaOffWhite">{item.nome}</h3>
              <p className="text-tupaSilver text-sm">{formatarPreco(item.preco)} / unidade</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                className="w-8 h-8 border border-tupaWood rounded hover:border-tupaGold transition-colors"
              >
                −
              </button>
              <span className="w-6 text-center">{item.quantidade}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                className="w-8 h-8 border border-tupaWood rounded hover:border-tupaGold transition-colors"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeFromCart(item.id)}
              title="Remover item"
              aria-label="Remover item"
              className="shrink-0 w-9 h-9 flex items-center justify-center border border-tupaWood rounded text-red-400 hover:text-red-300 hover:border-red-400 transition-colors"
            >
              <IconeLixeira />
            </button>
          </div>
        ))}
      </div>

      {/* Caixa 2: resumo + frete */}
      <div className="bg-tupaGrey border border-tupaWood rounded-lg p-6 space-y-4">
        <h2 className="text-tupaGold font-serif text-xl">Resumo do pedido</h2>

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
      </div>

      {/* Caixa 3: dados do cliente e pagamento */}
      <form onSubmit={finalizarCompra} className="bg-tupaGrey border border-tupaWood rounded-lg p-6 space-y-4">
        <h2 className="text-tupaGold font-serif text-xl mb-2">Seus dados</h2>
        <p className="text-tupaSilver text-xs">Campos com * são obrigatórios.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <input
            required
            type="text"
            placeholder="Nome completo / Razão social *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={campoClasse}
          />
          <input
            required
            type="email"
            placeholder="Seu e-mail *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={campoClasse}
          />
          <input
            required
            type="text"
            placeholder="CPF / CNPJ (para nota fiscal) *"
            value={doc}
            onChange={(e) => setDoc(e.target.value)}
            className={campoClasse}
          />
          <input
            type="tel"
            placeholder="Telefone / WhatsApp"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className={campoClasse}
          />
        </div>

        <p className="text-tupaGold text-xs uppercase tracking-widest pt-2">Endereço de entrega *</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <input
            required
            type="text"
            placeholder={buscandoCep ? 'Buscando endereço...' : 'CEP *'}
            maxLength={9}
            value={endereco.cep}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, '').slice(0, 8);
              if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
              setEndereco({ ...endereco, cep: v });
              if (v.replace(/\D/g, '').length === 8) buscarEnderecoPorCep(v);
            }}
            className={campoClasse}
          />
          <input
            required
            type="text"
            placeholder="Rua / Logradouro *"
            value={endereco.rua}
            onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
            className={`${campoClasse} sm:col-span-2`}
          />
          <input
            required
            type="text"
            placeholder="Nº *"
            value={endereco.numero}
            onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
            className={campoClasse}
          />
          <input
            type="text"
            placeholder="Complemento"
            value={endereco.complemento}
            onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
            className={campoClasse}
          />
          <input
            type="text"
            placeholder="Bairro"
            value={endereco.bairro}
            onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
            className={campoClasse}
          />
          <input
            required
            type="text"
            placeholder="Cidade *"
            value={endereco.cidade}
            onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
            className={campoClasse}
          />
          <input
            required
            type="text"
            placeholder="UF *"
            maxLength={2}
            value={endereco.uf}
            onChange={(e) => setEndereco({ ...endereco, uf: e.target.value.toUpperCase() })}
            className={campoClasse}
          />
        </div>

        {erro && <p className="text-red-400 text-sm font-bold">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-tupaGold text-tupaBlack py-3 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
        >
          {carregando ? 'Processando...' : 'Finalizar Compra'}
        </button>
      </form>
    </main>
  );
}