import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cleanPhoneNumber, generateWhatsAppLink } from '../../lib/whatsapp';
import { trackEvent } from '../../lib/analytics';
import { useStore } from '../../context/StoreContext';

export default function WhatsAppButton({
  product,
  selectedColor,
  selectedSize,
  quantity = 1,
  disabled = false,
  className = '',
  buttonText = 'Commander sur WhatsApp',
  onBeforeClick
}) {
  const { settings } = useStore();
  const isDisabled = disabled || !cleanPhoneNumber(settings.whatsapp_number);

  const handleClick = (e) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }

    if (onBeforeClick && !onBeforeClick()) {
      e.preventDefault();
      return;
    }

    // 1. Enregistrer l'événement analytique de clic WhatsApp avec métadonnées
    trackEvent({
      eventType: 'whatsapp_click',
      productId: product?.id,
      pagePath: window.location.pathname,
      metadata: {
        productName: product?.name,
        category: product?.category,
        color: selectedColor,
        size: selectedSize,
        quantity,
        price: product?.price
      }
    });

    // 2. Le lien wa.me s'ouvre dans un nouvel onglet
  };

  const link = generateWhatsAppLink({
    whatsappNumber: settings.whatsapp_number,
    productName: product?.name || 'T-shirt Uni',
    category: product?.category || 'Basic',
    color: selectedColor || (product?.colors?.[0]?.name || 'Couleur standard'),
    size: selectedSize || (product?.sizes?.[0] || 'M'),
    price: product?.price || 9000,
    quantity
  });

  return (
    <a
      href={isDisabled ? '#' : link}
      target={isDisabled ? '_self' : '_blank'}
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#111111] hover:bg-black text-white text-xs sm:text-sm uppercase tracking-widest font-bold transition-all shadow-md group ${
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:scale-[1.01]'
      } ${className}`}
    >
      <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
      <span>{settings.whatsapp_number ? buttonText : 'WhatsApp indisponible'}</span>
    </a>
  );
}
