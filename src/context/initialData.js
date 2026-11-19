export const INITIAL_SETTINGS = {
  id: 1,
  store_name: 'MAISON BLANCHE',
  tagline: 'L\'essentiel du vestiaire contemporain à Abidjan',
  whatsapp_number: '',
  email: 'contact@maisonblanche.ci',
  phone: '+225 07 00 00 00 00',
  address: 'Cocody Ambassades & Plateau, Abidjan, Côte d\'Ivoire',
  description: 'Maison Blanche est une maison ivoirienne dédiée aux t-shirts unis de haute confection. Coton 100% biologique lourd, finitions impeccables et coupes intemporelles adaptées au climat tropical.',
  social_links: {
    instagram: 'https://instagram.com/maisonblanche.ci',
    facebook: 'https://facebook.com/maisonblanche.ci',
    tiktok: 'https://tiktok.com/@maisonblanche.ci'
  },
  currency: 'FCFA'
};

export const INITIAL_PRODUCTS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'T-Shirt Basic Noir Intense',
    slug: 't-shirt-basic-noir-intense',
    description: 'Le t-shirt col rond indispensable. Coupe classique droite ajustée avec soin, confectionné en jersey 100% coton peigné 180g/m². Col côtelé indéformable, coutures renforcées. Parfait pour un look minimaliste sous une veste ou porté seul.',
    category: 'Basic',
    price: 9000,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Noir Ébène', hex: '#111111' },
      { name: 'Gris Anthracite', hex: '#333333' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    is_active: true,
    stock_status: 'in_stock',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'T-Shirt Basic Blanc Optique',
    slug: 't-shirt-basic-blanc-optique',
    description: 'La pureté absolue. Conçu dans une maille dense non transparente de 190g/m² qui résiste aux lavages répétés. Douceur exceptionnelle et tenue parfaite tout au long de la journée sous la chaleur abidjanaise.',
    category: 'Basic',
    price: 9000,
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Blanc Pur', hex: '#FFFFFF' },
      { name: 'Blanc Cassé', hex: '#F4F4F0' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    is_active: true,
    stock_status: 'in_stock',
    created_at: new Date(Date.now() - 9 * 86400000).toISOString()
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'T-Shirt Basic Gris Minéral',
    slug: 't-shirt-basic-gris-mineral',
    description: 'Une nuance de gris chiné subtile et polyvalente. Texture douce brossée au toucher cachemire. S\'associe idéalement avec vos denims, pantalons en lin ou cargos.',
    category: 'Basic',
    price: 9000,
    images: [
      'https://images.unsplash.com/photo-1622445268045-328fbbf6389e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Gris Chiné', hex: '#9E9E9E' },
      { name: 'Gris Souris', hex: '#757575' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    is_active: true,
    stock_status: 'in_stock',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'T-Shirt Oversize Boxy Noir',
    slug: 't-shirt-oversize-boxy-noir',
    description: 'Inspiration streetwear architectural. Coupe boxy généreuse, épaules tombantes, col montant resserré 3cm. Fabriqué en coton ultra-lourd 240g/m² (heavyweight cotton) offrant un drapé rigide et moderne incomparable.',
    category: 'Oversize',
    price: 11000,
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Noir Profond', hex: '#111111' },
      { name: 'Noir Lavé', hex: '#2B2B2B' }
    ],
    sizes: ['M', 'L', 'XL'],
    is_active: true,
    stock_status: 'in_stock',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'T-Shirt Oversize Brut Blanc Craie',
    slug: 't-shirt-oversize-brut-blanc-craie',
    description: 'Le volume statement. Une silhouette streetwear contemporaine avec des finitions premium. Le grammage 240g/m² assure une structure parfaite sans coller au corps.',
    category: 'Oversize',
    price: 11000,
    images: [
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Blanc Craie', hex: '#F8F8F8' },
      { name: 'Beige Vanille', hex: '#ECE6D8' }
    ],
    sizes: ['M', 'L', 'XL'],
    is_active: true,
    stock_status: 'in_stock',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'T-Shirt Oversize Terre de Sienne / Kaki',
    slug: 't-shirt-oversize-terre-de-sienne-kaki',
    description: 'Teinte organique d\'inspiration safari urbain. Teinture pièce pour un rendu mat profond. Conçu pour durer des années sans perdre sa tenue ni sa couleur.',
    category: 'Oversize',
    price: 11000,
    images: [
      'https://images.unsplash.com/photo-1618354691438-25bc04584c03?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Vert Kaki', hex: '#3A453A' },
      { name: 'Terre Brûlée', hex: '#79443B' }
    ],
    sizes: ['M', 'L', 'XL'],
    is_active: true,
    stock_status: 'in_stock',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

export const INITIAL_ORDERS = [];

export const INITIAL_ANALYTICS = [];
