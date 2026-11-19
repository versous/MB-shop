import React from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function ProductFilter({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  sortBy,
  setSortBy,
  availableColors = [],
  availableSizes = ['S', 'M', 'L', 'XL', 'XXL'],
  totalCount = 0,
  onReset
}) {
  return (
    <div className="bg-[#FAFAFA] border border-neutral-200 p-5 sm:p-6 mb-8 space-y-6">
      {/* Ligne 1 : Barre de recherche + Tri */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un t-shirt (ex: Noir, Oversize, Craie...)"
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-neutral-300 focus:border-[#111111] focus:outline-none transition-colors"
          />
        </div>

        {/* Tri */}
        <div className="flex items-center gap-3">
          <label htmlFor="sort-select" className="text-xs font-semibold uppercase tracking-wider text-neutral-500 whitespace-nowrap">
            Trier par :
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-white border border-neutral-300 py-2.5 px-3 focus:border-[#111111] focus:outline-none font-medium cursor-pointer"
          >
            <option value="newest">Nouveautés</option>
            <option value="price_asc">Prix : croissant (Moins cher)</option>
            <option value="price_desc">Prix : décroissant</option>
            <option value="name_asc">Nom : A à Z</option>
          </select>

          {(searchQuery || selectedCategory !== 'all' || selectedColor !== 'all' || selectedSize !== 'all') && (
            <button
              onClick={onReset}
              className="p-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 transition-colors"
              title="Réinitialiser les filtres"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Ligne 2 : Filtres rapides par Catégorie, Couleur, Taille */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-neutral-200">
        {/* Catégorie */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Catégorie
          </span>
          <div className="flex flex-wrap gap-2">
            {['all', 'Basic', 'Oversize', 'Édition Spéciale'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
                  selectedCategory === cat
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {cat === 'all' ? 'Toutes' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Couleur */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Couleur
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedColor('all')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
                selectedColor === 'all'
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              Toutes
            </button>
            {availableColors.map((col) => (
              <button
                key={col.name}
                onClick={() => setSelectedColor(col.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all border ${
                  selectedColor === col.name
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                  style={{ backgroundColor: col.hex }}
                />
                <span>{col.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Taille */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Taille disponible
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSize('all')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
                selectedSize === 'all'
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              Toutes
            </button>
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-9 h-8 flex items-center justify-center text-xs font-bold uppercase transition-all border ${
                  selectedSize === size
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-500 pt-2">
        <span>
          {totalCount} {totalCount > 1 ? 't-shirts trouvés' : 't-shirt trouvé'}
        </span>
      </div>
    </div>
  );
}
