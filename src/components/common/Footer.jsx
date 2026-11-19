import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, MapPin, Instagram, Facebook, Shield, Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { cleanPhoneNumber } from '../../lib/whatsapp';

export default function Footer() {
  const { settings } = useStore();
  const cleanPhone = cleanPhoneNumber(settings.whatsapp_number);

  return (
    <footer className="bg-[#111111] text-white pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Marque */}
          <div className="md:col-span-1 space-y-4">
            <h2 className="font-display font-extrabold text-2xl tracking-tighter uppercase text-white">
              {settings.store_name || 'MAISON BLANCHE'}
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {settings.description ||
                'Marque de prêt-à-porter minimaliste à Abidjan. Spécialiste du t-shirt uni haut de gamme, confectionné avec des cotons denses et respirants.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] text-neutral-400 uppercase tracking-widest font-medium">
                Confection & Expédition Abidjan
              </span>
            </div>
          </div>

          {/* Navigation Rapide */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
              </li>
              <li>
                <Link to="/boutique" className="hover:text-white transition-colors">Tous les t-shirts</Link>
              </li>
              <li>
                <Link to="/boutique?categorie=Basic" className="hover:text-white transition-colors">Collection Basic</Link>
              </li>
              <li>
                <Link to="/boutique?categorie=Oversize" className="hover:text-white transition-colors">Collection Oversize</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact & Livraison</Link>
              </li>
            </ul>
          </div>

          {/* Contact direct & WhatsApp */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300">
              Service Client & Commandes
            </h3>
            <ul className="space-y-3 text-xs text-neutral-400">
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                {cleanPhone ? (
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors underline underline-offset-4"
                  >
                    WhatsApp : {settings.whatsapp_number}
                  </a>
                ) : (
                  <span>Numéro WhatsApp non configuré</span>
                )}
              </li>
              {settings.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>{settings.address || 'Abidjan, Côte d\'Ivoire'}</span>
              </li>
            </ul>
          </div>

          {/* Réseaux sociaux & Conditions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300">
              Suivez-nous
            </h3>
            <p className="text-xs text-neutral-400">
              Découvrez les looks, les arrivages et les coulisses de la marque.
            </p>
            <div className="flex items-center gap-4 pt-1">
              {settings.social_links?.instagram && (
                <a
                  href={settings.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-500 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.social_links?.facebook && (
                <a
                  href={settings.social_links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-500 transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 pt-2">
              Livraison rapide à Abidjan (Cocody, Plateau, Marcory, etc.) à la charge du client.
            </p>
          </div>
        </div>

        {/* Barre inférieure */}
        <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} {settings.store_name || 'MAISON BLANCHE'}. Tous droits réservés.</p>
          
          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-neutral-400 transition-colors">
              Frais de livraison & FAQ
            </Link>
            <span className="text-neutral-700">•</span>
            {/* Accès discret pour le propriétaire */}
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Espace Propriétaire</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
