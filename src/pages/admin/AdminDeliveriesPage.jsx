import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  MessageCircle,
  MapPin,
  Search,
  Filter,
  Check,
  X,
  Package
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatFCFA, cleanPhoneNumber } from '../../lib/whatsapp';

const toLocalDateTimeInput = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function AdminDeliveriesPage() {
  const { orders, markOrderDelivered, updateOrder, showNotification, dataMode } = useStore();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' = à livrer, 'history' = déjà livrées
  const [search, setSearch] = useState('');

  // Modale pour marquer une commande comme livrée
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryPerson, setDeliveryPerson] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(toLocalDateTimeInput(new Date()));
  const [savingDelivery, setSavingDelivery] = useState(false);

  // Seules les commandes confirmées sont prêtes à être expédiées.
  const toDeliverOrders = orders.filter((o) =>
    ['Confirmée', 'En préparation', 'En livraison'].includes(o.status)
  );

  // Commandes livrées (statut 'Livrée', calcul strict sans doublons)
  const deliveredOrders = orders.filter((o) => o.status === 'Livrée');

  const openDeliveryModal = (ord) => {
    setSelectedOrder(ord);
    setDeliveryPerson(ord.delivery_person || '');
    setDeliveryNotes(ord.notes || '');
    setDeliveryDate(toLocalDateTimeInput(new Date()));
    setDeliveryModalOpen(true);
  };

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !deliveryPerson.trim()) {
      showNotification('Le nom du livreur est obligatoire.', 'error');
      return;
    }

    const confirmedAt = new Date(deliveryDate);
    if (Number.isNaN(confirmedAt.getTime())) {
      showNotification('La date et l’heure de livraison sont invalides.', 'error');
      return;
    }

    setSavingDelivery(true);
    try {
      await markOrderDelivered(selectedOrder.id, {
        deliveryPerson,
        deliveredAt: confirmedAt.toISOString(),
        notes: deliveryNotes,
        expectedUpdatedAt: selectedOrder.updated_at
      });
      setDeliveryModalOpen(false);
    } catch (err) {
      console.error('Erreur de confirmation de livraison :', err);
    } finally {
      setSavingDelivery(false);
    }
  };

  const handleUpdateCourier = async (orderId, newCourier, expectedUpdatedAt) => {
    if (!newCourier.trim()) return;
    try {
      await updateOrder(
        orderId,
        { delivery_person: newCourier.trim() },
        { notify: false, expectedUpdatedAt }
      );
      showNotification('Livreur enregistré. Le statut de livraison reste inchangé.', 'success');
    } catch (err) {
      console.error("Erreur d'enregistrement du livreur :", err);
    }
  };

  // Filtrage selon onglet actif
  const currentList = activeTab === 'pending' ? toDeliverOrders : deliveredOrders;
  const filteredList = currentList.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q) ||
      o.order_number?.toLowerCase().includes(q) ||
      o.location?.toLowerCase().includes(q) ||
      o.delivery_person?.toLowerCase().includes(q)
    );
  });

  if (dataMode === 'loading') {
    return <div className="p-6 text-sm text-neutral-500">Synchronisation des commandes...</div>;
  }
  if (dataMode === 'error') {
    return <div role="alert" className="bg-red-50 border border-red-200 p-4 text-sm text-red-900">Les livraisons ne sont pas disponibles ; aucune modification n’est autorisée.</div>;
  }

  return (
    <div className="space-y-6">
      {/* 3 Cartes de résumé de livraison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Commandes à livrer
            </span>
            <div className="p-2 bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-[#111111] font-display">
            {toDeliverOrders.length}
          </span>
          <span className="text-xs text-neutral-400 block mt-1">
            Confirmées, en préparation ou en cours de route
          </span>
        </div>

        <div className="bg-white p-5 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Livraisons terminées
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-emerald-800 font-display">
            {deliveredOrders.length}
          </span>
          <span className="text-xs text-neutral-400 block mt-1">
            Calcul automatique sans doublons
          </span>
        </div>

        <div className="bg-white p-5 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Montant des commandes livrées
            </span>
            <div className="p-2 bg-blue-50 text-blue-700">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-blue-900 font-display">
            {formatFCFA(
              deliveredOrders.reduce(
                (acc, o) => acc + (Number(o.unit_price) * Number(o.quantity) + Number(o.delivery_fee || 0)),
                0
              )
            )}
          </span>
          <span className="text-xs text-neutral-400 block mt-1">
            Paiement non suivi par le système
          </span>
        </div>
      </div>

      {/* Onglets & Barre de recherche */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 border border-neutral-200">
        <div className="flex border-b sm:border-b-0 border-neutral-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 sm:border-b-0 sm:border transition-all ${
              activeTab === 'pending'
                ? 'border-[#111111] bg-[#111111] text-white'
                : 'border-transparent text-neutral-500 hover:text-[#111111] bg-[#FAFAFA]'
            }`}
          >
            À expédier / En cours ({toDeliverOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 sm:border-b-0 sm:border transition-all ml-2 ${
              activeTab === 'history'
                ? 'border-[#111111] bg-[#111111] text-white'
                : 'border-transparent text-neutral-500 hover:text-[#111111] bg-[#FAFAFA]'
            }`}
          >
            Historique des livrées ({deliveredOrders.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher client, quartier, livreur..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Tableau des livraisons */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111111] text-white uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">N° Commande</th>
                <th className="py-3.5 px-4">Client & Contact</th>
                <th className="py-3.5 px-4">Adresse / Commune</th>
                <th className="py-3.5 px-4">Colis</th>
                <th className="py-3.5 px-4">Livreur assigné</th>
                <th className="py-3.5 px-4">Montant de la commande</th>
                <th className="py-3.5 px-4">{activeTab === 'pending' ? 'Statut actuel' : 'Date de livraison'}</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-neutral-400">
                    Aucune livraison dans cet onglet.
                  </td>
                </tr>
              ) : (
                filteredList.map((ord) => {
                  const total = (Number(ord.unit_price) * Number(ord.quantity)) + Number(ord.delivery_fee || 0);
                  const cleanPhone = cleanPhoneNumber(ord.customer_phone);

                  return (
                    <tr key={ord.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#111111]">
                        {ord.order_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#111111] block">{ord.customer_name}</span>
                        {cleanPhone ? (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{ord.customer_phone}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-red-700">Numéro invalide : {ord.customer_phone}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-1.5 font-medium text-neutral-800">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                          <span>{ord.location}</span>
                        </div>
                        {ord.notes && (
                          <p className="text-[11px] text-neutral-500 mt-1 italic">
                            « {ord.notes} »
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-neutral-900 block">{ord.product_name}</span>
                        <span className="text-[11px] text-neutral-500">
                          {ord.color} • T.{ord.size} • <strong>Qté: {ord.quantity}</strong>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {activeTab === 'pending' ? (
                          <input
                            type="text"
                            defaultValue={ord.delivery_person || ''}
                            placeholder="Nom du livreur..."
                            onBlur={(e) => {
                              if (!e.target.value.trim()) {
                                e.target.value = ord.delivery_person || '';
                              } else if (e.target.value.trim() !== (ord.delivery_person || '')) {
                                handleUpdateCourier(ord.id, e.target.value, ord.updated_at);
                              }
                            }}
                            className="w-36 px-2 py-1 text-xs border border-neutral-300 bg-[#FAFAFA] focus:bg-white focus:outline-none"
                          />
                        ) : (
                          <span className="font-semibold text-neutral-800 flex items-center gap-1">
                            <User className="w-3 h-3 text-neutral-400" />
                            {ord.delivery_person || 'Non renseigné'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#111111]">
                        {formatFCFA(total)}
                      </td>
                      <td className="py-3.5 px-4">
                        {activeTab === 'pending' ? (
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              ord.status === 'En livraison'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'Confirmée'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        ) : (
                          <span className="text-neutral-600 font-medium whitespace-nowrap">
                            {ord.delivered_at
                              ? new Date(ord.delivered_at).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Date non renseignée'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {ord.status !== 'Livrée' ? (
                          <button
                            onClick={() => openDeliveryModal(ord)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Marquer livrée</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold uppercase">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Effectuée</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE MARQUER LIVRÉE */}
      {deliveryModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border border-neutral-300 relative">
            <button
              onClick={() => setDeliveryModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-[#111111]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight text-[#111111]">
                  Confirmer la livraison
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  {selectedOrder.order_number} • {selectedOrder.customer_name}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmDelivery} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Nom du livreur / coursier *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryPerson}
                  onChange={(e) => setDeliveryPerson(e.target.value)}
                  placeholder="Nom du livreur"
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Date et heure de livraison *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Commentaires / Confirmation de remise
                </label>
                <textarea
                  rows="2"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Colis remis en mains propres, paiement perçu..."
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setDeliveryModalOpen(false)}
                  className="px-4 py-2 uppercase font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingDelivery}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white uppercase font-bold tracking-wider shadow disabled:opacity-50"
                >
                  {savingDelivery ? 'Enregistrement...' : 'Valider la livraison'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
