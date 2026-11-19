import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { hasUserConsent, setUserConsent } from '../../lib/analytics';

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('mb_cookie_consent');
    if (!raw) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    setUserConsent(true);
    setVisible(false);
  };

  const handleDecline = () => {
    setUserConsent(false);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 p-4 shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F5F5F5] rounded-full text-[#111111]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed max-w-3xl">
            Nous utilisons des statistiques anonymes de navigation (sans profilage ni publicité) pour améliorer notre catalogue de T-shirts à Abidjan. Aucune donnée privée WhatsApp n'est enregistrée.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#111111] transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#111111] text-white hover:bg-neutral-800 transition-colors shadow-sm"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
