import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://votre-projet.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

// Client Supabase réel
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Service pour la gestion des images dans Supabase Storage
 */
export const storageService = {
  async uploadProductImage(file) {
    if (!isSupabaseConfigured()) {
      // Mode simulation local si Supabase n'est pas encore connecté
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            data: { publicUrl: reader.result },
            error: null
          });
        };
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return {
        data: { publicUrl: publicUrlData.publicUrl },
        error: null
      };
    } catch (error) {
      console.error('Erreur upload image Supabase:', error);
      return { data: null, error };
    }
  }
};
