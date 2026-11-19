import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ShieldCheck, Truck, Sparkles, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import ProductCard from '../../components/product/ProductCard';
import { trackEvent } from '../../lib/analytics';
import { formatFCFA } from '../../lib/whatsapp';

export default function HomePage() {
  const { products, settings } = useStore();

  useEffect(() => {
    trackEvent({
      eventType: 'page_view',
      pagePath: '/'
    });
  }, []);

  const activeProducts = products.filter((p) => p.is_active);
  const basicProducts = activeProducts.filter((p) => p.category === 'Basic');
  const oversizeProducts = activeProducts.filter((p) => p.category === 'Oversize');
  const popularProducts = activeProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. HERO BANNER MINIMALISTE & STATEMENT */}
      <section className="relative min-h-[85vh] flex items-center bg-[#111111] text-white overflow-hidden">
        {/* Background photo avec overlay sombre */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=2000&q=85"
            alt="Minimalist streetwear collection Abidjan"
            className="w-full h-full object-cover object-center opacity-40 scale-105 animate-pulse duration-[10000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur border border-white/20 text-white text-[11px] uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
              <span>Collection Essentielle • Abidjan</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight leading-[1.05] text-white">
              L'Art du T-shirt <span className="underline decoration-1 underline-offset-8">Uni</span>.
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl font-normal">
              Des coupes irréprochables, du coton lourd peigné et une tenue qui résiste à l’épreuve du temps. Découvrez nos coupes <strong className="text-white">Basic</strong> & <strong className="text-white">Oversize</strong> livrées chez vous à Abidjan.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/boutique"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#111111] text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-xl"
              >
                <span>Découvrir la Boutique</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/boutique?categorie=Oversize"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/40 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                Collection Oversize
              </Link>
            </div>

            {/* Micro réassurance */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/15 text-xs text-neutral-400">
              <div>
                <span className="block font-bold text-white text-sm">100% Coton</span>
                <span className="text-[11px]">Peigné 180 à 240 GSM</span>
              </div>
              <div>
                <span className="block font-bold text-white text-sm">Livraison Rapide</span>
                <span className="text-[11px]">Toutes communes Abidjan</span>
              </div>
              <div>
                <span className="block font-bold text-white text-sm">WhatsApp Direct</span>
                <span className="text-[11px]">Commande en 1 clic</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRÉSENTATION DE LA MARQUE & MANIFESTE */}
      <section className="py-20 sm:py-28 bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs uppercase tracking-widest text-[#777777] font-bold">
                Notre Philosophie
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#111111]">
                Moins de fioritures. <br />Plus d'exigence.
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Trouver un vrai bon t-shirt uni à Abidjan ne devrait pas être une quête impossible. Un col qui ne s'effiloche pas au premier lavage, une maille qui ne transparaît pas sous le soleil tropical, et des lignes architecturales qui structurent votre silhouette.
              </p>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Chaque pièce {settings.store_name} est pensée pour être la fondation de votre style quotidien : minimaliste, élégant et intemporel.
              </p>

              <div className="pt-2 space-y-2.5">
                {[
                  'Coton lourd respirant sélectionné avec rigueur',
                  'Cols doublés anti-déformation et coutures renforcées',
                  'Teintures réactives qui ne délavent pas',
                  'Tailles précises adaptées du S au XXL'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs font-semibold text-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] bg-[#F5F5F5] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
                    alt="T-shirt basic noir coupe parfaite"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 bg-[#F5F5F5] text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Gamme Épure</span>
                  <p className="text-xs font-bold text-[#111111] mt-0.5">Basic Regular Fit • Dès 9 000 FCFA</p>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="aspect-[3/4] bg-[#F5F5F5] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"
                    alt="T-shirt oversize streetwear lourd"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 bg-[#111111] text-white text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Gamme Heavy</span>
                  <p className="text-xs font-bold text-white mt-0.5">Oversize Boxy Fit 240 GSM • 11 000 FCFA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MISE EN AVANT DES PRODUITS POPULAIRES */}
      <section className="py-20 bg-[#FAFAFA] border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#777777] font-bold">
                Sélection du Moment
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#111111] mt-1">
                Les Pièces Favorites
              </h2>
            </div>
            <Link
              to="/boutique"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#111111] hover:text-neutral-500 transition-colors"
            >
              <span>Voir tout l'assortiment ({products.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECTION SPÉCIFIQUE : LES T-SHIRTS BASIC (9 000 FCFA) */}
      <section className="py-20 sm:py-24 bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-12">
            <span className="px-2.5 py-1 bg-[#F5F5F5] text-neutral-700 text-[10px] font-bold uppercase tracking-widest border border-neutral-200">
              Collection Basic • 9 000 FCFA
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#111111] mt-3">
              Le T-shirt du Quotidien Absolu
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
              Coupe droite équilibrée, col côtelé indéformable et jersey 100% coton 180-190g. La base indispensable à porter sous un blazer au bureau ou en solo le week-end.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {basicProducts.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/boutique?categorie=Basic"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#111111] text-[#111111] text-xs uppercase tracking-widest font-bold hover:bg-[#111111] hover:text-white transition-all"
            >
              <span>Découvrir tous les T-shirts Basic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. SECTION SPÉCIFIQUE : LES T-SHIRTS OVERSIZE (11 000 FCFA) */}
      <section className="py-20 sm:py-24 bg-[#111111] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-12">
            <span className="px-2.5 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest border border-white/20">
              Collection Oversize • 11 000 FCFA
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mt-3">
              Coupe Boxy Streetwear & Coton Lourd 240 GSM
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
              Silhouette contemporaine aux épaules tombantes, col montant resserré et tombé rigide sculpté. L'armure stylistique moderne par excellence.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {oversizeProducts.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/boutique?categorie=Oversize"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#111111] text-xs uppercase tracking-widest font-bold hover:bg-neutral-200 transition-all shadow-lg"
            >
              <span>Explorer la Collection Oversize</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FINAL AVEC INFORMATIONS DE LIVRAISON */}
      <section className="py-20 bg-[#F5F5F5] border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
            Expédition Locale Express
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#111111]">
            Prêt à renouveler votre vestiaire ?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
            Choisissez vos pièces, validez sur WhatsApp en un instant et recevez votre colis à Cocody, Marcory, Plateau, Yopougon ou n'importe où à Abidjan.
          </p>
          <div className="pt-2">
            <Link
              to="/boutique"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#111111] text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl"
            >
              <span>Accéder à toute la Boutique</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
