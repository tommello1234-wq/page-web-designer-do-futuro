/* =============================================================================
   PROPOSTA COMERCIAL · o único arquivo com o conteúdo da proposta
   -----------------------------------------------------------------------------
   Para cada cliente, troque só o bloco "POR CLIENTE" (nome, nº, validade,
   projeto e valor). O resto é o seu serviço e vale para todas as propostas.
   A página calcula sozinha: datas do cronograma, parcelas, desconto e a
   mensagem de aprovação no WhatsApp.

   ATENÇÃO: tudo neste arquivo é público para quem tiver o link, inclusive
   estes comentários. Nada de anotação interna, custo, margem ou CPF.

   Regras de texto: sem travessão, frases curtas, números só se forem reais.
   Para destacar uma palavra, use *asteriscos* (vira itálico).

   Template criado por Upward Academy · UPW-PROPOSTA-EYY5
   Licença __UPW_LICENCA__ · revenda e redistribuição proibidas (LICENCA.txt)
   https://app.upwardacademy.com.br/app/templates
   ============================================================================= */
window.PROPOSTA = {
  // Enquanto for true, aparece a faixa "DADOS DE EXEMPLO" no topo.
  exemplo: false,

  /* ---------------------------------------------------------------- POR CLIENTE */
  numero: '014', // só para uso interno (não aparece na página)
  validaAte: '2026-10-25', // AAAA-MM-DD · vale até 23:59 (horário de Brasília)
  motivoValidade: 'quando fecho a agenda do próximo mês',

  cliente: {
    contato: '', // primeiro nome para a saudação ("Boa tarde, Ana."); pode ficar vazio
    contatoCompleto: '', // nome completo, já preenchido na aprovação
    empresa: 'Inkolor',
  },

  projeto: {
    nome: 'Site completo', // ex.: 'Landing page', 'Site institucional'
    resumo: 'Design exclusivo, animações, versão para celular e configuração no Google.',
  },

  investimento: {
    valor: 4900, // preço à vista no Pix (o que aparece grande na revelação)
    parcelado: 5300, // preço nas formas parceladas (entrada + entrega e cartão)
  },

  // Link final da proposta (para a prévia no WhatsApp). Pode ficar vazio no teste.
  compartilhar: { url: 'https://lp.upwardacademy.com.br/proposta-inkolor/', imagem: 'og.jpg' },

  /* ------------------------------------------------------------- SEU SERVIÇO */
  autor: {
    nome: 'Tom Melo',
    cargo: 'Web designer',
    foto: 'img/tom.webp', // foto quadrada pequena (avatar); deixe '' se não tiver
    recorte: 'img/tom', // foto recortada sem fundo da abertura (img/tom-480/760/1100.webp); '' para não usar
    // Abertura: sua foto recortada e a versão revelada pelo mouse (mesmo enquadramento)
    // arquivos img/tom-rosto-600/1000.webp e img/tom-capacete-600/1000.webp (1000x1250)
    revelar: { base: 'img/tom-rosto', revelada: 'img/tom-capacete' },
    whatsapp: '5588992089323', // só números: 55 + DDD + número
    email: '', // ex.: 'contato@seudominio.com.br' (vazio: não aparece)
    instagram: '', // ex.: '@seuperfil' (vazio: não aparece)
    sobre: [
      'Crio sites e landing pages com cara de marca grande, do design ao código.',
      'Cada projeto sai com animação, versão para celular e configuração no Google feitas por mim.',
    ],
  },

  // Frase grande da abertura, ao lado da foto (o mouse revela a armadura)
  revelacao: 'Vou revelar o melhor da sua *marca*.',
  promessa: 'Não é só um simples site. É uma *experiência*.',

  // Portfólio: vídeos em public/portfolio/ (versão computador e celular).
  portfolio: {
    publicados: 22, // quantos sites você já publicou (número real)
    projetos: [
      { nome: 'AERIS X', nicho: 'produto', video: 'portfolio/drone', link: 'https://drone-aeris-x-gravyx.vercel.app/' },
      { nome: 'Esportivo', nicho: 'automotivo', video: 'portfolio/carro' },
      { nome: 'Renascença com Wi-Fi', nicho: 'experiência', video: 'portfolio/renascenca', link: 'https://demonstracao-page-preview.vercel.app/experiencia/renascenca/' },
      { nome: 'Lumen Jardim Europa', nicho: 'imóveis', video: 'portfolio/imoveis', link: 'https://demonstracao-page-preview.vercel.app/imoveis/lumen/' },
      { nome: 'HALO Beauty Lab', nicho: 'salão', video: 'portfolio/salao', link: 'https://demonstracao-page-preview.vercel.app/salao/halo/' },
      { nome: 'Moura Arquitetura', nicho: 'arquitetura', video: 'portfolio/arquitetura', link: 'https://demonstracao-page-preview.vercel.app/arquitetura/moura/' },
      { nome: 'Varela Advocacia', nicho: 'advocacia', video: 'portfolio/advocacia', link: 'https://demonstracao-page-preview.vercel.app/advocacia/varela/' },
    ],
    // Outros sites no ar: entram só na lista de nichos atendidos do portfólio
    noAr: [
      { nome: 'Glow Up by Beatriz Costa', nicho: 'estética', link: 'https://demonstracao-page-preview.vercel.app/estetica/glowup/' },
      { nome: 'Vanessa Linhares Estética', nicho: 'estética', link: 'https://demonstracao-page-preview.vercel.app/estetica/vanessalinhares/' },
      { nome: 'FitsFort Academia', nicho: 'academia', link: 'https://demonstracao-page-preview.vercel.app/academia/fitsfort/' },
      { nome: 'Método Prisma', nicho: 'infoproduto', link: 'https://demonstracao-page-preview.vercel.app/infoproduto/prisma/' },
      { nome: 'IARA', nicho: 'SaaS', link: 'https://demonstracao-page-preview.vercel.app/saas/iara/' },
    ],
  },

  depoimentos: [
    // { texto: '...', nome: 'Nome Sobrenome', empresa: 'Empresa', fonte: 'avaliação no Google' },
  ],

  // Cronograma: as datas são calculadas a partir do dia em que a proposta é aberta.
  etapas: {
    feriados: ['2026-11-02', '2026-11-15', '2026-11-20', '2026-12-25'],
    // dias: dias úteis da etapa (a soma é o prazo mostrado na página)
    // duracao: texto no lugar de "N dias úteis" (opcional, ex.: '30 minutos')
    lista: [
      {
        titulo: 'Call de início',
        dias: 0, // 30 minutos: não conta no prazo
        duracao: '30 minutos',
        voceRecebe: 'Uma conversa para eu entender o projeto, a sua empresa, o que você quer e o material que você já tem',
        precisoDeVoce: '30 minutos para a gente conversar',
      },
      {
        titulo: 'Coleta de informações',
        dias: 3,
        voceRecebe: 'Uma lista clara do que falta, para nada travar o projeto',
        precisoDeVoce: 'Textos, identidade visual, referências e os acessos do domínio e da hospedagem',
      },
      {
        titulo: 'Layout e desenvolvimento',
        dias: 12,
        voceRecebe: 'O site completo, montado com as suas informações, num link de teste',
        precisoDeVoce: 'Nada, essa parte é comigo',
      },
      {
        titulo: 'Aprovação',
        dias: 3,
        voceRecebe: 'O link para revisar e os ajustes que você pedir',
        precisoDeVoce: 'Sua aprovação',
      },
      {
        titulo: 'Site no ar',
        dias: 2,
        voceRecebe: 'O site publicado, com SEO, segurança e Google configurados',
        precisoDeVoce: 'Nada',
      },
    ],
  },

  pagamento: {
    padrao: 'pix',
    pix: { rotulo: 'Pix à vista' }, // descontoPct: 5 daria 5% sobre o valor; aqui o desconto é o parcelado
    entrada: {
      rotulo: 'Entrada + entrega',
      partes: [
        { pct: 50, quando: 'para reservar a data' },
        { pct: 50, quando: 'quando o site for ao ar' },
      ],
    },
    cartao: { rotulo: 'Cartão de crédito', parcelas: 10 }, // sem juros até este número
  },

  combinados: {
    incluso: [
      'Design exclusivo, feito para a sua marca',
      'Versão pensada primeiro para o celular',
      'Animações e interações',
      'Textos revisados por mim',
      'Configuração no Google, Maps e Analytics',
      'Domínio, hospedagem e acessos no seu nome',
      'Ajustes no layout até chegar no resultado que você quer',
    ],
    naoIncluso: [], // o que fica de fora (opcional); vazio, a coluna some
    garantias: [
      { titulo: 'Você só paga a segunda parte com o site no ar', texto: 'Na opção de entrada, a segunda metade só vence quando você aprovar o site publicado.' },
      { titulo: 'O site é seu', texto: 'Código, domínio e acessos ficam no seu nome desde o primeiro dia.' },
      { titulo: 'Ajusto até você aprovar', texto: 'Eu sigo ajustando o layout até chegar no resultado que você quer.' },
    ],
    duvidas: [
      { p: 'E se eu não gostar do layout?', r: 'Você aprova a página inicial antes de eu desenvolver o resto, e eu sigo ajustando até ficar do jeito que você quer.' },
      { p: 'O que eu preciso entregar?', r: 'Textos, identidade visual, referências e os acessos do domínio e da hospedagem. Na call de início eu te mostro tudo, e se faltar algo eu indico um caminho.' },
      { p: 'Consigo mudar textos depois?', r: 'Sim. Depois que o site for ao ar, é só me chamar que eu faço os ajustes.' },
      { p: 'Hospedagem e domínio têm custo extra?', r: 'O domínio custa cerca de R$ 40 por ano e a hospedagem cerca de R$ 30 por mês, pagos direto às empresas, no seu nome.' },
      { p: 'Quando o site aparece no Google?', r: 'O Google costuma mostrar um site novo entre 2 e 6 semanas depois de publicado. O WhatsApp e o Maps funcionam no primeiro dia.' },
    ],
  },

};
