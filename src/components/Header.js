// src/components/Header.js - VERSÃO CORRIGIDA
'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const context = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cart = (mounted && context?.cart) ? context.cart : [];

  const links = [
    { href: '/',            label: 'Início' },
    { href: '/loja',        label: 'Loja' },
    { href: '/projetos',    label: 'Projetos' },
    { href: '/bancada',     label: 'A Bancada' },
  ];

  return (
    <header className="border-b border-tupaGold bg-tupaBlack text-tupaOffWhite">
      <div className="flex items-center justify-between px-6 py-4">

                  {/* Logo */}
          <div className="shrink-0">
            <Link href="/" onClick={() => setMenuAberto(false)}>
              <img
                src="/img/logo.png"
                alt="Tupã Áudio"
                className="h-8 w-auto"
              />
            </Link>
          </div>

        {/* Navegação desktop */}
        <nav className="hidden md:flex gap-6 items-center">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-tupaGold transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/personalizar" className="bg-tupaGold text-tupaBlack px-4 py-1 rounded hover:bg-white transition-all font-bold uppercase text-sm">
            Personalize o seu!
          </Link>
          <Link href="/carrinho" className="border border-tupaGold px-3 py-1 rounded hover:bg-tupaGold hover:text-tupaBlack transition-all">
            Carrinho {cart.length > 0 && `(${cart.length})`}
          </Link>
        </nav>

        {/* Botões mobile: carrinho + hambúrguer */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/carrinho" className="border border-tupaGold px-3 py-1 rounded text-sm hover:bg-tupaGold hover:text-tupaBlack transition-all">
            Carrinho {cart.length > 0 && `(${cart.length})`}
          </Link>
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label="Menu"
            className="border border-tupaGold p-2 rounded hover:bg-tupaGold hover:text-tupaBlack transition-all"
          >
            {menuAberto ? (
              // X para fechar
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              // Hambúrguer
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile expandido */}
      {menuAberto && (
        <nav className="md:hidden flex flex-col border-t border-tupaGold/30 px-6 py-4 gap-4">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuAberto(false)}
              className="hover:text-tupaGold transition-colors py-1"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/personalizar"
            onClick={() => setMenuAberto(false)}
            className="bg-tupaGold text-tupaBlack px-4 py-2 rounded text-center font-bold uppercase text-sm hover:bg-white transition-all"
          >
            Personalize o seu!
          </Link>
        </nav>
      )}
    </header>
  );
}
