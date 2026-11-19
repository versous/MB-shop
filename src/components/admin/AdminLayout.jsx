import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import NotificationBanner from '../common/NotificationBanner';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin, loading } = useAuth();
  const {
    notification,
    showNotification,
    dataMode,
    loadError,
    realtimeError,
    refreshData,
    loading: storeLoading
  } = useStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <LoadingSpinner text="Vérification des accès administrateur..." />
      </div>
    );
  }

  // Si non authentifié en tant qu'admin, rediriger vers la page de connexion
  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Déterminer le titre de la page actuelle
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/admin':
        return 'Tableau de bord';
      case '/admin/produits':
        return 'Gestion des Produits';
      case '/admin/commandes':
        return 'Gestion des Commandes';
      case '/admin/livraisons':
        return 'Gestion des Livraisons';
      case '/admin/whatsapp':
        return 'Gestion WhatsApp';
      case '/admin/analytiques':
        return 'Statistiques & Analytiques';
      case '/admin/parametres':
        return 'Paramètres de la Boutique';
      default:
        return 'Administration';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col md:pl-64">
      {/* Toast notifications */}
      <NotificationBanner notification={notification} onClose={() => showNotification(null)} />

      {/* Sidebar navigation */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <AdminHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          title={getPageTitle(location.pathname)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {dataMode === 'loading' && (
            <div className="mb-6 bg-neutral-100 border border-neutral-200 p-3 text-xs text-neutral-700">
              Vérification de la synchronisation des données...
            </div>
          )}
          {(loadError || realtimeError) && (
            <div role="alert" className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 border border-red-200 p-4 text-sm text-red-900">
              <p>{loadError || realtimeError}</p>
              <button
                type="button"
                disabled={storeLoading}
                onClick={refreshData}
                className="px-3 py-2 bg-red-800 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {storeLoading ? 'Actualisation...' : 'Réessayer'}
              </button>
            </div>
          )}
          {dataMode === 'local' && (
            <div className="mb-6 bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              Mode local / démonstration : ces données ne sont pas synchronisées avec Supabase.
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
