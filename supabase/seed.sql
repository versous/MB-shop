-- ==============================================================================
-- DONNÉES INITIALES (SEED) - PLATEFORME E-COMMERCE T-SHIRTS ABIDJAN
-- ==============================================================================

-- 1. PARAMÈTRES DE LA BOUTIQUE
INSERT INTO public.store_settings (id, store_name, tagline, whatsapp_number, email, phone, address, description, social_links)
VALUES (
    1,
    'MAISON BLANCHE',
    'L''essentiel du vestiaire contemporain à Abidjan',
    '',
    'contact@maisonblanche.ci',
    '+225 07 00 00 00 00',
    'Cocody Ambassades & Plateau, Abidjan, Côte d''Ivoire',
    'Maison Blanche est une maison ivoirienne dédiée aux t-shirts unis de haute confection. Coton 100% biologique lourd, finitions impeccables et coupes intemporelles adaptées au climat tropical.',
    '{"instagram": "https://instagram.com/maisonblanche.ci", "facebook": "https://facebook.com/maisonblanche.ci", "tiktok": "https://tiktok.com/@maisonblanche.ci"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    store_name = EXCLUDED.store_name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description;

-- 2. PRODUITS DE DÉPART (BASIC 9 000 FCFA & OVERSIZE 11 000 FCFA)
INSERT INTO public.products (id, name, slug, description, category, price, images, colors, sizes, is_active, stock_status)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'T-Shirt Basic Noir Intense',
    't-shirt-basic-noir-intense',
    'Le t-shirt col rond indispensable. Coupe classique droite ajustée avec soin, confectionné en jersey 100% coton peigné 180g/m². Col côtelé indéformable, coutures renforcées. Parfait pour un look minimaliste sous une veste ou porté seul.',
    'Basic',
    9000,
    ARRAY[
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1000&q=80'
    ],
    '[{"name": "Noir Ébène", "hex": "#111111"}, {"name": "Gris Anthracite", "hex": "#333333"}]'::jsonb,
    ARRAY['S', 'M', 'L', 'XL', 'XXL'],
    true,
    'in_stock'
),
(
    '22222222-2222-2222-2222-222222222222',
    'T-Shirt Basic Blanc Optique',
    't-shirt-basic-blanc-optique',
    'La pureté absolue. Conçu dans une maille dense non transparente de 190g/m² qui résiste aux lavages répétés. Douceur exceptionnelle et tenue parfaite tout au long de la journée sous la chaleur abidjanaise.',
    'Basic',
    9000,
    ARRAY[
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80'
    ],
    '[{"name": "Blanc Pur", "hex": "#FFFFFF"}, {"name": "Blanc Cassé", "hex": "#F4F4F0"}]'::jsonb,
    ARRAY['S', 'M', 'L', 'XL', 'XXL'],
    true,
    'in_stock'
),
(
    '33333333-3333-3333-3333-333333333333',
    'T-Shirt Basic Gris Minéral',
    't-shirt-basic-gris-mineral',
    'Une nuance de gris chiné subtile et polyvalente. Texture douce brossée au toucher cachemire. S''associe idéalement avec vos denims, pantalons en lin ou cargos.',
    'Basic',
    9000,
    ARRAY[
        'https://images.unsplash.com/photo-1622445268045-328fbbf6389e?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80'
    ],
    '[{"name": "Gris Chiné", "hex": "#9E9E9E"}, {"name": "Gris Souris", "hex": "#757575"}]'::jsonb,
    ARRAY['S', 'M', 'L', 'XL', 'XXL'],
    true,
    'in_stock'
),
(
    '44444444-4444-4444-4444-444444444444',
    'T-Shirt Oversize Boxy Noir',
    't-shirt-oversize-boxy-noir',
    'Inspiration streetwear architectural. Coupe boxy généreuse, épaules tombantes, col montant resserré 3cm. Fabriqué en coton ultra-lourd 240g/m² (heavyweight cotton) offrant un drapé rigide et moderne incomparable.',
    'Oversize',
    11000,
    ARRAY[
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80'
    ],
    '[{"name": "Noir Profond", "hex": "#111111"}, {"name": "Noir Lavé", "hex": "#2B2B2B"}]'::jsonb,
    ARRAY['M', 'L', 'XL'],
    true,
    'in_stock'
),
(
    '55555555-5555-5555-5555-555555555555',
    'T-Shirt Oversize Brut Blanc Craie',
    't-shirt-oversize-brut-blanc-craie',
    'Le volume statement. Une silhouette streetwear contemporaine avec des finitions premium. Le grammage 240g/m² assure une structure parfaite sans coller au corps.',
    'Oversize',
    11000,
    ARRAY[
        'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=80'
    ],
    '[{"name": "Blanc Craie", "hex": "#F8F8F8"}, {"name": "Beige Vanille", "hex": "#ECE6D8"}]'::jsonb,
    ARRAY['M', 'L', 'XL'],
    true,
    'in_stock'
),
(
    '66666666-6666-6666-6666-666666666666',
    'T-Shirt Oversize Terre de Sienne / Kaki',
    't-shirt-oversize-terre-de-sienne-kaki',
    'Teinte organique d''inspiration safari urbain. Teinture pièce pour un rendu mat profond. Conçu pour durer des années sans perdre sa tenue ni sa couleur.',
    'Oversize',
    11000,
    ARRAY[
        'https://images.unsplash.com/photo-1618354691438-25bc04584c03?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80'
    ],
    '[{"name": "Vert Kaki", "hex": "#3A453A"}, {"name": "Terre Brûlée", "hex": "#79443B"}]'::jsonb,
    ARRAY['M', 'L', 'XL'],
    true,
    'in_stock'
)
ON CONFLICT (id) DO NOTHING;

-- Les commandes et événements analytiques sont créés uniquement par l'activité réelle.
