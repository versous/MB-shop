import React, { useEffect } from 'react';
import { MessageCircle, Mail, MapPin, Clock, Truck, HelpCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { cleanPhoneNumber } from '../../lib/whatsapp';
import { trackEvent } from '../../lib/analytics';

export default function ContactPage() {
  const { settings } = useStore();
  const cleanPhone = cleanPhoneNumber(settings.whatsapp_number);

  useEffect(() => {
    trackEvent({
      eventType: 'page_view',
      pagePath: '/contact'
    });
  }, []);

  const deliveryEstimates = [
    { zone: 'Cocody (Riviera, Angré, Deux Plateaux, Danga)', fee: '1 500 - 2 000 FCFA', delay: 'Même jour ou 24h' },
    { zone: 'Plateau & Adjamé', fee: '1 500 FCFA', delay: 'Même jour ou 24h' },
    { zone: 'Marcory & Zone 4 / Biétry', fee: '1 500 - 2 000 FCFA', delay: 'Même jour ou 24h' },
    { zone: 'Yopougon, Attécoubé', fee: '2 000 - 2 500 FCFA', delay: '24h - 48h' },
    { zone: 'Treichville & Koumassi', fee: '1 500 - 2 000 FCFA', delay: '24h' },
    { zone: 'Bingerville & Bassam', fee: '2 500 - 3 500 FCFA', delay: '24h - 48h' },
  ];

  return (
    <div className="min-h-screen bg-white py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#777777]">
            À votre écoute
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111] mt-2">
            Contact & Livraisons
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-3 leading-relaxed">
            Une question sur une coupe, un grammage ou une commande spéciale ? Notre équipe vous répond immédiatement sur WhatsApp.
          </p>
        </div>

        {/* Coordonnées & Accès Direct */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 bg-[#FAFAFA] border border-neutral-200 text-center space-y-4">
            <div className="w-12 h-12 bg-[#111111] text-white rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111]">
              WhatsApp Direct
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Le moyen le plus rapide pour commander ou vérifier les stocks en temps réel.
            </p>
            {cleanPhone ? (
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-2.5 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
              >
                Écrire sur WhatsApp
              </a>
            ) : (
              <p className="text-xs text-amber-800">Le numéro WhatsApp n’est pas encore configuré.</p>
            )}
          </div>

          <div className="p-8 bg-[#FAFAFA] border border-neutral-200 text-center space-y-4">
            <div className="w-12 h-12 bg-[#111111] text-white rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111]">
              Courrier Électronique
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Pour les partenariats, commandes B2B ou demandes de presse.
            </p>
            <a
              href={`mailto:${settings.email || 'contact@maisonblanche.ci'}`}
              className="inline-block text-xs font-semibold text-[#111111] underline underline-offset-4"
            >
              {settings.email || 'contact@maisonblanche.ci'}
            </a>
          </div>

          <div className="p-8 bg-[#FAFAFA] border border-neutral-200 text-center space-y-4">
            <div className="w-12 h-12 bg-[#111111] text-white rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111]">
              Atelier & Expédition
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {settings.address || 'Abidjan, Côte d\'Ivoire'}
            </p>
            <p className="text-[11px] text-neutral-400 font-medium">
              Expéditions du Lundi au Samedi de 9h à 18h
            </p>
          </div>
        </div>

        {/* Grille Tarifs de Livraison à Abidjan */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-6 h-6 text-[#111111]" />
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#111111]">
              Grille Estimative des Frais de Livraison (Abidjan)
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mb-6">
            La livraison est à la charge du client et payée directement au livreur partenaire à la réception de votre colis.
          </p>

          <div className="overflow-x-auto border border-neutral-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111111] text-white">
                <tr>
                  <th className="py-3.5 px-5 uppercase font-bold tracking-wider">Commune / Zone</th>
                  <th className="py-3.5 px-5 uppercase font-bold tracking-wider">Tarif moyen</th>
                  <th className="py-3.5 px-5 uppercase font-bold tracking-wider">Délai estimé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {deliveryEstimates.map((item, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-[#111111]">{item.zone}</td>
                    <td className="py-3.5 px-5 text-neutral-700 font-medium">{item.fee}</td>
                    <td className="py-3.5 px-5 text-neutral-500">{item.delay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ & Conseils d'entretien */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border border-neutral-200 bg-[#FAFAFA]">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111] mb-3">
              Comment entretenir votre T-shirt en coton lourd ?
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed space-y-2">
              Lavage en machine à 30°C sur l'envers recommandé pour préserver l'intensité de la couleur (notamment le Noir profond et les cotons 240g). Évitez le sèche-linge agressif : le séchage à l'air libre sur cintre garantit la longévité de la coupe.
            </p>
          </div>

          <div className="p-6 border border-neutral-200 bg-[#FAFAFA]">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111] mb-3">
              Politique d'échange de taille
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Si la taille choisie ne vous convient pas, vous disposez de 48h après livraison pour solliciter un échange de taille (produit neuf, non porté et non lavé). Les frais de réexpédition sont à la charge de l'acheteur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
