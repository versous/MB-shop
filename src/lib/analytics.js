import { supabase, isSupabaseConfigured } from './supabase';

const VISITOR_KEY = 'mb_visitor_id';
const SESSION_KEY = 'mb_session_id';
const CONSENT_KEY = 'mb_cookie_consent';

/**
 * Génère un identifiant aléatoire sécurisé
 */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Récupère ou initialise l'identifiant visiteur anonyme (stocké dans localStorage)
 */
export const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = 'vis_' + generateUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return 'vis_anonymous';
  }
};

/**
 * Récupère ou initialise la session courante (stockée dans sessionStorage)
 * Évite de compter un visiteur unique plusieurs fois lors d'une même session de navigation
 */
export const getSessionId = () => {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = 'sess_' + generateUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'sess_anonymous';
  }
};

/**
 * Vérifie le consentement de l'utilisateur
 */
export const hasUserConsent = () => {
  try {
    const consent = localStorage.getItem(CONSENT_KEY);
    // Consentement par défaut accepté pour analytics anonyme ou explicite
    return consent !== 'declined';
  } catch {
    return true;
  }
};

export const setUserConsent = (consented) => {
  try {
    localStorage.setItem(CONSENT_KEY, consented ? 'accepted' : 'declined');
  } catch (e) {
    console.error(e);
  }
};

/**
 * Enregistre un événement analytique dans Supabase
 */
export const trackEvent = async ({
  eventType, // 'page_view' | 'product_view' | 'whatsapp_click' | 'search'
  productId = null,
  pagePath = window.location.pathname,
  metadata = {}
}) => {
  if (!hasUserConsent()) {
    return;
  }

  const payload = {
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    event_type: eventType,
    product_id: productId,
    page_path: pagePath,
    metadata,
    created_at: new Date().toISOString()
  };

  try {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('analytics_events').insert([payload]);
      if (error) throw error;
    } else {
      // Stockage local fallback pour le dev ou preview sans backend Supabase immédiat
      const localEvents = JSON.parse(localStorage.getItem('mb_analytics_events') || '[]');
      localEvents.push({ id: 'evt_' + generateUUID(), ...payload });
      // Garder les 500 derniers événements
      if (localEvents.length > 500) localEvents.shift();
      localStorage.setItem('mb_analytics_events', JSON.stringify(localEvents));
    }
  } catch (error) {
    console.warn("[Analytics] Échec de l'enregistrement :", error.message);
  }
};
