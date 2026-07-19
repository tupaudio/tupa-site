export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { cepDestino, itens } = body;

    const cepOrigem = process.env.CEP_ORIGEM;
    const token = process.env.MELHOR_ENVIO_TOKEN;

    const productsPayload = itens.map((item) => {
      // Proteção contra os dois formatos possíveis de dimensão:
      // "40x35x25" (string, como está hoje em produtos.js) ou
      // largura/altura/comprimento já separados.
      let largura = item.largura;
      let altura = item.altura;
      let comprimento = item.comprimento;

      if ((!largura || !altura || !comprimento) && typeof item.dimensoes === 'string') {
        const partes = item.dimensoes.split('x').map((n) => parseFloat(n.trim()));
        if (partes.length === 3 && partes.every((n) => !Number.isNaN(n))) {
          [largura, altura, comprimento] = partes;
        }
      }

      return {
        id: item.id.toString(),
        // ATENÇÃO: produtos.js usa "pesoKg", não "peso" — cobrindo os dois.
        weight: item.peso || item.pesoKg || 15,
        width: largura || 50,
        height: altura || 30,
        length: comprimento || 40,
        insurance_value: item.preco || 3500,
        quantity: item.quantidade || 1
      };
    });

    const url = 'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate';

    const payload = {
      from: { postal_code: cepOrigem },
      to: { postal_code: cepDestino.replace(/\D/g, '') },
      products: productsPayload,
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

    const transportadorasDisponiveis = data.filter(t => t.price && t.error === undefined);

    // Filtro de transportadoras autorizadas pela Tupã Áudio
    const transportadorasAutorizadas = ['Correios', 'Loggi', 'Total Express'];
    const transportadorasFiltradas = transportadorasDisponiveis.filter(t =>
      transportadorasAutorizadas.some((autorizada) => t.company?.name?.includes(autorizada))
    );

    return NextResponse.json(transportadorasFiltradas);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
