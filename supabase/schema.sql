-- ==============================================================================
-- SCHÉMA BASE DE DONNÉES SUPABASE - PLATEFORME E-COMMERCE T-SHIRTS ABIDJAN
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DES PROFILS / UTILISATEURS ADMINISTRATEURS
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLE DES PRODUITS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Basic', 'Oversize', 'Édition Spéciale')),
    price NUMERIC NOT NULL CHECK (price >= 0),
    images TEXT[] NOT NULL DEFAULT '{}',
    colors JSONB NOT NULL DEFAULT '[]'::jsonb, -- ex: [{"name": "Noir", "hex": "#111111"}, {"name": "Blanc", "hex": "#FFFFFF"}]
    sizes TEXT[] NOT NULL DEFAULT '{"S", "M", "L", "XL", "XXL"}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche et filtres de produits
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 4. TABLE DES COMMANDES
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    category TEXT,
    color TEXT NOT NULL,
    size TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
    delivery_fee NUMERIC NOT NULL DEFAULT 1500 CHECK (delivery_fee >= 0),
    total_amount NUMERIC GENERATED ALWAYS AS ((unit_price * quantity) + delivery_fee) STORED,
    location TEXT NOT NULL, -- Commune / Quartier d'Abidjan (Cocody, Plateau, Marcory, etc.)
    status TEXT NOT NULL DEFAULT 'En attente' CHECK (status IN ('En attente', 'Confirmée', 'En préparation', 'En livraison', 'Livrée', 'Annulée')),
    order_date TIMESTAMPTZ DEFAULT now(),
    delivery_person TEXT, -- Nom du livreur
    delivered_at TIMESTAMPTZ, -- Date de livraison réelle
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les commandes et livraisons
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_delivered_at ON public.orders(delivered_at);

-- 5. TABLE DES ÉVÉNEMENTS ANALYTIQUES
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'product_view', 'whatsapp_click', 'search')),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    page_path TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour l'analytique et les statistiques d'agrégation rapide
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON public.analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_product_id ON public.analytics_events(product_id);

-- 6. TABLE DES PARAMÈTRES DE LA BOUTIQUE (Ligne unique ID = 1)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    store_name TEXT NOT NULL DEFAULT 'MAISON BLANCHE',
    tagline TEXT DEFAULT 'T-shirts unis d''exception à Abidjan',
    logo_url TEXT,
    whatsapp_number TEXT NOT NULL DEFAULT '',
    email TEXT DEFAULT 'contact@maisonblanche.ci',
    phone TEXT DEFAULT '+225 07 00 00 00 00',
    address TEXT DEFAULT 'Abidjan, Côte d''Ivoire',
    description TEXT DEFAULT 'Maison Blanche propose des T-shirts unis haut de gamme confectionnés dans un coton peigné lourd pour une coupe parfaite et un confort durable.',
    social_links JSONB DEFAULT '{"instagram": "https://instagram.com/maisonblanche.ci", "facebook": "https://facebook.com/maisonblanche.ci", "tiktok": "https://tiktok.com/@maisonblanche.ci"}'::jsonb,
    currency TEXT DEFAULT 'FCFA',
    updated_at TIMESTAMPTZ DEFAULT now()
);

UPDATE public.store_settings
SET whatsapp_number = ''
WHERE whatsapp_number = '+2250700000000';

-- Trigger pour générer un numéro de commande lisible (ex: MB-2401-XXXX)
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

SELECT setval(
    'public.order_number_seq',
    GREATEST(
        COALESCE(
            (SELECT MAX(substring(order_number FROM '([0-9]+)$')::BIGINT)
             FROM public.orders
             WHERE order_number ~ '[0-9]+$'),
            0
        ) + 1,
        1
    ),
    false
);

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'CMD-' || TO_CHAR(NOW(), 'YYMM') || '-' ||
            LPAD(NEXTVAL('public.order_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_order_number ON public.orders;
CREATE TRIGGER trg_generate_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();

-- Trigger pour mettre à jour la date updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER trg_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Synchronisation temps réel des données d'administration via Supabase Realtime.
DO $$
DECLARE
    table_name TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        FOREACH table_name IN ARRAY ARRAY['products', 'orders', 'store_settings', 'analytics_events']
        LOOP
            IF NOT EXISTS (
                SELECT 1
                FROM pg_publication_tables
                WHERE pubname = 'supabase_realtime'
                  AND schemaname = 'public'
                  AND tablename = table_name
            ) THEN
                EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
            END IF;
        END LOOP;
    END IF;
END;
$$;

-- ==============================================================================
-- SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 1. Helper function pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. POLITIQUES POUR `products`
-- Les visiteurs peuvent voir les produits actifs
CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (is_active = true OR public.is_admin());

-- Seuls les administrateurs peuvent insérer, modifier ou supprimer des produits
CREATE POLICY "Admins have full access to products"
    ON public.products FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3. POLITIQUES POUR `orders`
-- Seuls les administrateurs peuvent voir et gérer les commandes
CREATE POLICY "Admins have full access to orders"
    ON public.orders FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. POLITIQUES POUR `analytics_events`
-- Les visiteurs anonymes et clients peuvent enregistrer des événements (page_view, etc.)
CREATE POLICY "Public can insert analytics events"
    ON public.analytics_events FOR INSERT
    WITH CHECK (true);

-- Seuls les administrateurs peuvent consulter les statistiques analytiques
CREATE POLICY "Admins can view analytics events"
    ON public.analytics_events FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- 5. POLITIQUES POUR `store_settings`
-- Tout le monde peut lire les informations publiques de la boutique (nom, WhatsApp, etc.)
CREATE POLICY "Public can view store settings"
    ON public.store_settings FOR SELECT
    USING (true);

-- Seuls les administrateurs peuvent modifier les paramètres
CREATE POLICY "Admins can update store settings"
    ON public.store_settings FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. POLITIQUES POUR `admin_users`
-- L'admin peut voir son profil
CREATE POLICY "Admins can view their own profile"
    ON public.admin_users FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.is_admin());

-- ==============================================================================
-- CONFIGURATION STORAGE (BUCKET 'products' & 'settings')
-- ==============================================================================
-- Note: Dans Supabase Dashboard > Storage, créez un bucket 'products' public.
-- Ou exécutez ces requêtes si le schéma storage est accessible :
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('settings', 'settings', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques de stockage
CREATE POLICY "Public can view product images"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('products', 'settings'));

CREATE POLICY "Admins can upload to products and settings"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id IN ('products', 'settings') AND public.is_admin());

CREATE POLICY "Admins can update and delete product images"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id IN ('products', 'settings') AND public.is_admin());
