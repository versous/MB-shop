import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';

// Layouts
import PublicLayout from './components/common/PublicLayout';
import AdminLayout from './components/admin/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ShopPage from './pages/public/ShopPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import ContactPage from './pages/public/ContactPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminDeliveriesPage from './pages/admin/AdminDeliveriesPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminWhatsAppPage from './pages/admin/AdminWhatsAppPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <Routes>
            {/* 1. ESPACE BOUTIQUE PUBLIQUE (DESTINÉ AUX CLIENTS) */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="boutique" element={<ShopPage />} />
              <Route path="produit/:id" element={<ProductDetailPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            {/* 2. ESPACE ADMINISTRATEUR PRIVÉ (DESTINÉ UNIQUEMENT AU PROPRIÉTAIRE) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="produits" element={<AdminProductsPage />} />
              <Route path="commandes" element={<AdminOrdersPage />} />
              <Route path="livraisons" element={<AdminDeliveriesPage />} />
              <Route path="whatsapp" element={<AdminWhatsAppPage />} />
              <Route path="analytiques" element={<AdminAnalyticsPage />} />
              <Route path="parametres" element={<AdminSettingsPage />} />
            </Route>

            {/* Route fallback vers l'accueil */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
