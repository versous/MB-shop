import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  MessageCircle,
  Truck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatFCFA, cleanPhoneNumber } from '../../lib/whatsapp';

const toLocalDateTimeInput = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function AdminOrdersPage() {
  const { orders, products, addOrder, updateOrder, deleteOrder, showNotification, dataMode } = useStore();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('statut') || 'all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // Modale suppression
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const abidjanCommunes = [
    'Cocody (Angré, Palmeraie, Riviera, Danga)',
    'Plateau (Centre des affaires)',
    'Marcory (Zone 4, Biétry, Residentiel)',
    'Yopougon (Maroc, Selmer, Toits Rouges)',
    'Treichville',
    'Koumassi',
    'Port-Bouët',
    'Adjamé',
    'Attécoubé',
    'Abobo',
    'Bingerville',
    'Grand-Bassam'
  ];

  const statuses = [
    'En attente',
    'Confirmée',
    'En préparation',
    'En livraison',
    'Livrée',
    'Annulée'
  ];

  const availableProducts = products.filter(
    (product) => product.is_active && product.stock_status !== 'out_of_stock'
  );

  // Données initiales du formulaire commande
  const defaultFormData = {
    customer_name: '',
    customer_phone: '+225',
    product_id: availableProducts[0]?.id || '',
    product_name: availableProducts[0]?.name || '',
    category: availableProducts[0]?.category || 'Basic',
    color: availableProducts[0]?.colors?.[0]?.name || 'Noir',
    size: availableProducts[0]?.sizes?.[0] || 'M',
    quantity: 1,
    unit_price: availableProducts[0]?.price || 9000,
    delivery_fee: 1500,
    location: abidjanCommunes[0],
    order_date: toLocalDateTimeInput(new Date()),
    status: 'En attente',
    notes: ''
  };

  const [formData, setFormData] = useState(defaultFormData);
  const orderProductOptions = products.filter(
    (product) => (product.is_active && product.stock_status !== 'out_of_stock') ||
      product.id === formData.product_id
  );

  // Ouverture modale d'ajout
  const handleOpenAdd = () => {
    setEditingOrder(null);
    setFormData(defaultFormData);
    setModalOpen(true);
  };

  // Ouverture modale de modification
  const handleOpenEdit = (ord) => {
    setEditingOrder(ord);
    setFormData({
      customer_name: ord.customer_name,
      customer_phone: ord.customer_phone,
      product_id: ord.product_id || '',
      product_name: ord.product_name,
      category: ord.category || 'Basic',
      color: ord.color,
      size: ord.size,
      quantity: ord.quantity || 1,
      unit_price: ord.unit_price,
      delivery_fee: ord.delivery_fee,
      location: ord.location,
      order_date: toLocalDateTimeInput(ord.order_date || ord.created_at),
      status: ord.status,
      notes: ord.notes || ''
    });
    setModalOpen(true);
  };

  // Changement de produit dans le formulaire : synchroniser catégorie, couleur et prix unitaire automatiquement
  const handleProductChange = (prodId) => {
    const p = products.find((item) => item.id === prodId);
    if (p) {
      setFormData((prev) => ({
        ...prev,
        product_id: p.id,
        product_name: p.name,
        category: p.category,
        color: p.colors?.[0]?.name || 'Standard',
        size: p.sizes?.[0] || 'M',
        unit_price: p.price
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name.trim() || !formData.customer_phone.trim()) {
      showNotification('Le nom et le numéro WhatsApp du client sont obligatoires.', 'error');
      return;
    }
    if (!editingOrder && !availableProducts.length) {
      showNotification('Aucun produit actif et disponible ne peut être commandé.', 'error');
      return;
    }
    if (formData.status === 'Livrée' && editingOrder?.status !== 'Livrée') {
      showNotification('Confirmez une livraison depuis la rubrique Gestion Livraisons.', 'error');
      return;
    }
    if (formData.status === 'En livraison' && !editingOrder?.delivery_person?.trim()) {
      showNotification('Attribuez un livreur avant de passer la commande en livraison.', 'error');
      return;
    }

    try {
      const orderFields = {
        ...formData,
        product_id: formData.product_id || null
      };
      if (editingOrder) {
        await updateOrder(editingOrder.id, orderFields, {
          expectedUpdatedAt: editingOrder.updated_at
        });
      } else {
        await addOrder(orderFields);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    if (status === 'Livrée') {
      showNotification('Confirmez une livraison depuis la rubrique Gestion Livraisons.', 'error');
      return;
    }
    if (status === 'En livraison') {
      const order = orders.find((item) => item.id === orderId);
      if (!order?.delivery_person?.trim()) {
        showNotification('Attribuez un livreur avant de passer la commande en livraison.', 'error');
        return;
      }
    }
    try {
      await updateOrder(orderId, { status });
    } catch (err) {
      console.error('Erreur de mise à jour du statut de commande :', err);
    }
  };

  // Filtrage des commandes
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q) ||
      o.order_number?.toLowerCase().includes(q) ||
      o.location?.toLowerCase().includes(q) ||
      o.product_name?.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (dataMode === 'loading') {
    return <LoadingSpinner text="Synchronisation des commandes..." />;
  }
  if (dataMode === 'error') {
    return <div role="alert" className="bg-red-50 border border-red-200 p-4 text-sm text-red-900">La liste des commandes est indisponible ; aucune modification n’est autorisée.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Barre de contrôle supérieure */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 border border-neutral-200">
        <div className="flex flex-1 items-center gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par client, téléphone, n° commande, quartier..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#FAFAFA] border border-neutral-300 py-2 px-3 focus:outline-none font-medium cursor-pointer"
          >
            <option value="all">Tous les statuts ({orders.length})</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st} ({orders.filter((o) => o.status === st).length})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-xs uppercase tracking-wider font-bold hover:bg-black transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Saisir une Commande</span>
        </button>
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111111] text-white uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">N° Commande</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">T-shirt & Options</th>
                <th className="py-3.5 px-4">Commune</th>
                <th className="py-3.5 px-4">Montant de la commande</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-neutral-400">
                    Aucune commande ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const total = (Number(ord.unit_price) * Number(ord.quantity)) + Number(ord.delivery_fee || 0);
                  const cleanPhone = cleanPhoneNumber(ord.customer_phone);

                  return (
                    <tr key={ord.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#111111]">
                        {ord.order_number}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                        {ord.order_date
                          ? new Date(ord.order_date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit'
                            })
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-900 block">{ord.product_name}</span>
                        <span className="text-[11px] text-neutral-500 block">
                          {ord.category} • {ord.color} • T.{ord.size} • <strong>Qté: {ord.quantity}</strong>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-neutral-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{ord.location}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-[#111111] whitespace-nowrap">
                        {formatFCFA(total)}
                        <span className="block text-[10px] text-neutral-400 font-normal">
                          dont {formatFCFA(ord.delivery_fee)} livr.
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                          className={`text-[10px] font-bold uppercase tracking-wider py-1 px-2 border rounded-none cursor-pointer focus:outline-none ${
                            ord.status === 'Livrée'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : ord.status === 'En livraison'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : ord.status === 'Confirmée'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : ord.status === 'En préparation'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                              : ord.status === 'Annulée'
                              ? 'bg-red-50 text-red-800 border-red-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s} disabled={s === 'Livrée'}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(ord)}
                          className="p-1.5 text-neutral-600 hover:text-[#111111] hover:bg-neutral-100 transition-colors"
                          title="Modifier la commande"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setOrderToDelete(ord);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Supprimer la commande"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE DE SAISIE / MODIFICATION COMMANDE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-300 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-[#111111]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-display font-extrabold uppercase tracking-tight text-[#111111] mb-6">
              {editingOrder ? 'Modifier la Commande' : 'Enregistrer une Commande WhatsApp'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Coordonnées client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Nom complet du client *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="ex: Jean-Marc Kouamé"
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Numéro WhatsApp client *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="+225 07 00 00 00 00"
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              {/* Sélection du T-shirt & synchronisation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Sélectionner le produit *
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => handleProductChange(e.target.value)}
                    required={!editingOrder}
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none font-semibold cursor-pointer"
                  >
                    {!formData.product_id && (
                      <option value="" disabled>
                        Choisir un produit disponible
                      </option>
                    )}
                    {orderProductOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}{!p.is_active || p.stock_status === 'out_of_stock' ? ' (indisponible — commande existante)' : ''} ({p.category} - {formatFCFA(p.price)})
                      </option>
                    ))}
                  </select>
                  {!orderProductOptions.length && (
                    <p className="mt-1 text-[11px] text-red-700">
                      Aucun produit actif et disponible. Rendez un produit disponible avant de saisir une commande.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.category}
                    className="w-full px-3 py-2.5 bg-neutral-100 border border-neutral-300 text-neutral-600 font-bold"
                  />
                </div>
              </div>

              {/* Couleur, Taille, Quantité */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Couleur choisie *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Noir, Blanc..."
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Taille *
                  </label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none font-bold"
                  >
                    {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Prix unitaire & Frais de livraison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Prix de vente unitaire (FCFA) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Frais de livraison client (FCFA) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formData.delivery_fee}
                    onChange={(e) => setFormData({ ...formData, delivery_fee: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Commune ou quartier d'Abidjan */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Commune / Quartier de livraison à Abidjan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="ex: Cocody Riviera Palmeraie (près de l'église Notre Dame)"
                  className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none font-medium"
                />
              </div>

              {/* Statut & Date de commande */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Statut de la commande *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none font-bold cursor-pointer"
                  >
                    {statuses.filter((status) => {
                      if (status === 'Livrée') return editingOrder?.status === 'Livrée';
                      if (status === 'En livraison') {
                        return editingOrder?.status === 'En livraison' || Boolean(editingOrder?.delivery_person?.trim());
                      }
                      return true;
                    }).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Date & Heure de commande
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.order_date}
                    onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Commentaires / Notes */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Commentaire / Remarques particulières
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Instructions de livraison, contact alternatif, etc."
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Récapitulatif montant total */}
              <div className="p-4 bg-[#F5F5F5] border border-neutral-200 flex items-center justify-between">
                <span className="font-bold text-neutral-700 uppercase tracking-wider">
                  Total à percevoir auprès du client :
                </span>
                <span className="text-base font-extrabold text-[#111111]">
                  {formatFCFA((formData.unit_price * formData.quantity) + Number(formData.delivery_fee))}
                </span>
              </div>

              {/* Boutons actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 uppercase font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#111111] hover:bg-black text-white uppercase font-bold tracking-wider shadow"
                >
                  {editingOrder ? 'Mettre à jour la commande' : 'Enregistrer la commande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Supprimer cette commande ?"
        message={`Êtes-vous sûr de vouloir supprimer la commande ${orderToDelete?.order_number} pour ${orderToDelete?.customer_name} ?`}
        confirmText="Supprimer"
        onConfirm={async () => {
          if (orderToDelete) {
            try {
              await deleteOrder(orderToDelete.id, orderToDelete.updated_at);
              setDeleteConfirmOpen(false);
              setOrderToDelete(null);
            } catch (err) {
              console.error('Erreur de suppression de la commande :', err);
            }
          }
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setOrderToDelete(null);
        }}
      />
    </div>
  );
}
