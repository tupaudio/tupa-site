'use client';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import CalculadoraFrete from '@/components/CalculadoraFrete';
import { useState } from 'react';

// --- Máscaras de Formatação ---
const maskDoc = (value) => {
  let v = value.replace(/\D/g, '');
  if (v.length <= 11) {
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4'); // CPF
  } else {
    return v.substring(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5'); // CNPJ
  }
};

const maskPhone = (value) => {
  let v = value.replace(/\D/g, '');
  if (v.length <= 10) {
    return v.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
  } else {
    return v.substring(0, 11).replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
  }
};

const maskCEP = (value) => {
  let v = value.replace(/\D/g, '').substring(0, 8);
  return v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
};

// --- Componente de Input Customizado (Para Asteriscos e Erros) ---
const InputField = ({ name, value, placeholder, label, required, error, onChange, onBlur, maxLength, type="text", readOnly, containerClass="" }) => (
  <div className={`flex flex-col relative ${containerClass}`}>
    {/* Label flutuante do lado de fora */}
    <div className="flex justify-between items-center mb-1 ml-1 min-h-[16px]">
      <label className={`text-xs font-bold transition-opacity duration-300 ${value || readOnly ? 'text-tupaGold opacity-100' : 'opacity-0'}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
    <input
      name={name}
      type={type}
      value={value}
      placeholder={value ? '' : `${placeholder} ${required ? '*' : ''}`} // Asterisco dentro se vazio
      onChange={onChange}
      onBlur={onBlur}
      maxLength={maxLength}
      readOnly={readOnly}
      className={`bg-black border ${error ? 'border-red-500' : 'border-tupaWood/50'} p-3 text-white rounded focus:border-tupaGold outline-none transition-colors ${readOnly ? 'bg-black/50 cursor-not-allowed text-tupaSilver' : ''} w-full`}
    />
    {/* Mensagem de Erro embaixo do campo */}
    {error && <span className="text-xs text-red-500 mt-1 ml-1 animate-fade-in">{error}</span>}
  </div>
);

export default function CarrinhoPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [etapa, setEtapa] = useState('carrinho');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [erros, setErros] = useState({});
  
  const [cliente, setCliente] = useState({
    nome: '', doc: '', email: '', telefone: '',
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
    destinatario: '', referencia: ''
  });

  const subtotal = cart?.reduce((total, item) => total + (item.preco * item.quantidade), 0) || 0;

  // Lida com a digitação, aplica máscaras e busca CEP
  const handleChange = async (e) => {
    const { name, value } = e.target;
    let maskedValue = value;

    // Limpa o erro do campo assim que o usuário volta a digitar
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: null }));
    }

    if (name === 'doc') maskedValue = maskDoc(value);
    else if (name === 'telefone') maskedValue = maskPhone(value);
    else if (name === 'cep') {
      maskedValue = maskCEP(value);
      
      // Auto-preenchimento ViaCEP
      const cleanCEP = maskedValue.replace(/\D/g, '');
      if (cleanCEP.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
          const data = await res.json();
          if (!data.erro) {
            setCliente(prev => ({
              ...prev,
              cep: maskedValue,
              rua: data.logradouro || '',
              bairro: data.bairro || '',
              cidade: data.localidade || '',
              uf: data.uf || ''
            }));
            return; 
          } else {
            setErros(prev => ({ ...prev, cep: 'CEP não encontrado.' }));
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
        }
      }
    }

    setCliente(prev => ({ ...prev, [name]: maskedValue }));
  };

  // Validação ao sair do campo (onBlur)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let novoErro = null;

    if (name === 'doc') {
      const cleanDoc = value.replace(/\D/g, '');
      if (cleanDoc.length > 0 && cleanDoc.length !== 11 && cleanDoc.length !== 14) {
        novoErro = 'O documento deve ter 11 (CPF) ou 14 (CNPJ) números.';
      }
    }

    if (name === 'telefone') {
      const cleanPhone = value.replace(/\D/g, '');
      if (cleanPhone.length > 0 && cleanPhone.length < 10) {
        novoErro = 'Insira o DDD e o número completo.';
      }
    }

    if (name === 'cep') {
      const cleanCep = value.replace(/\D/g, '');
      if (cleanCep.length > 0 && cleanCep.length !== 8) {
        novoErro = 'O CEP deve conter 8 números.';
      }
    }

    if (novoErro) {
      setErros(prev => ({ ...prev, [name]: novoErro }));
    }
  };

  const finalizarCompra = async () => {
    // 1. Validar preenchimento obrigatório
    if (!cliente.nome || !cliente.doc || !cliente.telefone || !cliente.email || !cliente.cep || !cliente.rua || !cliente.numero) {
      alert("Por favor, preencha todos os campos obrigatórios sinalizados com (*).");
      return;
    }

    // 2. Validar se há erros pendentes nas máscaras
    if (Object.values(erros).some(erro => erro !== null)) {
      alert("Verifique os campos destacados em vermelho antes de prosseguir.");
      return;
    }

    setLoadingCheckout(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, cliente })
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Erro de comunicação com o servidor.");
      }
      
      if (res.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(data.error || "Erro ao processar pagamento.");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingCheckout(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center p-10 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-tupaWood/50 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h1 className="text-4xl font-serif text-tupaGold mb-4">Sua Bancada Está Vazia</h1>
        <p className="text-tupaSilver mb-8 text-lg">Você ainda não selecionou nenhum amplificador.</p>
        <Link 
          href="/loja"
          className="bg-tupaWood text-white px-8 py-3 rounded hover:bg-tupaGold hover:text-tupaBlack transition-colors font-bold uppercase tracking-widest"
        >
          Voltar para a Vitrine
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-10 min-h-screen text-tupaOffWhite">
      <h1 className="text-4xl font-serif text-tupaGold mb-12 uppercase tracking-widest border-b border-tupaWood/30 pb-4">
        {etapa === 'carrinho' ? 'Seu Carrinho' : 'Finalizar Encomenda'}
      </h1>

      {etapa === 'carrinho' ? (
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 bg-tupaGrey p-4 rounded-lg border border-tupaWood/30">
                <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-black rounded overflow-hidden">
                  <img 
                    src={`/img/${item.pastaImagens}/HeroShot.png`} 
                    alt={item.nome}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/img/placeholder.png'; }}
                  />
                </div>
                
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-xl font-serif text-tupaGold mb-1">{item.nome}</h3>
                  <p className="text-tupaSilver text-sm mb-2">{item.categoria}</p>
                  <p className="text-lg font-bold text-white">R$ {item.preco?.toFixed(2).replace('.', ',')}</p>
                </div>
                
                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                  <div className="flex items-center border border-tupaWood rounded bg-black">
                    <button onClick={() => updateQuantity(item.id, item.quantidade - 1)} className="px-3 py-1 text-tupaGold hover:bg-tupaWood/30 transition-colors">-</button>
                    <span className="px-4 py-1 text-white font-bold">{item.quantidade}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantidade + 1)} className="px-3 py-1 text-tupaGold hover:bg-tupaWood/30 transition-colors">+</button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="text-red-500 hover:text-red-400 transition-colors p-2 bg-black/20 rounded-full"
                    title="Remover produto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:w-1/3">
            <div className="bg-[#111] p-8 rounded-lg border border-tupaWood shadow-2xl sticky top-8">
              <h2 className="text-2xl font-serif text-tupaGold mb-6">Resumo</h2>
              <div className="space-y-4 text-tupaSilver mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'itens'})</span>
                  <span className="text-white">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              <div className="border-t border-tupaWood/40 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-2xl font-bold text-tupaGold">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <button 
                onClick={() => setEtapa('checkout')}
                className="w-full bg-tupaGold text-tupaBlack py-4 rounded hover:bg-white transition-colors font-bold uppercase tracking-widest text-lg shadow-[0_0_15px_rgba(212,175,55,0.2)]"
              >
                Continuar Pedido
              </button>

              <div className="mt-8">
                <CalculadoraFrete itens={cart} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <section className="bg-tupaGrey/20 p-8 rounded-lg border border-tupaWood/30">
            <h2 className="text-2xl font-serif text-tupaGold mb-6 flex items-center gap-2">
              📝 Dados para Emissão de Nota Fiscal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
              <InputField name="nome" label="Nome Completo / Razão Social" placeholder="Nome Completo / Razão Social" value={cliente.nome} onChange={handleChange} required containerClass="col-span-full" />
              <InputField name="doc" label="CPF / CNPJ" placeholder="CPF / CNPJ" value={cliente.doc} onChange={handleChange} onBlur={handleBlur} error={erros.doc} maxLength={18} required />
              <InputField name="telefone" label="Telefone de Contato" placeholder="Telefone de Contato" value={cliente.telefone} onChange={handleChange} onBlur={handleBlur} error={erros.telefone} maxLength={15} required />
              <InputField name="email" type="email" label="E-mail" placeholder="E-mail (NF-e e Status)" value={cliente.email} onChange={handleChange} required containerClass="col-span-full" />
            </div>
          </section>

          <section className="bg-tupaGrey/20 p-8 rounded-lg border border-tupaWood/30">
            <h2 className="text-2xl font-serif text-tupaGold mb-6 flex items-center gap-2">
              🚚 Endereço de Entrega
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-2">
              <InputField name="cep" label="CEP" placeholder="CEP" value={cliente.cep} onChange={handleChange} onBlur={handleBlur} error={erros.cep} maxLength={9} required containerClass="md:col-span-1" />
              <InputField name="rua" label="Logradouro (Rua, Av.)" placeholder="Logradouro (Rua, Av.)" value={cliente.rua} onChange={handleChange} required containerClass="md:col-span-2" />
              
              <InputField name="numero" label="Número" placeholder="Número" value={cliente.numero} onChange={handleChange} required containerClass="md:col-span-1" />
              <InputField name="complemento" label="Complemento" placeholder="Complemento (Apto, Bloco)" value={cliente.complemento} onChange={handleChange} containerClass="md:col-span-2" />
              
              <InputField name="bairro" label="Bairro" placeholder="Bairro" value={cliente.bairro} onChange={handleChange} containerClass="md:col-span-1" />
              <InputField name="cidade" label="Cidade" placeholder="Cidade" value={cliente.cidade} onChange={handleChange} readOnly containerClass="md:col-span-1" />
              <InputField name="uf" label="UF" placeholder="UF" value={cliente.uf} onChange={handleChange} readOnly containerClass="md:col-span-1" />
              
              <InputField name="destinatario" label="Nome do Destinatário" placeholder="Nome de quem vai receber" value={cliente.destinatario} onChange={handleChange} containerClass="col-span-full" />
              <InputField name="referencia" label="Ponto de Referência" placeholder="Ponto de Referência (Opcional)" value={cliente.referencia} onChange={handleChange} containerClass="col-span-full" />
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button 
              onClick={() => setEtapa('carrinho')}
              className="sm:w-1/3 bg-transparent border border-tupaWood text-tupaSilver py-4 rounded font-bold uppercase tracking-widest hover:text-white hover:border-tupaGold transition-all"
            >
              Voltar
            </button>
            <button 
              onClick={finalizarCompra}
              disabled={loadingCheckout}
              className="sm:w-2/3 bg-tupaGold text-tupaBlack py-4 rounded font-bold uppercase tracking-widest text-lg shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:bg-white transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loadingCheckout ? (
                'Gerando ambiente seguro...'
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Pagar com Mercado Pago
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}