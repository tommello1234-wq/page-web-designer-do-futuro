/* =============================================================================
   SITES MODELOS · página só com o portfólio (modo portfólio do template
   Proposta Comercial). É o link que o suporte manda no WhatsApp para quem pede
   os sites modelos do Web Designer do Futuro.

   ATENÇÃO: tudo neste arquivo é público para quem tiver o link, inclusive
   estes comentários. Nada de anotação interna.

   Regras de texto: sem travessão, frases curtas, números só se forem reais.
   Para destacar uma palavra, use *asteriscos* (vira itálico).

   Mudou o título, a descrição ou o link de compartilhar? Gere o build de novo
   (a prévia do link no WhatsApp não roda JavaScript e lê o index.html).

   Template criado por Upward Academy · UPW-PROPOSTA-EYY5
   https://app.upwardacademy.com.br/app/templates
   ============================================================================= */
window.PROPOSTA = {
  exemplo: false,

  // Modo portfólio: só a abertura e o portfólio. Sem validade, número, preço,
  // etapas, investimento nem aprovação.
  modo: 'portfolio',
  // dobras: ['abertura', 'portfolio'], // opcional: escolhe as dobras e a ordem

  // Aba do navegador e prévia do link (lidos no build)
  titulo: 'Sites feitos com IA · Upward Academy',
  // descricao: '', // vazio: usa a promessa

  // Abertura: selo em cima, a frase grande (revelacao) e a linha de baixo (promessa)
  selo: 'Web Designer do Futuro',
  revelacao: 'Sites que você aprende a criar com *IA*.',
  promessa: 'Páginas como essas, criadas com IA no Web Designer do Futuro. Abra cada uma para ver no ar.',

  // Link final da página (para a prévia no WhatsApp)
  compartilhar: { url: 'https://lp.upwardacademy.com.br/modelos/', imagem: 'og.jpg' },

  // Marca do cabeçalho e do rodapé
  autor: {
    nome: 'Upward Academy',
  },

  // Portfólio: vídeos em portfolio/ (versão computador e celular).
  portfolio: {
    intro: 'Alguns projetos, gravados direto da tela.',
    projetos: [
      { nome: 'AERIS X', nicho: 'produto', video: 'portfolio/drone', link: 'https://drone-aeris-x-gravyx.vercel.app/' },
      { nome: 'Esportivo', nicho: 'automotivo', video: 'portfolio/carro' },
      { nome: 'Lumen Jardim Europa', nicho: 'imóveis', video: 'portfolio/imoveis', link: 'https://demonstracao-page-preview.vercel.app/imoveis/lumen/' },
      { nome: 'HALO Beauty Lab', nicho: 'salão', video: 'portfolio/salao', link: 'https://demonstracao-page-preview.vercel.app/salao/halo/' },
      { nome: 'Moura Arquitetura', nicho: 'arquitetura', video: 'portfolio/arquitetura', link: 'https://demonstracao-page-preview.vercel.app/arquitetura/moura/' },
      { nome: 'Varela Advocacia', nicho: 'advocacia', video: 'portfolio/advocacia', link: 'https://demonstracao-page-preview.vercel.app/advocacia/varela/' },
    ],
    // Outros sites no ar: viram a lista "Mais sites no ar", com link
    noAr: [
      { nome: 'Glow Up by Beatriz Costa', nicho: 'estética', link: 'https://demonstracao-page-preview.vercel.app/estetica/glowup/' },
      { nome: 'Vanessa Linhares Estética', nicho: 'estética', link: 'https://demonstracao-page-preview.vercel.app/estetica/vanessalinhares/' },
      { nome: 'FitsFort Academia', nicho: 'academia', link: 'https://demonstracao-page-preview.vercel.app/academia/fitsfort/' },
      { nome: 'Método Prisma', nicho: 'infoproduto', link: 'https://demonstracao-page-preview.vercel.app/infoproduto/prisma/' },
      { nome: 'IARA', nicho: 'SaaS', link: 'https://demonstracao-page-preview.vercel.app/saas/iara/' },
    ],
  },

  // Chamada no fim da página (e o botão do topo; topo: false tira o do topo)
  cta: {
    titulo: 'Você também pode criar páginas *assim*.',
    botao: 'Quero aprender a criar',
    link: 'https://lp.upwardacademy.com.br/promo?utm_source=whatsapp&utm_medium=suporte&utm_campaign=sites-modelos',
  },
};
