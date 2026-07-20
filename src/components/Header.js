// src/components/Header.js - VERSÃO CORRIGIDA
'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const context = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Segurança: se não estiver montado ou não tiver contexto, mostra vazio
  if (!mounted || !context) {
    return (
      <header className="flex items-center justify-between p-6 border-b border-tupaGold bg-tupaBlack text-tupaOffWhite">
        <div className="text-2xl font-serif text-tupaGold tracking-widest uppercase">
          <Link href="/">Tupã Áudio</Link>
        </div>
        <nav className="flex gap-8 items-center">
          <Link href="/" className="hover:text-tupaGold transition-colors">Início</Link>
          <Link href="/loja" className="hover:text-tupaGold transition-colors">Loja</Link>
          <Link href="/projetos" className="hover:text-tupaGold transition-colors">Projetos</Link>
          <Link href="/bancada" className="hover:text-tupaGold transition-colors">A Bancada</Link>
          <Link href="/personalizar" className="bg-tupaGold text-tupaBlack px-4 py-1 rounded hover:bg-white transition-all font-bold uppercase text-sm">
            Personalize o seu!
          </Link>
          <Link href="/carrinho" className="border border-tupaGold px-3 py-1 rounded hover:bg-tupaGold hover:text-tupaBlack transition-all">
            Carrinho
          </Link>
        </nav>
      </header>
    );
  }

  const cart = context.cart || [];

  return (
    <header className="flex items-center justify-between p-6 border-b border-tupaGold bg-tupaBlack text-tupaOffWhite">
      {/* Logo */}
      <div className="text-2xl font-serif text-tupaGold tracking-widest uppercase">
        <Link href="/">Tupã Áudio</Link>
      </div>

      {/* Navegação Consolidada */}
      <nav className="flex gap-8 items-center">
        <Link href="/" className="hover:text-tupaGold transition-colors">Início</Link>
        <Link href="/loja" className="hover:text-tupaGold transition-colors">Loja</Link>
        <Link href="/projetos" className="hover:text-tupaGold transition-colors">Projetos</Link>
        <Link href="/bancada" className="hover:text-tupaGold transition-colors">A Bancada</Link>
        <Link href="/personalizar" className="bg-tupaGold text-tupaBlack px-4 py-1 rounded hover:bg-white transition-all font-bold uppercase text-sm">
          Personalize o seu!
        </Link>
        
        {/* Carrinho */}
        <Link href="/carrinho" className="relative border border-tupaGold px-3 py-1 rounded hover:bg-tupaGold hover:text-tupaBlack transition-all">
          Carrinho {cart.length > 0 && `(${cart.length})`}
        </Link>
      </nav>
    </header>
  );
}