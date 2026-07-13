# Tupã Áudio - Diretrizes de Desenvolvimento

Este documento define as regras de estilo e tom para o código do projeto Tupã Áudio.

## Filosofia do Código
- **Artesanal:** Código limpo, legível e organizado. Evitamos excesso de bibliotecas desnecessárias.
- **Performance:** Foco em carregamento rápido (o som não pode esperar).
- **Identidade:** Mantemos sempre a estética "boutique". O design deve ser minimalista, sofisticado e focado no produto.

## Padrões de Estilo
- **CSS:** Uso exclusivo de Tailwind CSS com paleta de cores definida (`tupaGold`, `tupaBlack`).
- **Arquitetura:** Conteúdo separado de componentes (pasta `/content`).
- **Componentização:** Cada elemento (Header, Footer, AmpCard) deve ser um componente reutilizável em `/components`.

## Voz e Tom (Copywriting)
- O tom deve ser imponente, porém acessível.
- Valorizamos a engenharia brasileira e o processo artesanal.
- Evitamos jargões estrangeiros genéricos onde o termo em português ou a descrição técnica for mais precisa.

## Regras para Assistentes
1. Sempre priorize o uso de `siteData.js` para qualquer alteração de texto.
2. Não altere o design sem consultar a paleta de cores oficial.
3. Se o código for complexo, prefira a clareza à brevidade.