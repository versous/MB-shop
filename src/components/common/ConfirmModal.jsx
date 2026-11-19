import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirmer la suppression',
  message = 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
  confirmText = 'Supprimer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  isDanger = true,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white max-w-md w-full p-6 shadow-2xl border border-neutral-200 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-neutral-400 hover:text-[#111111] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${isDanger ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-800'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111111] uppercase tracking-wide mb-2">{title}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors ${
              isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#111111] hover:bg-neutral-800'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
