import { NextResponse } from 'next/server';

// =========================================================
// TUPÃ ÁUDIO — Leitura de estoque (Airtable)
// Devolve, pra cada produto, quantas unidades pré-fabricadas
// existem e qual o prazo em cada cenário (com estoque / sob encomenda).
//
// Variáveis de ambiente (Netlify → Environment variables):
//   AIRTABLE_TOKEN      → Personal access token (começa com "pat")
//   AIRTABLE_BASE_ID    → ID da base (começa com "app")
//   AIRTABLE_TABLE_NAME → nome da tabela (ex: "Produtos")
// =========================================================

export async function GET() {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tabela = process.env.AIRTABLE_TABLE_NAME || 'Produtos';

  if (!token || !baseId) {
    // Sem configuração ainda: devolve vazio — o site trata isso
    // mostrando os produtos sem informação de prazo, sem quebrar nada.
    return NextResponse.json({});
  }

  try {
    const resposta = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tabela)}`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 60 } }
    );

    if (!resposta.ok) throw new Error(`Airtable respondeu ${resposta.status}`);

    const dados = await resposta.json();
    const estoque = {};

    (dados.records || []).forEach((registro) => {
      const id = registro.fields?.ProdutoID;
      if (id === undefined) return;
      estoque[id] = {
        estoque: Number(registro.fields?.Estoque) || 0,
        prazoComEstoque: Number(registro.fields?.PrazoComEstoque) || null,
        prazoSobEncomenda: Number(registro.fields?.PrazoSobEncomenda) || null,
      };
    });

    return NextResponse.json(estoque);
  } catch (erro) {
    console.error('Erro ao ler estoque no Airtable:', erro);
    return NextResponse.json({});
  }
}