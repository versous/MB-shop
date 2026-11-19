import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

export default function SizeGuideModal({ isOpen, onClose, initialCategory = 'Basic' }) {
  const [activeTab, setActiveTab] = useState(initialCategory === 'Oversize' ? 'Oversize' : 'Basic');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-400 hover:text-[#111111] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Ruler className="w-6 h-6 text-[#111111]" />
          <div>
            <h3 className="text-xl font-bold font-display uppercase tracking-wider text-[#111111]">
              Guide des Tailles
            </h3>
            <p className="text-xs text-neutral-500 uppercase tracking-widest">
              Mesures précises en centimètres (cm)
            </p>
          </div>
        </div>

        {/* Onglets de sélection */}
        <div className="flex border-b border-neutral-200 mb-6">
          <button
            onClick={() => setActiveTab('Basic')}
            className={`py-3 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'Basic'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-neutral-400 hover:text-[#111111]'
            }`}
          >
            Coupe Basic (Ajustée / Regular)
          </button>
          <button
            onClick={() => setActiveTab('Oversize')}
            className={`py-3 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'Oversize'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-neutral-400 hover:text-[#111111]'
            }`}
          >
            Coupe Oversize (Boxy Streetwear)
          </button>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto mb-6">
          {activeTab === 'Basic' ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#F5F5F5] text-neutral-700">
                  <th className="py-3 px-4 font-bold uppercase">Taille</th>
                  <th className="py-3 px-4 font-bold uppercase">Tour de Poitrine (cm)</th>
                  <th className="py-3 px-4 font-bold uppercase">Longueur Totale (cm)</th>
                  <th className="py-3 px-4 font-bold uppercase">Épaules (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="py-3 px-4 font-bold">S</td>
                  <td className="py-3 px-4 text-neutral-600">92 - 96 cm</td>
                  <td className="py-3 px-4 text-neutral-600">69 cm</td>
                  <td className="py-3 px-4 text-neutral-600">43 cm</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">M</td>
                  <td className="py-3 px-4 text-neutral-600">97 - 102 cm</td>
                  <td className="py-3 px-4 text-neutral-600">71 cm</td>
                  <td className="py-3 px-4 text-neutral-600">45 cm</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">L</td>
                  <td className="py-3 px-4 text-neutral-600">103 - 108 cm</td>
                  <td className="py-3 px-4 text-neutral-600">73 cm</td>
                  <td className="py-3 px-4 text-neutral-600">47 cm</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">XL</td>
                  <td className="py-3 px-4 text-neutral-600">109 - 116 cm</td>
                  <td className="py-3 px-4 text-neutral-600">75 cm</td>
                  <td className="py-3 px-4 text-neutral-600">49 cm</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">XXL</td>
                  <td className="py-3 px-4 text-neutral-600">117 - 124 cm</td>
                  <td className="py-3 px-4 text-neutral-600">77 cm</td>
                  <td className="py-3 px-4 text-neutral-600">51 cm</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#F5F5F5] text-neutral-700">
                  <th className="py-3 px-4 font-bold uppercase">Taille</th>
                  <th className="py-3 px-4 font-bold uppercase">Largeur Buste (cm)</th>
                  <th className="py-3 px-4 font-bold uppercase">Longueur (cm)</th>
                  <th className="py-3 px-4 font-bold uppercase">Épaules Tombantes (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="py-3 px-4 font-bold">M (Équiv. L Standard)</td>
                  <td className="py-3 px-4 text-neutral-600">58 cm (116 cm)</td>
                  <td className="py-3 px-4 text-neutral-600">73 cm</td>
                  <td className="py-3 px-4 text-neutral-600">56 cm</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">L (Équiv. XL Standard)</td>
                  <td className="py-3 px-4 text-neutral-600">61 cm (122 cm)</td>
                  <td className="py-3 px-4 text-neutral-600">75 cm</td>
                  <td className="py-3 px-4 text-neutral-600">58 cm</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">XL (Équiv. XXL Standard)</td>
                  <td className="py-3 px-4 text-neutral-600">64 cm (128 cm)</td>
                  <td className="py-3 px-4 text-neutral-600">78 cm</td>
                  <td className="py-3 px-4 text-neutral-600">60 cm</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Conseil stylistique */}
        <div className="bg-[#F5F5F5] p-4 text-xs text-neutral-600 leading-relaxed border-l-2 border-[#111111]">
          <p className="font-bold text-[#111111] uppercase tracking-wide mb-1">Conseil morphologie & style :</p>
          {activeTab === 'Basic' ? (
            <p>
              Notre coupe Basic est droite et classique. Choisissez votre taille habituelle pour un porté impeccable sous une chemise ou une veste. Si vous hésitez entre deux tailles ou aimez plus d'aisance sous le climat d'Abidjan, prenez la taille au-dessus.
            </p>
          ) : (
            <p>
              Notre coupe Oversize est volontairement ample et boxy avec des emmanchures basses et du coton lourd 240 GSM. Prenez votre taille normale pour obtenir le tombé streetwear iconique sans flotter.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#111111] text-white text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
