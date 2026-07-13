import Header from '../components/Header';
import Footer from '../components/Footer'; // 1. Importação do Footer adicionada aqui
import "./globals.css";
import { Inter, Playfair_Display } from 'next/font/google';
import { CartProvider } from '../context/CartContext'; // Caminho relativo seguro

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const serif = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable}`}>
      {/* 2. Adicionado flex, flex-col e min-h-screen para o footer fixar no fundo */}
      <body className="bg-tupaBlack text-tupaOffWhite font-sans flex flex-col min-h-screen">
        <CartProvider>
          <Header />
          {/* 3. Adicionado flex-grow para empurrar o footer para baixo */}
          <main className="flex-grow">{children}</main>
          {/* 4. Footer adicionado aqui! */}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}