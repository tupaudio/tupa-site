// src/app/layout.js
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://www.tupaaudio.com.br'),
  title: {
    default: 'Tupã Áudio - Amplificadores Artesanais',
    template: '%s | Tupã Áudio'
  },
  description: 'Amplificadores artesanais com alma. Som analógico, construção sob medida e design único para músicos que buscam autenticidade.',
  keywords: ['amplificador valvulado', 'amplificador artesanal', 'guitarra', 'baixo', 'tube amp', 'handwired'],
  authors: [{ name: 'Tupã Áudio' }],
  creator: 'Tupã Áudio',
  publisher: 'Tupã Áudio',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.SITE_URL || 'https://www.tupaaudio.com.br',
    siteName: 'Tupã Áudio',
    title: 'Tupã Áudio - Amplificadores Artesanais',
    description: 'Amplificadores artesanais com alma. Som analógico, construção sob medida e design único.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tupã Áudio - Amplificadores Artesanais',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tupã Áudio - Amplificadores Artesanais',
    description: 'Amplificadores artesanais com alma.',
    images: ['/og-image.jpg'],
    site: '@tupaaudio',
    creator: '@tupaaudio',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID || '',
  },
  alternates: {
    canonical: process.env.SITE_URL || 'https://www.tupaaudio.com.br',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-tupaBlack">
        <CartProvider>
          <Header />
          {/* ✅ CORRIGIDO: Removido <main> daqui para evitar duplicidade com as páginas */}
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}