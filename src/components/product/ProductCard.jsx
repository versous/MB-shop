import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { formatFCFA } from '../../lib/whatsapp';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images?.[1] || primaryImage;

  const isOutOfStock = product.stock_status === 'out_of_stock';
  const isLowStock = product.stock_status === 'low_stock';

  return (
    <div
      className="group flex flex-col bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cadre photo */}
      <Link
        to={`/produit/${product.id}`}
        className="relative block aspect-[4/5] bg-[#F5F5F5] overflow-hidden cursor-pointer"
      >
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges en superposition */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[#111111] text-[10px] font-bold uppercase tracking-widest border border-neutral-200">
            {product.category}
          </span>
          {isOutOfStock ? (
            <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest">
              Rupture
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest">
              Stock faible
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-[#111111]/80 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
              En stock
            </span>
          )}
        </div>

        {/* Bouton rapide "Voir détails" au survol */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="w-full py-2.5 bg-white/95 backdrop-blur text-[#111111] text-xs font-bold uppercase tracking-wider text-center border border-neutral-300 shadow-lg flex items-center justify-center gap-1.5">
            <span>Découvrir</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>

      {/* Informations produit */}
      <div className="pt-4 pb-2 flex flex-col flex-1">
        {/* Pastilles de couleurs */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            {product.colors.map((c, idx) => (
              <span
                key={idx}
                className="w-3 h-3 rounded-full border border-neutral-300 shrink-0"
                style={{ backgroundColor: c.hex || '#111111' }}
                title={c.name}
              />
            ))}
            <span className="text-[11px] text-neutral-400 font-medium ml-1">
              {product.colors.length} {product.colors.length > 1 ? 'coloris' : 'coloris'}
            </span>
          </div>
        )}

        <Link to={`/produit/${product.id}`} className="block">
          <h3 className="font-semibold text-sm text-[#111111] tracking-tight group-hover:text-neutral-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex items-baseline justify-between">
          <span className="font-bold text-sm tracking-tight text-[#111111]">
            {formatFCFA(product.price)}
          </span>
          {product.sizes && product.sizes.length > 0 && (
            <span className="text-[11px] text-neutral-400 font-medium">
              Tailles : {product.sizes.join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
