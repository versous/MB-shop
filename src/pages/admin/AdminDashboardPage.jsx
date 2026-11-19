import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MessageCircle,
  ShoppingBag,
  Truck,
  Clock,
  XCircle,
  TrendingUp,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatFCFA } from '../../lib/whatsapp';

export default function AdminDashboardPage() {
  const { orders, getAnalyticsData, loading, dataMode, refreshData } = useStore();
  const [period, setPeriod] = useState('7days');
  const [analytics, setAnalytics] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Charger les données analytiques calculées en fonction de la période choisie
  useEffect(() => {
    let isMounted = true;
    setDataLoading(true);
    setDataError('');

    getAnalyticsData(period)
      .then((data) => {
        if (isMounted) {
          setAnalytics(data);
          setDataLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          setDataLoading(false);
          setDataError('Impossible de charger les statistiques. Vérifiez la connexion puis réessayez.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [period, getAnalyticsData, refreshKey]);

  if (dataMode === 'error') {
    return (
      <div role="alert" className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 p-4 text-sm text-red-900">
        <span>Les données ne sont pas synchronisées. Les indicateurs ne peuvent pas être confirmés.</span>
        <button type="button" onClick={refreshData} className="px-3 py-2 bg-red-800 text-white text-xs font-bold uppercase">
          Réessayer
        </button>
      </div>
    );
  }
  if (loading || (dataLoading && !analytics)) {
    return <LoadingSpinner text="Calcul des métriques en temps réel..." />;
  }
  if (!analytics) {
    return (
      <div role="alert" className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 p-4 text-sm text-red-900">
        <span>{dataError || 'Les statistiques ne sont pas disponibles.'}</span>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="px-3 py-2 bg-red-800 text-white text-xs font-bold uppercase"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const periodsList = [
    { key: 'today', label: "Aujourd'hui" },
    { key: '7days', label: '7 derniers jours' },
    { key: '30days', label: '30 derniers jours' },
    { key: 'month', label: 'Ce mois' },
    { key: 'all', label: 'Toutes les périodes' },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {dataError && (
        <div role="alert" className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 p-4 text-sm text-red-900">
          <span>{dataError}</span>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="px-3 py-2 bg-red-800 text-white text-xs font-bold uppercase"
          >
            Réessayer
          </button>
        </div>
      )}
      {/* Barre supérieure : Filtres de période */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-neutral-200">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
            Aperçu Opérationnel
          </span>
          <h2 className="text-xl font-bold font-display uppercase tracking-tight text-[#111111] mt-0.5">
            Indicateurs Clés de Performance
          </h2>
        </div>

        {/* Boutons de filtrage temporel */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <Calendar className="w-4 h-4 text-neutral-400 mr-1 hidden sm:block shrink-0" />
          {periodsList.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                period === p.key
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* LES 6 CARTES DE STATISTIQUES CONFORMES AUX EXIGENCES */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 1. Visiteurs uniques */}
        <div className="bg-white p-5 sm:p-6 border border-neutral-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Visiteurs Uniques
            </span>
            <div className="p-2 bg-neutral-100 text-[#111111]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] font-display">
              {analytics?.uniqueVisitors ?? 0}
            </span>
            <span className="text-xs text-neutral-400 block mt-1">
              Basé sur des ID anonymisés
            </span>
          </div>
        </div>

        {/* 2. Clics WhatsApp */}
        <div className="bg-white p-5 sm:p-6 border border-neutral-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Clics WhatsApp enregistrés
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] font-display">
              {analytics?.whatsappClicks ?? 0}
            </span>
            <span className="text-xs text-neutral-400 block mt-1">
              Clics suivis, pas des commandes confirmées
            </span>
          </div>
        </div>

        {/* 3. Nombre total de commandes */}
        <div className="bg-white p-5 sm:p-6 border border-neutral-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Commandes Saisies
            </span>
            <div className="p-2 bg-neutral-100 text-[#111111]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] font-display">
              {analytics?.totalOrders ?? 0}
            </span>
            <span className="text-xs text-neutral-400 block mt-1">
              Enregistrées sur la période
            </span>
          </div>
        </div>

        {/* 4. Livraisons effectuées (statut Livrée dédoublonné) */}
        <div className="bg-white p-5 sm:p-6 border border-neutral-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Livraisons Effectuées
            </span>
            <div className="p-2 bg-blue-50 text-blue-700">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-900 font-display">
              {analytics?.deliveredOrders ?? 0}
            </span>
            <span className="text-xs text-neutral-400 block mt-1">
              Date de livraison enregistrée
            </span>
          </div>
        </div>

        {/* 5. Commandes en attente */}
        <div className="bg-white p-5 sm:p-6 border border-neutral-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Commandes en Attente
            </span>
            <div className="p-2 bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-800 font-display">
              {analytics?.pendingOrders ?? 0}
            </span>
            <span className="text-xs text-neutral-400 block mt-1">
              À confirmer ou traiter
            </span>
          </div>
        </div>

        {/* 6. Commandes annulées */}
        <div className="bg-white p-5 sm:p-6 border border-neutral-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Commandes Annulées
            </span>
            <div className="p-2 bg-red-50 text-red-700">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-red-800 font-display">
              {analytics?.cancelledOrders ?? 0}
            </span>
            <span className="text-xs text-neutral-400 block mt-1">
              Annulations client / rupture
            </span>
          </div>
        </div>
      </div>

      {/* GRAPHIQUES EN ÉVOLUTION TEMPORELLE (RECHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique 1 : Trafic & Intention d'achat (Visiteurs vs Clics WhatsApp) */}
        <div className="bg-white p-6 border border-neutral-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111]">
                Visiteurs & Clics WhatsApp par jour
              </h3>
              <p className="text-xs text-neutral-400">Évolution de l'engagement client</p>
            </div>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.chartData || []}>
                <defs>
                  <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111111" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#111111" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#888888" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#888888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111111', color: '#fff', fontSize: '12px', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name="Visiteurs Uniques"
                  stroke="#111111"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVis)"
                />
                <Area
                  type="monotone"
                  dataKey="whatsappClicks"
                  name="Clics WhatsApp"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorWa)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique 2 : Ventes & Livraisons (Commandes vs Livraisons) */}
        <div className="bg-white p-6 border border-neutral-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111]">
                Commandes & Livraisons par jour
              </h3>
              <p className="text-xs text-neutral-400">Suivi des flux réels à Abidjan</p>
            </div>
            <Truck className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.chartData || []}>
                <defs>
                  <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#888888" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#888888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111111', color: '#fff', fontSize: '12px', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="orders"
                  name="Commandes Saisies"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOrd)"
                />
                <Area
                  type="monotone"
                  dataKey="deliveries"
                  name="Livraisons Réalisées"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDel)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* APERÇU DES DERNIÈRES COMMANDES */}
      <div className="bg-white border border-neutral-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111]">
              Dernières commandes enregistrées
            </h3>
            <p className="text-xs text-neutral-400">Commandes enregistrées par l’administration</p>
          </div>
          <Link
            to="/admin/commandes"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#111111] hover:underline"
          >
            <span>Voir toutes ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] border-b border-neutral-200 text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">N° Commande</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">T-shirt</th>
                <th className="py-3 px-4">Commune</th>
                <th className="py-3 px-4">Montant</th>
                <th className="py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#111111]">
                    {ord.order_number}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-[#111111] block">{ord.customer_name}</span>
                    <span className="text-[11px] text-neutral-400">{ord.customer_phone}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-neutral-800 block">{ord.product_name}</span>
                    <span className="text-[11px] text-neutral-400">
                      {ord.color} • Taille {ord.size} • Qté {ord.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-600 font-medium">
                    {ord.location}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#111111]">
                    {formatFCFA(ord.total_amount || ord.unit_price * ord.quantity + ord.delivery_fee)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-none ${
                        ord.status === 'Livrée'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'En livraison'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'Confirmée'
                          ? 'bg-purple-100 text-purple-800'
                          : ord.status === 'Annulée'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
