import React from 'react';
import { Menu, User, Bell, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export default function AdminHeader({ onOpenSidebar, title }) {
  const { user } = useAuth();
  const { settings, orders } = useStore();

  const pendingCount = orders.filter((o) => o.status === 'En attente').length;

  return (
    <header className="h-20 bg-white border-b border-neutral-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-[#111111] hover:bg-neutral-100 md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="font-display font-extrabold text-lg sm:text-xl uppercase tracking-tight text-[#111111]">
            {title}
          </h1>
          <p className="text-[11px] text-neutral-400 uppercase tracking-widest hidden sm:block">
            {settings.store_name || 'MAISON BLANCHE'} • Espace Administration
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Raccourci vers commandes en attente */}
        <Link
          to="/admin/commandes?statut=En attente"
          className="relative p-2 text-neutral-600 hover:text-[#111111] hover:bg-neutral-100 transition-colors"
          title={`${pendingCount} commande(s) en attente`}
        >
          <Bell className="w-5 h-5" />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </Link>

        {/* Profil administrateur */}
        <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold uppercase">
            {user?.email ? user.email.substring(0, 2) : 'AD'}
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-bold text-[#111111] block leading-tight">
              {user?.email || 'Administrateur'}
            </span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
              Accès Propriétaire
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
