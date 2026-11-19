import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from '../common/EmptyState';

export default function ProductGrid({ products, onResetFilters }) {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="Aucun produit disponible"
        description="Aucun t-shirt ne correspond à vos filtres actuels. Essayez de réinitialiser vos critères de recherche."
        actionLabel="Réinitialiser les filtres"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
