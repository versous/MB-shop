import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'Aucun élément trouvé',
  description = 'Nous n\'avons rien trouvé correspondant à vos critères.',
  actionLabel,
  actionLink,
  onAction,
  icon: Icon = PackageOpen,
}) {
  return (
    <div className="text-center py-16 px-4 max-w-md mx-auto">
      <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-5 text-neutral-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold uppercase tracking-wider text-[#111111] mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 mb-6 leading-relaxed">{description}</p>

      {actionLink && (
        <Link
          to={actionLink}
          className="inline-block px-6 py-3 bg-[#111111] text-white text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
        >
          {actionLabel || 'Explorer'}
        </Link>
      )}

      {onAction && (
        <button
          onClick={onAction}
          className="inline-block px-6 py-3 bg-[#111111] text-white text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
        >
          {actionLabel || 'Action'}
        </button>
      )}
    </div>
  );
}
