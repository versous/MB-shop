import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, ArrowRight, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAdmin, authError } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  if (isAdmin) {
    navigate('/admin', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@maisonblanche.ci');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white border border-neutral-300 shadow-2xl p-8 sm:p-10 relative">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#111111] text-white flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#777777] font-bold">
            Espace Privé Sécurisé
          </span>
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#111111] mt-1">
            {settings.store_name || 'MAISON BLANCHE'}
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            Connexion réservée au propriétaire et administrateurs.
          </p>
        </div>

        {/* Badge d'état Supabase */}
        <div className="mb-6 p-3 bg-neutral-50 border border-neutral-200 text-xs">
          {isSupabaseConfigured() ? (
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Authentification active via Supabase Auth</span>
            </div>
          ) : (
            <div className="space-y-1 text-neutral-700">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Mode Local / Démo Développeur</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-tight">
                Pour tester immédiatement avant de lier Supabase, utilisez les identifiants pré-configurés :
              </p>
              <button
                type="button"
                onClick={handleFillDemo}
                className="mt-1 text-[11px] font-bold text-[#111111] underline underline-offset-2 hover:opacity-80"
              >
                Remplir automatiquement (admin@maisonblanche.ci / admin123)
              </button>
            </div>
          )}
        </div>

        {/* Message d'erreur */}
        {(errorMsg || authError) && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg || authError}</span>
          </div>
        )}

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Adresse e-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@maisonblanche.ci"
              className="w-full px-4 py-3 bg-[#FAFAFA] border border-neutral-300 text-xs text-[#111111] focus:bg-white focus:border-[#111111] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-[#FAFAFA] border border-neutral-300 text-xs text-[#111111] focus:bg-white focus:border-[#111111] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#111111] text-white text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Vérification...</span>
            ) : (
              <>
                <span>Accéder au Tableau de Bord</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <Link
            to="/"
            className="text-xs text-neutral-500 hover:text-[#111111] transition-colors underline underline-offset-4"
          >
            ← Retourner à la boutique publique
          </Link>
        </div>
      </div>
    </div>
  );
}
