import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Shield, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useStore();
  const { isAdmin } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'Boutique', path: '/boutique' },
    { label: 'Basic', path: '/boutique?categorie=Basic' },
    { label: 'Oversize', path: '/boutique?categorie=Oversize' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.store_name}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tighter text-[#111111] uppercase group-hover:opacity-80 transition-opacity">
                  {settings.store_name || 'MAISON BLANCHE'}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#777777] -mt-1 font-medium">
                  Abidjan • T-shirts Unis
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname + location.search === link.path;

              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`text-xs uppercase tracking-widest font-semibold transition-colors duration-200 py-1 relative ${
                    isActive
                      ? 'text-[#111111] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#111111]'
                      : 'text-neutral-500 hover:text-[#111111]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Admin shortcut */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/boutique"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-all shadow-sm"
            >
              <span>Commander</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="p-2 text-neutral-500 hover:text-[#111111] hover:bg-neutral-100 rounded-full transition-colors"
                title="Tableau de bord Admin"
              >
                <Shield className="w-4 h-4 text-emerald-600" />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {isAdmin && (
              <Link to="/admin" className="p-2 text-emerald-600">
                <Shield className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#111111] hover:bg-[#F5F5F5] transition-colors focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-white px-6 pt-4 pb-8 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm uppercase tracking-wider font-semibold text-neutral-800 hover:text-[#111111] py-2 border-b border-neutral-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2">
            <Link
              to="/boutique"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#111111] text-white text-xs uppercase tracking-widest font-bold shadow"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Voir la boutique</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
