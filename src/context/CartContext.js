'use client';
import { createContext, useContext, useState, useEffect } from 'react';

// Criação do Contexto
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // 1. Carregar o carrinho guardado quando o site abre
  useEffect(() => {
    const savedCart = localStorage.getItem('tupa_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Descarta itens de formato antigo/corrompido (ex.: salvos antes de
        // uma mudança na convenção de campos/imagens do produto), para não
        // quebrar o checkout com dados obsoletos.
        const cartValido = Array.isArray(parsed)
          ? parsed.filter((item) => item && item.id != null && item.nome && item.preco != null)
          : [];
        setCart(cartValido);
      } catch (error) {
        console.error('Erro ao carregar o carrinho', error);
        localStorage.removeItem('tupa_cart');
      }
    }
  }, []);

  // 2. Guardar automaticamente sempre que o carrinho for alterado
  // ✅ CORRIGIDO: Sanitiza os dados antes de salvar
  useEffect(() => {
    // Sanitiza os dados para garantir consistência
    const cartSanitizado = cart.map(item => ({
      id: item.id,
      nome: item.nome?.substring(0, 100) || 'Produto',
      preco: Number(item.preco) || 0,
      quantidade: Math.max(1, Math.min(50, Number(item.quantidade) || 1)),
      pastaImagens: item.pastaImagens || '',
      // Remove campos sensíveis ou desnecessários
    }));
    
    localStorage.setItem('tupa_cart', JSON.stringify(cartSanitizado));
  }, [cart]);

  // Função para Adicionar ao Carrinho
  const addToCart = (produto) => {
    setCart((prevCart) => {
      const itemExiste = prevCart.find((item) => item.id === produto.id);
      
      // Se já existe, apenas aumenta a quantidade
      if (itemExiste) {
        return prevCart.map((item) =>
          item.id === produto.id 
            ? { ...item, quantidade: Math.min(item.quantidade + 1, 50) } 
            : item
        );
      }
      
      // Se não existe, adiciona com quantidade 1
      return [...prevCart, { ...produto, quantidade: 1 }];
    });
  };

  // Função para Remover do Carrinho
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Função para Atualizar a Quantidade (Botões de + e -)
  const updateQuantity = (id, novaQuantidade) => {
    if (novaQuantidade < 1) return; // Impede que a quantidade fique a zero ou negativa
    if (novaQuantidade > 50) return; // Limite máximo de 50 unidades
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantidade: novaQuantidade } : item
      )
    );
  };

  // Função para limpar tudo (após a compra)
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook personalizado para usar o carrinho mais facilmente noutros ficheiros
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}