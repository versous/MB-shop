import React, { useEffect, useState } from 'react';
import {
  Save,
  Store,
  MessageCircle,
  Mail,
  MapPin,
  Share2,
  Image as ImageIcon,
  CheckCircle2,
  Upload
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { storageService } from '../../lib/supabase';

export default function AdminSettingsPage() {
  const { settings, updateSettings, showNotification, loading, dataMode } = useStore();

  const [formData, setFormData] = useState({
    store_name: settings.store_name || 'MAISON BLANCHE',
    tagline: settings.tagline || 'T-shirts unis de haute confection',
    logo_url: settings.logo_url || '',
    whatsapp_number: settings.whatsapp_number || '',
    email: settings.email || 'contact@maisonblanche.ci',
    phone: settings.phone || '+225 07 00 00 00 00',
    address: settings.address || 'Cocody Ambassades & Plateau, Abidjan, Côte d\'Ivoire',
    description: settings.description || '',
    currency: settings.currency || 'FCFA',
    social_links: {
      instagram: settings.social_links?.instagram || 'https://instagram.com/maisonblanche.ci',
      facebook: settings.social_links?.facebook || 'https://facebook.com/maisonblanche.ci',
      tiktok: settings.social_links?.tiktok || 'https://tiktok.com/@maisonblanche.ci'
    }
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading || dataMode === 'error') return;
    setFormData({
      store_name: settings.store_name || 'MAISON BLANCHE',
      tagline: settings.tagline || 'T-shirts unis de haute confection',
      logo_url: settings.logo_url || '',
      whatsapp_number: settings.whatsapp_number || '',
      email: settings.email || '',
      phone: settings.phone || '',
      address: settings.address || '',
      description: settings.description || '',
      currency: settings.currency || 'FCFA',
      social_links: {
        instagram: settings.social_links?.instagram || '',
        facebook: settings.social_links?.facebook || '',
        tiktok: settings.social_links?.tiktok || ''
      }
    });
  }, [settings, loading, dataMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(formData);
    } catch (err) {
      console.error('Erreur de sauvegarde des paramètres :', err);
      showNotification(err.message || 'Impossible de sauvegarder les paramètres.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { data, error } = await storageService.uploadProductImage(file);
      if (error) {
        showNotification("Impossible d'importer le logo.", 'error');
      } else if (data?.publicUrl) {
        setFormData((prev) => ({ ...prev, logo_url: data.publicUrl }));
      }
    } catch (err) {
      console.error(err);
      showNotification("Impossible d'importer le logo.", 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-neutral-500">Chargement des paramètres enregistrés...</div>;
  }

  if (dataMode === 'error') {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 p-4 text-sm text-red-900">
        Les paramètres ne sont pas disponibles ; aucune valeur par défaut ne sera enregistrée.
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
          Configuration Globale
        </span>
        <h2 className="text-xl font-bold font-display uppercase tracking-tight text-[#111111] mt-0.5">
          Paramètres de la Boutique
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Ces informations sont utilisées sur la boutique publique, le pied de page et les boutons de commande WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* IDENTITÉ DE MARQUE */}
        <div className="bg-white p-6 border border-neutral-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Store className="w-4 h-4 text-[#111111]" />
            <h3 className="font-bold uppercase tracking-wider text-sm text-[#111111]">
              Identité de Marque
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Nom de la marque *
              </label>
              <input
                type="text"
                required
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Slogan / Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Logo (URL ou fichier image)
            </label>
            <div className="flex items-center gap-4 mb-2">
              {formData.logo_url && (
                <div className="h-12 w-28 bg-[#111111] p-2 flex items-center justify-center border border-neutral-300">
                  <img src={formData.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <div className="flex-1 flex gap-2">
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://... ou laisser vide pour texte pur"
                  className="flex-1 px-3 py-2 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
                />
                <label className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold uppercase cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? 'Upload...' : 'Importer'}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Description de la marque (affichée en pied de page)
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* CANAL DE COMMANDE WHATSAPP & CONTACT */}
        <div className="bg-white p-6 border border-neutral-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold uppercase tracking-wider text-sm text-[#111111]">
              Numéro WhatsApp & Coordonnées
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Numéro WhatsApp de réception des commandes
              </label>
              <input
                type="text"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="+2250700000000"
                className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none font-bold"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Format international (8 à 15 chiffres). Sans numéro valide, les boutons WhatsApp restent désactivés.
              </span>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Adresse e-mail publique
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Téléphone d'appel direct
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Adresse physique à Abidjan
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* RÉSEAUX SOCIAUX */}
        <div className="bg-white p-6 border border-neutral-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Share2 className="w-4 h-4 text-[#111111]" />
            <h3 className="font-bold uppercase tracking-wider text-sm text-[#111111]">
              Réseaux Sociaux
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Lien Instagram
              </label>
              <input
                type="url"
                value={formData.social_links.instagram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, instagram: e.target.value }
                  })
                }
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Lien Facebook
              </label>
              <input
                type="url"
                value={formData.social_links.facebook}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, facebook: e.target.value }
                  })
                }
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Lien TikTok
              </label>
              <input
                type="url"
                value={formData.social_links.tiktok}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, tiktok: e.target.value }
                  })
                }
                placeholder="https://tiktok.com/@..."
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bouton Enregistrer */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
          disabled={saving || uploadingLogo}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111111] hover:bg-black text-white text-xs uppercase tracking-widest font-bold shadow-lg transition-transform hover:scale-[1.01]"
          >
            <Save className="w-4 h-4" />
          <span>{saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
