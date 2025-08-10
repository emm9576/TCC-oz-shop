
// Dados de exemplo para produtos
export const products = [
  {
    id: "1",
    name: "Smartphone Galaxy S23 Ultra",
    description: "O mais avançado smartphone da Samsung com câmera de 108MP, tela AMOLED de 6.8 polegadas e processador Snapdragon 8 Gen 2.",
    price: 6999.99,
    discount: 10,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnRwaG9uZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnRwaG9uZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGhvbmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGhvbmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    ],
    category: "eletronicos",
    rating: 4.8,
    reviews: 324,
    stock: 15,
    seller: "Tech Store Oficial",
    freeShipping: true,
    features: [
      "Tela AMOLED 6.8\"",
      "Câmera 108MP",
      "Processador Snapdragon 8 Gen 2",
      "Bateria 5000mAh",
      "Android 13"
    ]
  },
  {
    id: "2",
    name: "Notebook Dell XPS 13",
    description: "Notebook premium ultrafino com processador Intel Core i7, 16GB de RAM e SSD de 512GB. Ideal para trabalho e entretenimento.",
    price: 8499.99,
    discount: 5,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGFwdG9wfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1602080858428-57174f9431cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGxhcHRvcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
    ],
    category: "eletronicos",
    rating: 4.7,
    reviews: 189,
    stock: 8,
    seller: "Dell Brasil Oficial",
    freeShipping: true,
    features: [
      "Processador Intel Core i7",
      "16GB RAM",
      "SSD 512GB",
      "Tela InfinityEdge 13.4\"",
      "Windows 11 Pro"
    ]
  },
  {
    id: "3",
    name: "Tênis Nike Air Max 270",
    description: "Tênis esportivo com tecnologia Air Max para maior conforto e amortecimento. Design moderno e materiais de alta qualidade.",
    price: 899.99,
    discount: 0,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2hvZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c2hvZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    ],
    category: "moda",
    rating: 4.5,
    reviews: 256,
    stock: 25,
    seller: "Nike Store",
    freeShipping: false,
    features: [
      "Tecnologia Air Max",
      "Cabedal em mesh",
      "Entressola em espuma",
      "Solado de borracha",
      "Várias cores disponíveis"
    ]
  },
  {
    id: "4",
    name: "Smart TV LG OLED 55\"",
    description: "Smart TV OLED com resolução 4K, HDR e sistema webOS. Imagem de altíssima qualidade e contraste infinito.",
    price: 5499.99,
    discount: 15,
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHZ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHZ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1601944177325-f8867652837f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dHZ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1577979749830-f1d742b96791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHR2fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
    ],
    category: "eletronicos",
    rating: 4.9,
    reviews: 178,
    stock: 10,
    seller: "LG Brasil Oficial",
    freeShipping: true,
    features: [
      "Tela OLED 55\"",
      "Resolução 4K",
      "HDR10 Pro",
      "Sistema webOS",
      "4 entradas HDMI"
    ]
  },
  {
    id: "5",
    name: "Cafeteira Nespresso Essenza Mini",
    description: "Cafeteira compacta para cápsulas Nespresso. Prepara café espresso e lungo com um toque. Design moderno e compacto.",
    price: 499.99,
    discount: 0,
    image: "https://images.unsplash.com/photo-1525088068654-d2f27ec84178?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y29mZmVlJTIwbWFjaGluZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1525088068654-d2f27ec84178?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y29mZmVlJTIwbWFjaGluZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1572119865084-43c285814d63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29mZmVlJTIwbWFjaGluZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNvZmZlZSUyMG1hY2hpbmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    ],
    category: "casa",
    rating: 4.6,
    reviews: 312,
    stock: 30,
    seller: "Nespresso Oficial",
    freeShipping: true,
    features: [
      "19 bar de pressão",
      "Reservatório de 0,6L",
      "Modo de economia de energia",
      "2 tamanhos de xícara",
      "Compacta e leve"
    ]
  },
  {
    id: "6",
    name: "Fone de Ouvido Sony WH-1000XM4",
    description: "Fone de ouvido sem fio com cancelamento de ruído líder de mercado. Som de alta qualidade e bateria de longa duração.",
    price: 1999.99,
    discount: 8,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhlYWRwaG9uZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
    ],
    category: "eletronicos",
    rating: 4.9,
    reviews: 427,
    stock: 12,
    seller: "Sony Brasil",
    freeShipping: true,
    features: [
      "Cancelamento de ruído líder",
      "Até 30 horas de bateria",
      "Conexão Bluetooth multipoint",
      "Sensor de uso",
      "Compatível com assistentes de voz"
    ]
  },
  {
    id: "7",
    name: "Relógio Apple Watch Series 8",
    description: "Smartwatch com monitoramento avançado de saúde, GPS, resistência à água e diversas funcionalidades integradas ao ecossistema Apple.",
    price: 3999.99,
    discount: 0,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXBwbGUlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXBwbGUlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXBwbGUlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGFwcGxlJTIwd2F0Y2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    ],
    category: "eletronicos",
    rating: 4.7,
    reviews: 215,
    stock: 18,
    seller: "iPlace",
    freeShipping: true,
    features: [
      "Tela Retina sempre ativa",
      "Sensor de oxigênio no sangue",
      "ECG integrado",
      "Resistente à água (50m)",
      "GPS + Celular"
    ]
  },
  {
    id: "8",
    name: "Cadeira Gamer ThunderX3",
    description: "Cadeira gamer ergonômica com design esportivo, ajustes de altura e inclinação, apoio lombar e de braços ajustáveis.",
    price: 1299.99,
    discount: 12,
    image: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FtaW5nJTIwY2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1598257006458-087169a1f08d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FtaW5nJTIwY2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z2FtaW5nJTIwY2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1603725507925-4b391cfa9d2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Z2FtaW5nJTIwY2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    ],
    category: "casa",
    rating: 4.5,
    reviews: 178,
    stock: 15,
    seller: "ThunderX3 Brasil",
    freeShipping: false,
    features: [
      "Revestimento em couro PU",
      "Reclinável até 180°",
      "Braços 3D ajustáveis",
      "Almofadas lombar e cervical",
      "Suporta até 150kg"
    ]
  }
];

// Função para buscar produtos por categoria
export const getProductsByCategory = (category) => {
  if (!category) return products;
  return products.filter(product => product.category === category);
};

// Função para buscar um produto pelo ID
export const getProductById = (id) => {
  return products.find(product => product.id === id);
};

// Função para buscar produtos por termo de pesquisa
export const searchProducts = (query) => {
  const searchTerm = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) || 
    product.description.toLowerCase().includes(searchTerm)
  );
};

// Categorias disponíveis
export const categories = [
  {
    id: "eletronicos",
    name: "Eletrônicos",
    icon: "Smartphone"
  },
  {
    id: "moda",
    name: "Moda",
    icon: "Shirt"
  },
  {
    id: "casa",
    name: "Casa e Decoração",
    icon: "Home"
  },
  {
    id: "esportes",
    name: "Esportes",
    icon: "Dumbbell"
  },
  {
    id: "beleza",
    name: "Beleza e Saúde",
    icon: "Sparkles"
  }
];
