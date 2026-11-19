import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ConsentBanner from './ConsentBanner';
import NotificationBanner from './NotificationBanner';
import { useStore } from '../../context/StoreContext';

export default function PublicLayout() {
  const { notification, showNotification } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Toast notifications */}
      <NotificationBanner notification={notification} onClose={() => showNotification(null)} />

      {/* Navigation */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Consentement analytics respectueux */}
      <ConsentBanner />

      {/* Footer */}
      <Footer />
    </div>
  );
}
