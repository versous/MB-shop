/**
 * Formate un prix en FCFA (ex: 9 000 FCFA)
 */
export const formatFCFA = (amount) => {
  if (amount === undefined || amount === null) return '0 FCFA';
  return `${new Intl.NumberFormat('fr-FR').format(amount)} FCFA`;
};

/**
 * Nettoie et formate un numéro au format international pour WhatsApp (ex: +2250700000000 -> 2250700000000)
 */
export const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/[^\d]/g, '');
  return digits.length >= 8 && digits.length <= 15 ? digits : '';
};

/**
 * Génère le lien direct WhatsApp avec le message structuré conforme
 */
export const generateWhatsAppLink = ({
  whatsappNumber = '',
  productName,
  category = 'Basic',
  color,
  size,
  price,
  quantity = 1,
}) => {
  const cleanPhone = cleanPhoneNumber(whatsappNumber);
  if (!cleanPhone) return '';
  const formattedPrice = formatFCFA(price * quantity);

  const message = [
    'Bonjour, je souhaite commander :',
    `Produit : ${productName}`,
    `Catégorie : ${category}`,
    `Couleur : ${color}`,
    `Taille : ${size}`,
    `Prix : ${formattedPrice}`,
    `Quantité : ${quantity}`,
    '',
    'Merci de me confirmer la disponibilité et les frais de livraison.',
    'Nom complet :',
    'Numéro de téléphone :',
    'Commune / quartier de livraison :',
  ].join('\n');

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
