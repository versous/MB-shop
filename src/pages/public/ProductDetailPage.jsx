import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Ruler,
  Truck,
  ShieldCheck,
  ChevronLeft,
  Check,
  Package,
  Sparkles,
  Info
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import WhatsAppButton from '../../components/product/WhatsAppButton';
import SizeGuideModal from '../../components/common/SizeGuideModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductCard from '../../components/product/ProductCard';
import { formatFCFA } from '../../lib/whatsapp';
import { trackEvent } from '../../lib/analytics';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, loading } = useStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Trouver le produit par ID ou Slug
  const product = products.find((p) => p.id === id || p.slug === id);

  // Initialiser les choix par défaut et suivre l'analytique
  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0].name);
      }
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      setSelectedImageIndex(0);
      setQuantity(1);
      setValidationError('');

      // Enregistrer l'événement analytique de consultation de produit
      trackEvent({
        eventType: 'product_view',
        productId: product.id,
        pagePath: window.location.pathname,
        metadata: {
          productName: product.name,
          category: product.category,
          price: product.price
        }
      });
    }
  }, [product]);

  if (loading) {
    return <LoadingSpinner text="Chargement du t-shirt..." />;
  }

  if (!product || !product.is_active) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111] mb-3">
          Produit introuvable
        </h2>
        <p className="text-sm text-neutral-500 mb-6">Ce t-shirt n'existe pas ou a été retiré du catalogue.</p>
        <Link
          to="/boutique"
          className="px-6 py-3 bg-[#111111] text-white text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock_status === 'out_of_stock';
  const isLowStock = product.stock_status === 'low_stock';
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'];

  const similarProducts = products
    .filter((p) => p.is_active && p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  const handleValidateBeforeOrder = () => {
    if (!selectedColor) {
      setValidationError('Veuillez sélectionner une couleur avant de commander.');
      return false;
    }
    if (!selectedSize) {
      setValidationError('Veuillez sélectionner une taille avant de commander.');
      return false;
    }
    setValidationError('');
    return true;
  };

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fil d'Ariane */}
        <div className="mb-8 flex items-center gap-2 text-xs text-neutral-500">
          <Link to="/" className="hover:text-[#111111] transition-colors">Accueil</Link>
          <span>/</span>
          <Link to="/boutique" className="hover:text-[#111111] transition-colors">Boutique</Link>
          <span>/</span>
          <Link
            to={`/boutique?categorie=${product.category}`}
            className="hover:text-[#111111] transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#111111] font-semibold truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Détail du produit en 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* COLONNE GAUCHE : GALERIE D'IMAGES */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Miniatures verticales */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[600px] shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 bg-[#F5F5F5] overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-[#111111]'
                        : 'border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} miniature ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Grande photo principale */}
            <div className="flex-1 bg-[#F5F5F5] aspect-[4/5] overflow-hidden relative border border-neutral-100">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="px-3 py-1 bg-white/90 backdrop-blur text-[#111111] text-[10px] font-bold uppercase tracking-widest border border-neutral-200 shadow-sm">
                  {product.category}
                </span>
                {isOutOfStock && (
                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest">
                    Rupture de stock
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : INFORMATIONS & COMMANDE WHATSAPP */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#777777]">
                  {product.category === 'Basic'
                    ? 'Coupe Standard 180-190 GSM'
                    : product.category === 'Oversize'
                      ? 'Coupe Boxy Streetwear 240 GSM'
                      : 'Édition spéciale'}
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {isOutOfStock ? 'Épuisé' : isLowStock ? 'Stock faible' : 'En stock à Abidjan'}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#111111]">
                {product.name}
              </h1>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-extrabold text-[#111111]">
                  {formatFCFA(product.price)}
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  • Prix unitaire TTC
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-b border-neutral-200 py-4">
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Choix de la couleur */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Couleur : <span className="font-normal text-neutral-600">{selectedColor}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color, idx) => {
                    const isSelected = selectedColor === color.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color.name);
                          setValidationError('');
                        }}
                        className={`flex items-center gap-2 px-3.5 py-2 border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-[#111111] bg-[#111111] text-white shadow'
                            : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-neutral-400 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Choix de la taille & Guide */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Taille : <span className="font-normal text-neutral-600">{selectedSize}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-[#111111] transition-colors underline underline-offset-4"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Guide des tailles</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setValidationError('');
                        }}
                        className={`min-w-[48px] h-11 flex items-center justify-center px-4 border text-xs font-bold uppercase transition-all ${
                          isSelected
                            ? 'border-[#111111] bg-[#111111] text-white shadow'
                            : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sélecteur de Quantité */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-2">
                Quantité
              </span>
              <div className="inline-flex items-center border border-neutral-300 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 font-bold transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center text-xs font-bold text-[#111111]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 font-bold transition-colors"
                >
                  +
                </button>
              </div>
              <span className="ml-3 text-xs text-neutral-500 font-medium">
                Total : <strong className="text-[#111111]">{formatFCFA(product.price * quantity)}</strong>
              </span>
            </div>

            {/* Message de validation si champ manquant */}
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {validationError}
              </div>
            )}

            {/* Bouton de Commande WhatsApp conforme */}
            <div className="pt-2 space-y-3">
              <WhatsAppButton
                product={product}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                quantity={quantity}
                disabled={isOutOfStock}
                buttonText={isOutOfStock ? 'Rupture de stock' : 'Commander sur WhatsApp'}
                onBeforeClick={handleValidateBeforeOrder}
              />

              <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
                <Info className="w-3.5 h-3.5 inline mr-1 text-neutral-400 -mt-0.5" />
                Un message pré-rempli avec votre taille, couleur et quantité sera envoyé. La confirmation et les frais de livraison vous seront communiqués directement sur WhatsApp.
              </p>
            </div>

            {/* Réassurance Livraison Abidjan */}
            <div className="pt-4 border-t border-neutral-200 space-y-3 text-xs text-neutral-600">
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#111111] block">Livraison express à Abidjan :</strong>
                  <span>Cocody, Marcory, Plateau, Yopougon, Riviera, Koumassi, etc. Frais de livraison à la charge du client (généralement 1 500 à 2 500 FCFA selon la commune).</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#111111] block">Paiement à la livraison :</strong>
                  <span>Payez en espèces ou par Wave / Orange Money directement auprès du livreur après vérification de votre colis.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-neutral-200">
            <div className="mb-8">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#777777]">
                Dans la même collection
              </span>
              <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#111111] mt-1">
                Vous aimerez aussi
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Guide des tailles */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        initialCategory={product.category}
      />
    </div>
  );
}
