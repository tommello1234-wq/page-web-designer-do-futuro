// Course-specific offer. Never fall back to a Gravyx subscription checkout.
window.UGC_COURSE = Object.freeze({
  name: 'Vídeos com IA',
  cashPrice: 97,
  installments: null,
  installmentPrice: null,
  checkoutUrl: 'https://app.upwardacademy.com.br/checkout/0d763645-8638-4065-99c5-2aba0d0796d6/5fef8a37-c80c-41fb-a1d8-2d6476373a22',
  accessPeriod: null,
  demoVideoUrl: null,
  // Add final gallery videos here, grouped by style. Empty styles show an upcoming state.
  galleryCategories: [
  {
    "id": "ugc",
    "label": "UGC e influencers",
    "videos": [
      {
        "id": "ugc-3",
        "title": "Cuidados com o cabelo",
        "src": "/curso-ugc-ia/assets/videos/ugc-3.mp4",
        "poster": "/curso-ugc-ia/assets/creator-3.jpg",
        "alt": "Vídeo de demonstração de produto para cabelo",
        "caption": "O produto em uso"
      },
      {
        "id": "ugc-7",
        "title": "Creator na academia",
        "src": "/curso-ugc-ia/assets/videos/ugc-7.mp4",
        "poster": "/curso-ugc-ia/assets/creator-7.jpg",
        "alt": "Vídeo UGC de uma mulher na academia",
        "caption": "Cenas do dia a dia"
      },
      {
        "id": "ugc-5",
        "title": "Apresentação de bebida",
        "src": "/curso-ugc-ia/assets/videos/ugc-5.mp4",
        "poster": "/curso-ugc-ia/assets/videos/ugc-5.webp",
        "alt": "Creator apresentando uma bebida",
        "caption": "Estética de influencer"
      },
      {
        "id": "ugc-2",
        "title": "Moda e looks com IA",
        "src": "/curso-ugc-ia/assets/videos/ugc-2.mp4",
        "poster": "/curso-ugc-ia/assets/videos/ugc-2.webp",
        "alt": "Creator apresentando um look de moda",
        "caption": "Moda em movimento"
      },
      {
        "id": "ugc-1",
        "title": "Acessórios com IA",
        "src": "/curso-ugc-ia/assets/videos/ugc-1.mp4",
        "poster": "/curso-ugc-ia/assets/creator-1.jpg",
        "alt": "Creator usando um colar dourado",
        "caption": "Detalhes que valorizam"
      },
      {
        "id": "ugc-6",
        "title": "Conteúdo para uma marca de alimentação",
        "src": "/curso-ugc-ia/assets/videos/ugc-6-vertical.mp4",
        "poster": "/curso-ugc-ia/assets/videos/ugc-6-vertical.webp",
        "alt": "Creator com uma embalagem de uma marca de alimentação",
        "caption": "Conteúdo para marcas"
      }
    ]
  },
  {
    "id": "produtos",
    "label": "Vídeos de produto",
    "videos": []
  },
  {
    "id": "comerciais",
    "label": "Comerciais com IA",
    "videos": []
  },
  {
    "id": "narracao",
    "label": "Vídeos narrados",
    "videos": []
  },
  {
    "id": "avatares",
    "label": "Avatares de IA",
    "videos": []
  }
],
  // Provisional examples: replace each source with the final topic-specific asset.
  learningMedia: {
    creators: { type: 'video', src: '/curso-ugc-ia/assets/videos/ugc-10.mp4', poster: '/curso-ugc-ia/assets/videos/ugc-10.webp', position: '50% 50%' },
    personagens: { type: 'video', src: '/curso-ugc-ia/assets/videos/ugc-5.mp4', poster: '/curso-ugc-ia/assets/videos/ugc-5.webp', position: '50% 50%' },
    ugc: { type: 'video', src: '/curso-ugc-ia/assets/videos/ugc-2.mp4', poster: '/curso-ugc-ia/assets/videos/ugc-2.webp' },
    reviews: { type: 'video', src: '/curso-ugc-ia/assets/videos/ugc-8.mp4', poster: '/curso-ugc-ia/assets/videos/ugc-8.webp' },
    unboxings: { type: 'video', src: '/curso-ugc-ia/assets/videos/ugc-6-vertical.mp4', poster: '/curso-ugc-ia/assets/videos/ugc-6-vertical.webp' },
    fotos: { type: 'image', src: '/curso-ugc-ia/assets/fotos-produto-2x2.webp', alt: 'Estudo ilustrativo de fotos de produto e creators com IA' },
    anuncios: { type: 'video', src: '/curso-ugc-ia/assets/videos/ugc-6-vertical.mp4', poster: '/curso-ugc-ia/assets/videos/ugc-6-vertical.webp' },
    variacoes: { type: 'image', src: '/curso-ugc-ia/assets/variacoes-escala.webp', alt: 'Fluxo de produção com IA: referências de produto e modelo viram várias fotos e vídeos' },
  },
  extraBenefits: [
    { title: 'Copiloto de prompts', description: 'Descreva o que quer criar e receba uma estrutura pronta para levar às ferramentas.' },
    { title: 'Comunidade', description: 'Acesso à comunidade do curso.' },
    { title: 'Suporte', description: 'Suporte para tirar suas dúvidas durante o aprendizado.' },
    { title: 'Atualizações', description: 'Acesso às atualizações do treinamento.' },
  ],
});
