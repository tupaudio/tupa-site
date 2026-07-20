// src/app/carrinho/page.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import CalculadoraFrete from '@/components/CalculadoraFrete';
import OtimizadaImagem from '@/components/OtimizadaImagem';

// Componente do Stepper
function Stepper({ passoAtual, passos }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {passos.map((nome, index) => {
        const numero = index + 1;
        const isAtivo = numero === passoAtual;
        const isCompleto = numero < passoAtual;
        
        return (
          <div key={index} className="flex items-center">
            <div className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${isCompleto ? 'bg-tupaGold text-tupaBlack' : ''}
                ${isAtivo ? 'bg-tupaGold text-tupaBlack ring-2 ring-tupaGold ring-offset-2 ring-offset-tupaBlack' : ''}
                ${!isAtivo && !isCompleto ? 'bg-tupaGrey border border-tupaWood text-tupaSilver' : ''}
              `}>
                {isCompleto ? '✓' : numero}
              </div>
              <span className={`
                ml-2 text-sm hidden sm:inline
                ${isAtivo ? 'text-tupaGold' : ''}
                ${isCompleto ? 'text-tupaSilver' : ''}
                ${!isAtivo && !isCompleto ? 'text-tupaSilver/50' : ''}
              `}>
                {nome}
              </span>
            </div>
            {index < passos.length - 1 && (
              <div className={`
                w-12 h-px mx-2
                ${isCompleto ? 'bg-tupaGold' : 'bg-tupaWood/30'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}

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

export const metadata = {
  title: 'Carrinho de Compras | Tupã Áudio',
  description: 'Revise seu pedido, preencha os dados de entrega e finalize a compra dos melhores amplificadores valvulados.',
  robots: 'noindex, follow', // Páginas de checkout não devem ser indexadas
};
export default function CarrinhoPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [passo, setPasso] = useState(1);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [doc, setDoc] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState({ cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' });
  const [frete, setFrete] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [termos, setTermos] = useState(false);

  // Estados para monitoramento assíncrono do checkout externo
  const [checkoutIniciado, setCheckoutIniciado] = useState(false);
  const [linkPagamento, setLinkPagamento] = useState('');
  const [extRef, setExtRef] = useState('');

  // Efeito de pooling de segundo plano para verificar status via external_reference
  useEffect(() => {
    if (!checkoutIniciado || !extRef) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status-pagamento?external_reference=${extRef}`);
        const data = await res.json();

        if (data.status === 'approved') {
          clearInterval(interval);
          clearCart(); 
          window.location.href = '/sucesso'; 
        }
      } catch (err) {
        console.error("Erro ao verificar o status de pagamento:", err);
      }
    }, 4000); // Executa a checagem a cada 4 segundos

    return () => clearInterval(interval);
  }, [checkoutIniciado, extRef, clearCart]);

// ============================================================
// FUNÇÃO CORRIGIDA: Busca endereço via ViaCEP com feedback visual
// ============================================================
const buscarEnderecoPorCep = async (cepDigitado) => {
  const cepLimpo = cepDigitado.replace(/\D/g, '');
  if (cepLimpo.length !== 8) return;

  setBuscandoCep(true);
  setErro(''); // Limpa erro anterior
  
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await res.json();
    
    // Verifica se o CEP existe
    if (data.erro) {
      setErro('CEP não encontrado. Verifique o número digitado.');
      // Limpa os campos de endereço
      setEndereco((prev) => ({
        ...prev,
        rua: '',
        bairro: '',
        cidade: '',
        uf: '',
      }));
      return;
    }
    
    // Preenche os campos com os dados do ViaCEP
    setEndereco((prev) => ({
      ...prev,
      rua: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      uf: data.uf || '',
    }));
    
    // Feedback visual positivo (opcional)
    // Você pode adicionar um toast ou notificação aqui
    
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    setErro('Erro ao buscar endereço. Preencha manualmente.');
  } finally {
    setBuscandoCep(false);
  }
};

  // Máscara de CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00),
  // detectada automaticamente pela quantidade de dígitos
  const aplicarMascaraDoc = (valor) => {
    const digitos = valor.replace(/\D/g, '').slice(0, 14);
    if (digitos.length <= 11) {
      return digitos
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return digitos
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  // Máscara de telefone: (00) 0000-0000 ou (00) 00000-0000
  const aplicarMascaraTelefone = (valor) => {
    const digitos = valor.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 10) {
      return digitos
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }
    return digitos
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  };

  const subtotal = cart.reduce((soma, item) => soma + Number(item.preco) * item.quantidade, 0);
  const total = subtotal + (frete ? frete.valor : 0);

  const formatarPreco = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const validarPasso1 = () => {
    if (!nome.trim()) return 'Preencha seu nome completo.';
    if (!email.trim()) return 'Preencha seu e-mail.';
    if (!email.includes('@') || !email.includes('.')) return 'Digite um e-mail válido.';
    const digitosDoc = doc.replace(/\D/g, '');
    if (digitosDoc.length !== 11 && digitosDoc.length !== 14) {
      return 'Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.';
    }
    return null;
  };

  const validarPasso2 = () => {
    if (!endereco.cep.trim() || !endereco.rua.trim() || !endereco.numero.trim() || !endereco.cidade.trim() || !endereco.uf.trim()) {
      return 'Preencha o endereço de entrega completo.';
    }
    if (!frete) return 'Escolha uma opção de frete (ou "Frete local") para continuar.';
    if (!termos) return 'Você precisa aceitar os termos para continuar.';
    return null;
  };

  const irParaPasso = (novoPasso) => {
    if (novoPasso === 2) {
      const erroValidacao = validarPasso1();
      if (erroValidacao) {
        setErro(erroValidacao);
        return;
      }
    }
    if (novoPasso === 3) {
      const erroValidacao = validarPasso2();
      if (erroValidacao) {
        setErro(erroValidacao);
        return;
      }
    }
    setErro('');
    setPasso(novoPasso);
  };

  const finalizarCompra = async (e) => {
    e.preventDefault();
    setErro('');

    const erroValidacao = validarPasso2();
    if (erroValidacao) {
      setErro(erroValidacao);
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

      setLinkPagamento(data.init_point);
      setExtRef(data.external_reference);
      setCheckoutIniciado(true);
      setCarregando(false);

      // Abre o Mercado Pago em aba paralela externa para o fluxo do Pix/Cartão
      window.open(data.init_point, '_blank');
    } catch (err) {
      setErro('Erro ao conectar com o pagamento. Tente novamente.');
      setCarregando(false);
    }
  };

  const passos = ['Dados Pessoais', 'Entrega', 'Pagamento'];

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
      <h1 className="text-3xl font-serif text-tupaGold uppercase tracking-widest">Checkout</h1>

      {/* Stepper */}
      <Stepper passoAtual={passo} passos={passos} />

      {/* Carrinho — visível e editável em qualquer passo */}
      <details className="bg-tupaGrey border border-tupaWood rounded-lg" open={passo === 1}>
        <summary className="cursor-pointer select-none p-4 flex items-center justify-between text-tupaGold font-serif">
          <span>
            Seu carrinho — {cart.length} {cart.length === 1 ? 'item' : 'itens'} ({formatarPreco(subtotal)})
          </span>
          <span className="text-xs text-tupaSilver">Ver / editar</span>
        </summary>
        <div className="p-4 pt-0 space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-3 border-t border-tupaWood/30 pt-3">
              <div className="flex-1 min-w-[140px]">
                <p className="text-sm text-tupaOffWhite">{item.nome}</p>
                <p className="text-xs text-tupaSilver">{formatarPreco(item.preco)} / unidade</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => updateQuantity(item.id, item.quantidade - 1)} className="w-7 h-7 border border-tupaWood rounded hover:border-tupaGold">−</button>
                <span className="w-6 text-center text-sm">{item.quantidade}</span>
                <button type="button" onClick={() => updateQuantity(item.id, item.quantidade + 1)} className="w-7 h-7 border border-tupaWood rounded hover:border-tupaGold">+</button>
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(item.id)}
                title="Remover item"
                className="w-8 h-8 flex items-center justify-center border border-tupaWood rounded text-red-400 hover:text-red-300 hover:border-red-400"
              >
                <IconeLixeira />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => { if (confirm('Esvaziar o carrinho inteiro?')) clearCart(); }}
            className="text-xs text-red-400 underline hover:text-red-300 pt-2"
          >
            Esvaziar carrinho
          </button>
        </div>
      </details>

      {/* PASSO 1: Dados Pessoais */}
      {passo === 1 && (
        <div className="bg-tupaGrey border border-tupaWood rounded-lg p-6 space-y-4">
          <h2 className="text-tupaGold font-serif text-xl">Seus dados</h2>
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
              onChange={(e) => setDoc(aplicarMascaraDoc(e.target.value))}
              className={campoClasse}
            />
            <input
              type="tel"
              placeholder="Telefone / WhatsApp"
              value={telefone}
              onChange={(e) => setTelefone(aplicarMascaraTelefone(e.target.value))}
              className={campoClasse}
            />
          </div>

          {erro && <p className="text-red-400 text-sm font-bold">{erro}</p>}

          <button
            type="button"
            onClick={() => irParaPasso(2)}
            className="w-full bg-tupaGold text-tupaBlack py-3 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors"
          >
            Próximo
          </button>
        </div>
      )}

      {/* PASSO 2: Entrega */}
      {passo === 2 && (
        <div className="space-y-4">
          {/* Resumo rápido do pedido */}
          <div className="bg-tupaGrey border border-tupaWood rounded-lg p-4">
            <h3 className="text-tupaGold font-serif text-sm uppercase tracking-wider mb-2">Resumo do pedido</h3>
            <p className="text-tupaSilver text-sm">
              {cart.length} {cart.length === 1 ? 'item' : 'itens'} · Total: {formatarPreco(subtotal)}
            </p>
          </div>

          {/* Endereço */}
          <div className="bg-tupaGrey border border-tupaWood rounded-lg p-6 space-y-4">
            <h2 className="text-tupaGold font-serif text-xl">Endereço de entrega</h2>
            <p className="text-tupaSilver text-xs">Campos com * são obrigatórios.</p>

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

            {/* Cálculo de frete */}
            <div className="pt-4 border-t border-tupaWood/30">
              <CalculadoraFrete itens={cart} onSelecionar={setFrete} />
              {frete && (
                <div className="flex justify-between text-sm text-tupaSilver mt-2">
                  <span>Frete selecionado:</span>
                  <span className="text-tupaGold">{frete.nome} - {formatarPreco(frete.valor)}</span>
                </div>
              )}
            </div>

            {/* Termos */}
            <div className="flex items-start gap-3 pt-4 border-t border-tupaWood/30">
              <input
                type="checkbox"
                id="termos"
                checked={termos}
                onChange={(e) => setTermos(e.target.checked)}
                className="mt-1 w-4 h-4 accent-tupaGold"
              />
              <label htmlFor="termos" className="text-sm text-tupaSilver">
                Li e aceito os{' '}
                <Link href="/politicas/trocas" className="text-tupaGold hover:underline">
                  termos de serviço
                </Link>
                {' '}e{' '}
                <Link href="/politicas/privacidade" className="text-tupaGold hover:underline">
                  política de privacidade
                </Link>
                .
              </label>
            </div>

            {erro && <p className="text-red-400 text-sm font-bold">{erro}</p>}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => irParaPasso(1)}
                className="flex-1 bg-tupaGrey border border-tupaWood text-tupaOffWhite py-3 rounded font-bold hover:border-tupaGold transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => irParaPasso(3)}
                className="flex-1 bg-tupaGold text-tupaBlack py-3 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors"
              >
                Revisar pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSO 3: Pagamento e Revisão Final */}
      {passo === 3 && (
        <div className="space-y-4">
          {checkoutIniciado ? (
            <div className="bg-tupaGrey border border-tupaWood rounded-lg p-8 text-center space-y-6">
              <h2 className="text-tupaGold font-serif text-2xl tracking-wide animate-pulse">
                Aguardando Pagamento...
              </h2>
              <p className="text-tupaSilver text-sm max-w-md mx-auto">
                Uma aba externa e segura do Mercado Pago foi inicializada para você efetuar a transação via Pix ou Cartão.
                Assim que processado com sucesso, esta janela redirecionará você automaticamente.
              </p>
              
              <div className="py-4">
                <div className="w-8 h-8 border-4 border-tupaGold border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>

              <div className="pt-4 border-t border-tupaWood/20 space-y-2">
                <p className="text-xs text-tupaSilver/60">A janela popup bloqueou ou fechou sem querer?</p>
                <a 
                  href={linkPagamento} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-tupaGold text-tupaBlack px-6 py-2 rounded font-bold text-sm uppercase hover:bg-white transition-colors"
                >
                  Abrir ambiente de pagamento novamente
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-tupaGrey border border-tupaWood rounded-lg p-6 space-y-4">
              <h2 className="text-tupaGold font-serif text-xl">Revisão do pedido</h2>

              {/* Itens */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b border-tupaWood/30 pb-3 last:border-0 last:pb-0">
                    <OtimizadaImagem
                      src={`/img/${item.pastaImagens}/1.png`}
                      alt={item.nome}
                      width={50}
                      height={50}
                      className="rounded border border-tupaWood/50 object-cover"
                      sizes="50px"
                        fallbackSrc="/img/placeholder-produto.png" // ✅ ADICIONADO: imagem de fallback
                    />
                    <div className="flex-1">
                      <p className="text-sm text-tupaOffWhite">{item.nome}</p>
                      <p className="text-xs text-tupaSilver">{item.quantidade}x {formatarPreco(item.preco)}</p>
                    </div>
                    <p className="text-sm text-tupaGold font-bold">{formatarPreco(Number(item.preco) * item.quantidade)}</p>
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div className="border-t border-tupaWood/30 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-tupaSilver">Subtotal</span>
                  <span className="text-tupaOffWhite">{formatarPreco(subtotal)}</span>
                </div>
                {frete && (
                  <div className="flex justify-between text-sm">
                    <span className="text-tupaSilver">Frete</span>
                    <span className="text-tupaOffWhite">{formatarPreco(frete.valor)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-tupaGold text-lg border-t border-tupaWood/30 pt-3">
                  <span>Total</span>
                  <span>{formatarPreco(total)}</span>
                </div>
              </div>

              {/* Dados do cliente */}
              <div className="bg-tupaBlack p-4 rounded border border-tupaWood/30 text-sm">
                <p className="text-tupaSilver"><span className="text-tupaGold">Nome:</span> {nome}</p>
                <p className="text-tupaSilver"><span className="text-tupaGold">E-mail:</span> {email}</p>
                <p className="text-tupaSilver"><span className="text-tupaGold">Entrega:</span> {endereco.rua}, {endereco.numero} {endereco.complemento ? `- ${endereco.complemento}` : ''}, {endereco.bairro} - {endereco.cidade}/{endereco.uf}, CEP: {endereco.cep}</p>
              </div>

              {erro && <p className="text-red-400 text-sm font-bold">{erro}</p>}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => irParaPasso(2)}
                  className="flex-1 bg-tupaGrey border border-tupaWood text-tupaOffWhite py-3 rounded font-bold hover:border-tupaGold transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  onClick={finalizarCompra}
                  disabled={carregando}
                  className="flex-1 bg-tupaGold text-tupaBlack py-3 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                >
                  {carregando ? 'Processando...' : 'Finalizar Compra'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}