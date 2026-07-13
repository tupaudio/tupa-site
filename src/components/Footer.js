import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-tupaWood pt-16 pb-8 text-tupaOffWhite text-sm">
      <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        
        {/* Coluna 1: Contato */}
        <div className="space-y-4">
          <h4 className="text-tupaGold font-serif text-xl mb-6">Contato</h4>
          <p className="flex items-center gap-2">
            <span className="text-tupaGold">WhatsApp:</span> 
            <a href="https://wa.me/5527999563227" target="_blank" rel="noopener noreferrer" className="hover:text-tupaGold transition-colors">
              (27) 99956-3227
            </a>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-tupaGold">E-mail:</span> 
            <a href="mailto:tupaaudio@outlook.com" className="hover:text-tupaGold transition-colors">
              tupaaudio@outlook.com
            </a>
          </p>
          <p className="pt-2 text-tupaSilver">
            Atendimento:<br/>Segunda a Sexta, das 8:00 às 17:00
          </p>
          <div className="flex gap-4 pt-4">
            <a href="https://www.instagram.com/tupa.audio/" target="_blank" rel="noopener noreferrer" className="hover:text-tupaGold transition-colors font-bold tracking-wider">
              INSTAGRAM
            </a>
            <a href="https://www.youtube.com/@TupãÁudio" target="_blank" rel="noopener noreferrer" className="hover:text-tupaGold transition-colors font-bold tracking-wider">
              YOUTUBE
            </a>
          </div>
        </div>

        {/* Coluna 2: Enviamos Por */}
        <div>
          <h4 className="text-tupaGold font-serif text-xl mb-6">Enviamos por</h4>
          <ul className="space-y-3 text-tupaSilver">
            <li>• Correios (PAC e Sedex)</li>
            <li>• Jadlog</li>
            <li>• Loggi</li>
          </ul>
        </div>

        {/* Coluna 3: Recebemos Por */}
        <div>
          <h4 className="text-tupaGold font-serif text-xl mb-6">Pagamento Seguro</h4>
          <ul className="space-y-3 text-tupaSilver">
            <li>• PIX (Aprovação imediata)</li>
            <li>• Mercado Pago (Cartões)</li>
          </ul>
        </div>

        {/* Coluna 4: Políticas */}
        <div>
          <h4 className="text-tupaGold font-serif text-xl mb-6">Institucional</h4>
          <ul className="space-y-3 flex flex-col">
            <Link href="/politicas/privacidade" className="text-tupaSilver hover:text-tupaGold transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/politicas/trocas" className="text-tupaSilver hover:text-tupaGold transition-colors">
              Trocas e Devoluções
            </Link>
            <Link href="/politicas/prazos" className="text-tupaSilver hover:text-tupaGold transition-colors">
              Prazos e Entrega
            </Link>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-10 pt-8 border-t border-white/10 text-center text-tupaSilver text-xs">
        <p>© {new Date().getFullYear()} Tupã Áudio. Amplificadores Artesanais, Timbres Orgânicos. Feito à mão no Brasil.</p>
      </div>
    </footer>
  );
}