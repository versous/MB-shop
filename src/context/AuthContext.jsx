import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());

  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      // 1. Initialiser la session Supabase
      supabase.auth.getSession()
        .then(({ data: { session }, error }) => {
          if (error) throw error;
          return handleSession(session);
        })
        .catch((err) => {
          console.error('Échec de la récupération de la session :', err);
          setUser(null);
          setIsAdmin(false);
          setAuthError('Impossible de vérifier la session. Rechargez la page ou reconnectez-vous.');
          setLoading(false);
        });

      // 2. Écouter les changements d'authentification
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        handleSession(session);
      });

      return () => subscription.unsubscribe();
    } else {
      // Mode simulation local si Supabase n'est pas configuré
      const localAdmin = localStorage.getItem('mb_admin_logged');
      if (localAdmin === 'true') {
        setUser({ id: 'admin-local', email: 'admin@maisonblanche.ci', role: 'admin' });
        setIsAdmin(true);
      }
      setIsDemoMode(true);
      setLoading(false);
    }
  }, []);

  const handleSession = async (session) => {
    setLoading(true);
    setAuthError('');

    if (session?.user) {
      setUser(session.user);
      try {
        const { data: adminRecord, error } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        const authorized = adminRecord?.role === 'admin' || adminRecord?.role === 'superadmin';
        setIsAdmin(authorized);
        if (!authorized) {
          setAuthError("Ce compte n'est pas autorisé à accéder à l'administration.");
        }
      } catch (err) {
        console.error('Échec de la vérification du rôle administrateur :', err);
        setIsAdmin(false);
        setAuthError("Impossible de vérifier les droits administrateur. Réessayez plus tard.");
      }
    } else {
      setUser(null);
      setIsAdmin(false);
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const { data: adminRecord, error: roleError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (roleError) {
        await supabase.auth.signOut();
        throw roleError;
      }

      if (!adminRecord || !['admin', 'superadmin'].includes(adminRecord.role)) {
        await supabase.auth.signOut();
        throw new Error("Ce compte n'est pas autorisé à accéder à l'administration.");
      }

      setUser(data.user);
      setIsAdmin(true);
      setAuthError('');
      return data;
    } else {
      // Authentification locale par défaut pour démo / dev
      if (
        (email.trim().toLowerCase() === 'admin@maisonblanche.ci' || email.trim().toLowerCase() === 'admin@mbwear.ci' || email.trim().toLowerCase() === 'admin') &&
        password === 'admin123'
      ) {
        const demoUser = { id: 'admin-local', email: 'admin@maisonblanche.ci', role: 'admin' };
        localStorage.setItem('mb_admin_logged', 'true');
        setUser(demoUser);
        setIsAdmin(true);
        return { user: demoUser };
      } else {
        throw new Error('Identifiants incorrects. Utilisez admin@maisonblanche.ci et le mot de passe admin123 en mode local.');
      }
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('mb_admin_logged');
    }
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    isAdmin,
    loading,
    authError,
    isDemoMode,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
