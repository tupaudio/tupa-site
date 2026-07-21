// app/sucesso/page.js
import { Suspense } from 'react';
import SucessoClient from './SucessoClient';

export const dynamic = 'force-dynamic';

export default function SucessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-tupaBlack">
        <div className="w-12 h-12 border-4 border-tupaGold border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SucessoClient />
    </Suspense>
  );
}