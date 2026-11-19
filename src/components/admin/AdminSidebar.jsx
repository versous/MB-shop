import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  ShoppingBag,
  Truck,
  MessageCircle,
  BarChart3,
  Settings,
  ArrowUpRight,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export default function AdminSidebar({ isOpen, onClose }) {
  const { logout, isDemoMode } = useAuth();
  const { settings, dataMode, realtimeError } = useStore();

  const links = [
    { label: 'Tableau de bord', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Gestion Produits', path: '/admin/produits', icon: Shirt },
    { label: 'Gestion Commandes', path: '/admin/commandes', icon: ShoppingBag },
    { label: 'Gestion Livraisons', path: '/admin/livraisons', icon: Truck },
    { label: 'Gestion WhatsApp', path: '/admin/whatsapp', icon: MessageCircle },
    { label: 'Analytiques', path: '/admin/analytiques', icon: BarChart3 },
    { label: 'Paramètres', path: '/admin/parametres', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#111111] text-white flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header du menu */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-neutral-800">
            <div>
              <span className="font-display font-extrabold text-base tracking-tight text-white block uppercase">
                {settings.store_name || 'MAISON BLANCHE'}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
                Admin Console
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode status badge */}
          <div className="px-6 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400">Mode :</span>
            {isDemoMode ? (
              <span className="px-2 py-0.5 bg-amber-950 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-800">
                Local / Démo
              </span>
            ) : dataMode === 'error' ? (
              <span className="px-2 py-0.5 bg-red-950 text-red-300 text-[10px] font-bold uppercase tracking-wider border border-red-800">
                Hors ligne
              </span>
            ) : dataMode === 'loading' ? (
              <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 text-[10px] font-bold uppercase tracking-wider border border-neutral-700">
                Chargement
              </span>
            ) : (
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                realtimeError
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {realtimeError ? 'Sync limitée' : 'Supabase actif'}
              </span>
            )}
          </div>

          {/* Liens de navigation */}
          <nav className="p-4 space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.exact}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-white text-[#111111] shadow-md font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Pied du sidebar */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-4 py-2.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors uppercase tracking-wider font-semibold"
          >
            <span>Voir la boutique</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors uppercase tracking-wider font-semibold"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
