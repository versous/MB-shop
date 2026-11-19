import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilter from '../../components/product/ProductFilter';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { trackEvent } from '../../lib/analytics';

export default function ShopPage() {
  const { products, loading } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // État des filtres
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categorie') || 'all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Enregistrer la visite de page
  useEffect(() => {
    trackEvent({
      eventType: 'page_view',
      pagePath: '/boutique'
    });
  }, []);

  // Synchroniser avec les query params de l'URL
  useEffect(() => {
    const cat = searchParams.get('categorie');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Suivre les recherches dans l'analytique avec debounce
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const timer = setTimeout(() => {
        trackEvent({
          eventType: 'search',
          pagePath: '/boutique',
          metadata: { query: searchQuery }
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Liste des couleurs et tailles disponibles calculées dynamiquement depuis les produits actifs
  const { availableColors, availableSizes } = useMemo(() => {
    const colorMap = new Map();
    const sizeSet = new Set();

    products.forEach((p) => {
      if (p.is_active) {
        if (Array.isArray(p.colors)) {
          p.colors.forEach((c) => {
            if (c.name && !colorMap.has(c.name)) {
              colorMap.set(c.name, c);
            }
          });
        }
        if (Array.isArray(p.sizes)) {
          p.sizes.forEach((s) => sizeSet.add(s));
        }
      }
    });

    return {
      availableColors: Array.from(colorMap.values()),
      availableSizes: Array.from(sizeSet).sort()
    };
  }, [products]);

  // Filtrage et tri des produits
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.is_active)
      .filter((p) => {
        // Recherche
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchCategory = p.category?.toLowerCase().includes(q);
          const matchColor = p.colors?.some((c) => c.name?.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchCategory && !matchColor) return false;
        }

        // Catégorie
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Couleur
        if (selectedColor !== 'all') {
          const hasColor = p.colors?.some((c) => c.name === selectedColor);
          if (!hasColor) return false;
        }

        // Taille
        if (selectedSize !== 'all') {
          const hasSize = p.sizes?.includes(selectedSize);
          if (!hasSize) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        // Default newest
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [products, searchQuery, selectedCategory, selectedColor, selectedSize, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedColor('all');
    setSelectedSize('all');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre de page & Introduction */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#777777]">
            Collection Initiale • Abidjan
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111] mt-2">
            Tous nos T-shirts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-3 leading-relaxed">
            Trouvez la coupe et le grammage parfait pour votre vestiaire. Les commandes se font sur WhatsApp selon la disponibilité du produit.
          </p>
        </div>

        {/* Composant de filtres complets */}
        <ProductFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={(cat) => {
            setSelectedCategory(cat);
            if (cat === 'all') {
              searchParams.delete('categorie');
              setSearchParams(searchParams);
            } else {
              setSearchParams({ categorie: cat });
            }
          }}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          sortBy={sortBy}
          setSortBy={setSortBy}
          availableColors={availableColors}
          availableSizes={availableSizes.length > 0 ? availableSizes : ['S', 'M', 'L', 'XL', 'XXL']}
          totalCount={filteredProducts.length}
          onReset={handleReset}
        />

        {/* Grille de produits */}
        {loading ? (
          <LoadingSpinner text="Chargement du catalogue..." />
        ) : (
          <ProductGrid products={filteredProducts} onResetFilters={handleReset} />
        )}
      </div>
    </div>
  );
}
