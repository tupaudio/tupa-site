import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    // Agora recebemos um array de 'itens' em vez de um único 'produto'
    const { cepDestino, itens } = body;

    const cepOrigem = process.env.CEP_ORIGEM;
    const token = process.env.MELHOR_ENVIO_TOKEN;

    // Transformamos a lista do seu carrinho no formato exigido pelo Melhor Envio
    const productsPayload = itens.map((item) => ({
      id: item.id.toString(),
      weight: item.peso || 15, // Se não tiver peso, assume 15kg
      width: item.largura || 50,
      height: item.altura || 30,
      length: item.comprimento || 40,
      insurance_value: item.preco || 3500, // O valor do seguro soma automaticamente
      quantity: item.quantidade || 1 // Multiplica o peso por X unidades
    }));

    const url = 'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate';
    
    const payload = {
      from: { postal_code: cepOrigem },
      to: { postal_code: cepDestino.replace(/\D/g, '') },
      products: productsPayload, // Enviamos a lista completa de produtos
      options: {
        receipt: false,
        own_hand: false
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'TupaAudio (tupaaudio@outlook.com)'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao calcular na transportadora' }, { status: 400 });
    }

    // Filtra as transportadoras válidas
    const transportadorasDisponiveis = data.filter(t => t.price && t.error === undefined);
// Filtro de Transportadoras Autorizadas pela Tupã Áudio
    const transportadorasAutorizadas = ['Correios', 'Loggi', 'Total Express'];
    const transportadorasFiltradas = transportadorasDisponiveis.filter(t => 
  transportadorasAutorizadas.some(autorizada => t.company.name.includes(autorizada))
);

return NextResponse.json(transportadorasFiltradas);
    return NextResponse.json(transportadorasDisponiveis);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}