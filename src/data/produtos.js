export const produtos = [
  {
    id: 1,
    nome: "Tupã Arã 5W 5F1",
    categoria: "Guitarra",
    tecnologia: "Valvulado",
    pastaImagens: "guitarra/ara-5w-5f1",
    preco: 2800,
    pesoKg: 8.0,
    dimensoes: "40x35x25",
    prazoComEstoque: 30, // dias se usar peça pré-fabricada
    prazoSobEncomenda: 60, // dias se for do zero
    especificacoes: { potencia: "5W RMS", entradasSaidas: "1x Input", controles: "Volume" },
    descricao: "O sagrado circuito 5F1 tweed em formato micro-combo.",
    descricaoLonga: "O Arã 5W 5F1 é a nossa homenagem definitiva à pureza do circuito 5F1. Projetado como um combo de estúdio de alta fidelidade, ele entrega aquele som 'tweed' reverenciado mundialmente por sua resposta extremamente responsiva ao toque da palheta. Com 5 Watts reais de potência em Classe A purista, ele oferece o caminho de sinal mais curto e transparente possível, resultando em uma compressão orgânica e uma saturação de válvulas que 'respira' conforme a sua intensidade de jogo."
  },
  {
    id: 3,
    nome: "Tupã Iaci 125W",
    categoria: "Guitarra",
    tecnologia: "Transistorizado",
    pastaImagens: "guitarra/iaci-125w",
    preco: 2200,
    pesoKg: 6.5,
    dimensoes: "40x25x20",
    prazoComEstoque: 30,  // dias se usar peça pré-fabricada
    prazoSobEncomenda: 60, // dias se for do zero
    especificacoes: { potencia: "125W/250W", entradasSaidas: "1x Input", controles: "Gain, EQ 3 bandas, Master" },
    descricao: "Cabeçote transistorizado de boutique, headroom infinito.",
    descricaoLonga: "O Iaci 125W é o nosso cabeçote transistorizado topo de linha para guitarra. Projetado para músicos que exigem resposta de transientes ultra-rápida, dinâmica tridimensional e uma plataforma de pedais impecável. Seu circuito analógico opera em uma robusta topologia de potência Classe AB, entregando 125 Watts reais em 8 Ohms e dobrando para 250 Watts em 4 Ohms."
  },
  {
    id: 4,
    nome: "Tupã Itá 250W",
    categoria: "Baixo",
    tecnologia: "Transistorizado",
    pastaImagens: "baixo/ita-250w",
    preco: 2400,
    pesoKg: 7.5,
    dimensoes: "45x25x20",
    prazoComEstoque: 30,  // dias se usar peça pré-fabricada
    prazoSobEncomenda: 60, // dias se for do zero
    especificacoes: { potencia: "250W", entradasSaidas: "1x Input", controles: "Gain, EQ 3 bandas, Master" },
    descricao: "Cabeçote de alto desempenho para contrabaixo.",
    descricaoLonga: "A força indomável da rocha com potência monumental. O Itá 250W garante deslocamento máximo de ar e transientes ultra-rápidos sem qualquer sinal de compressão. Circuito de boutique projetado com transistores de altíssima fidelidade."
  },
  {
    id: 5,
    nome: "Tupã Ibi 5W",
    categoria: "Baixo",
    tecnologia: "Valvulado",
    pastaImagens: "baixo/ibi-5w",
    preco: 2600,
    pesoKg: 7.5,
    dimensoes: "35x30x25",
    prazoComEstoque: 30,  // dias se usar peça pré-fabricada
    prazoSobEncomenda: 60, // dias se for do zero
    especificacoes: { potencia: "5W", entradasSaidas: "1x Input", controles: "Volume" },
    descricao: "Combo purista valvulado para contrabaixo.",
    descricaoLonga: "A essência purista do circuito 5F1 aplicada ao baixo. Resposta orgânica, dinâmica crua e aquela compressão natural que os grandes estúdios procuram."
  },
  {
    id: 7,
    nome: "Tupã KunumiBox",
    categoria: "Kunumi",
    tecnologia: "Transistorizado",
    pastaImagens: "kunumi/box",
    preco: 950,
    pesoKg: 2.5,
    dimensoes: "20x15x10",
    prazoComEstoque: 30,  // dias se usar peça pré-fabricada
    prazoSobEncomenda: 60, // dias se for do zero
    especificacoes: { potencia: "Micro", entradasSaidas: "Input, FX Send/Return", controles: "Tilt EQ, Volume" },
    descricao: "Micro-cabeçote multi-instrumento."
  },
  {
    id: 8,
    nome: "Tupã KunumiCombo",
    categoria: "Kunumi",
    tecnologia: "Transistorizado",
    pastaImagens: "kunumi/combo",
    preco: 1400,
    pesoKg: 5.0,
    dimensoes: "30x25x20",
    prazoComEstoque: 30,  // dias se usar peça pré-fabricada
    prazoSobEncomenda: 60, // dias se for do zero
    especificacoes: { potencia: "Micro", entradasSaidas: "Input, Fone", controles: "Tilt EQ, Volume" },
    descricao: "Versão autocontida com sistema de encaixe.",
    descricaoLonga: "O Kunumi Combo redefine o conceito de amplificador integrado compacto. Com sistema de encaixe deslizante para o Kunumi Box e tela em palha indiana, é a união perfeita de engenharia e marcenaria fina."
  },
  {
    id: 9,
    nome: "Tupã Iaci H 300W",
    categoria: "Guitarra",
    tecnologia: "Híbrido",
    pastaImagens: "guitarra/iaci-h-300w",
    preco: 2700,
    pesoKg: 3.5,
    dimensoes: "30x20x15",
    prazoComEstoque: 30, // dias se usar peça pré-fabricada
    prazoSobEncomenda: 60, // dias se for do zero
    especificacoes: { potencia: "300W", entradasSaidas: "Input, FX Loop", controles: "Gain, EQ, Master" },
    descricao: "Cabeçote híbrido de alta performance.",
    descricaoLonga: "O calor harmônico da válvula com a resposta devastadora de 300W analógicos. Dinâmica tridimensional e plataforma de pedais definitiva."
  },
  {
    id: 10,
    nome: "Tupã Itá H 300W",
    categoria: "Baixo",
    tecnologia: "Híbrido",
    pastaImagens: "baixo/ita-h-300w",
    preco: 2700,
    pesoKg: 4.0,
    dimensoes: "30x20x15",
    prazoComEstoque: 30, // dias se usar peça pré-fabricada
    prazoSobEncomenda: 60, // dias se for do zero
    especificacoes: { potencia: "300W", entradasSaidas: "Input, FX Loop", controles: "Gain, EQ, Master" },
    descricao: "Cabeçote de baixo híbrido portátil.",
    descricaoLonga: "O melhor dos dois mundos: calor valvulado no pré e precisão analógica na potência. Soco firme e definição cristalina."
  },
  {
    id: 999, // Um ID alto para não conflitar com os reais
    nome: "Produto de Teste - Integração MP",
    categoria: "Teste",
    tecnologia: "Digital",
    preco: 0.01, // O valor do seu teste!
    estoque: 10, // Muito importante ter estoque > 0 para o botão "Comprar" aparecer
    pesoKg: 1.0, // Necessário caso você já tenha cálculo de frete ativado
    dimensoes: "10x12x15",
    prazoComEstoque: 30, // dias se usar peça pré-fabricada
    prazoSobEncomenda: 60, // dias se for do zero
    pastaImagens: "guitarra/ara-5w-5f1", // Usando a imagem do Arã apenas como "placeholder" para não quebrar o layout
    descricao: "Este é um produto temporário apenas para testar o checkout do Mercado Pago no ambiente de produção."
  }
];