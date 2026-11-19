import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Eye,
  MessageCircle,
  Search,
  Layers,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
  RotateCcw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatFCFA } from '../../lib/whatsapp';

export default function AdminAnalyticsPage() {
  const { getAnalyticsData, resetAnalytics, dataMode, refreshData } = useStore();
  const [period, setPeriod] = useState('30days');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [dataError, setDataError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setDataError('');

    getAnalyticsData(period)
      .then((res) => {
        if (isMounted) {
          setAnalytics(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          setLoading(false);
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
        <span>Les données ne sont pas synchronisées. Les statistiques ne peuvent pas être confirmées.</span>
        <button type="button" onClick={refreshData} className="px-3 py-2 bg-red-800 text-white text-xs font-bold uppercase">
          Réessayer
        </button>
      </div>
    );
  }

  if (loading && !analytics) {
    return <LoadingSpinner text="Agrégation des données analytiques..." />;
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

  return (
    <div className="space-y-8">
      {/* Barre de contrôle supérieure */}
      {dataError && (
        <div role="alert" className="bg-red-50 border border-red-200 p-4 text-sm text-red-900">
          {dataError}
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-neutral-200">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
            Données de Trafic & Conversion
          </span>
          <h2 className="text-xl font-bold font-display uppercase tracking-tight text-[#111111] mt-0.5">
            Statistiques de trafic et de commandes
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

          <button
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-700 text-xs font-bold uppercase tracking-wider border border-neutral-300 hover:border-red-300 transition-colors shrink-0"
            title="Remettre les statistiques à zéro"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* 4 Métriques principales demandées */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Visiteurs Uniques
            </span>
            <Users className="w-4 h-4 text-[#111111]" />
          </div>
          <span className="text-3xl font-extrabold text-[#111111] font-display">
            {analytics.uniqueVisitors}
          </span>
          <span className="text-[11px] text-neutral-400 block mt-1">
            Navigateurs distincts
          </span>
        </div>

        <div className="bg-white p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Sessions Actives
            </span>
            <Layers className="w-4 h-4 text-neutral-500" />
          </div>
          <span className="text-3xl font-extrabold text-[#111111] font-display">
            {analytics.uniqueSessions}
          </span>
          <span className="text-[11px] text-neutral-400 block mt-1">
            Visites sans doublon par page
          </span>
        </div>

        <div className="bg-white p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Pages Consultées
            </span>
            <Eye className="w-4 h-4 text-neutral-500" />
          </div>
          <span className="text-3xl font-extrabold text-[#111111] font-display">
            {analytics.pageViews}
          </span>
          <span className="text-[11px] text-neutral-400 block mt-1">
            Volume de lectures d'articles
          </span>
        </div>

        <div className="bg-white p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Clics WhatsApp enregistrés
            </span>
            <MessageCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-3xl font-extrabold text-emerald-700 font-display">
            {analytics.whatsappClicks}
          </span>
          <span className="text-[11px] text-neutral-400 block mt-1">
            Clics suivis, selon le consentement et la disponibilité du suivi
          </span>
        </div>
      </div>

      {/* CLASSEMENT DES PRODUITS : CONSULTATIONS VS CLICS WHATSAPP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Les produits les plus consultés */}
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111]">
                Top Produits les Plus Consultés
              </h3>
              <p className="text-xs text-neutral-400">Intérêt des visiteurs sur les fiches produits</p>
            </div>
            <Eye className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-neutral-200 text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">T-shirt</th>
                  <th className="py-2.5 px-3">Catégorie</th>
                  <th className="py-2.5 px-3 text-right">Vues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {analytics.topViewedProducts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3 font-semibold text-[#111111]">
                      <span className="text-neutral-400 mr-2 font-mono">#{idx + 1}</span>
                      {p.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 uppercase text-[10px] font-bold">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-[#111111]">
                      {p.views}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Les produits générant le plus de clics WhatsApp */}
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111]">
                Top Produits Générant le Plus de Clics
              </h3>
              <p className="text-xs text-neutral-400">Taux de conversion vers la commande WhatsApp</p>
            </div>
            <MessageCircle className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-neutral-200 text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">T-shirt</th>
                  <th className="py-2.5 px-3">Prix</th>
                  <th className="py-2.5 px-3 text-right">Clics WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {analytics.topClickedProducts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3 font-semibold text-[#111111]">
                      <span className="text-neutral-400 mr-2 font-mono">#{idx + 1}</span>
                      {p.name}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 font-medium">
                      {formatFCFA(p.price)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700">
                      {p.clicks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Garantie de confidentialité & sécurité */}
      <div className="bg-white p-5 border border-neutral-200 flex items-start gap-3 text-xs text-neutral-600">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#111111] uppercase tracking-wide">
            Protection de la vie privée & Déontologie :
          </p>
          <p className="leading-relaxed">
            Des identifiants aléatoires servent à compter les visites ; les clics WhatsApp enregistrent aussi le produit et ses options. <strong>Aucun contenu de conversation ni numéro WhatsApp du client n'est capté par le site.</strong> Le suivi dépend du consentement et de la réussite de l'enregistrement.
          </p>
        </div>
      </div>

      {/* Confirmation de remise à zéro des statistiques */}
      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Réinitialiser les statistiques ?"
        message="Êtes-vous sûr de vouloir remettre tous les compteurs de statistiques à zéro ? Les visites, vues de produits et clics WhatsApp seront définitivement effacés."
        confirmText="Réinitialiser à zéro"
        onConfirm={async () => {
          try {
            await resetAnalytics();
            const refreshed = await getAnalyticsData(period);
            setAnalytics(refreshed);
            setConfirmResetOpen(false);
          } catch (err) {
            console.error('Erreur de réinitialisation des statistiques :', err);
            setDataError('Impossible de réinitialiser ou recharger les statistiques.');
          }
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
}
