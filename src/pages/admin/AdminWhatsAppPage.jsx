import React, { useCallback, useEffect, useState } from 'react';
import { CalendarClock, MessageCircle, RefreshCw, UserRound } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatFCFA } from '../../lib/whatsapp';

const formatDate = (value) => {
  if (!value) return 'Date inconnue';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export default function AdminWhatsAppPage() {
  const { getWhatsAppClicks, analyticsRevision, dataMode } = useStore();
  const [clicks, setClicks] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 50;

  const loadClicks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getWhatsAppClicks(page, pageSize);
      setClicks(result.data);
      setClickCount(result.count);
    } catch (err) {
      console.error('Erreur de chargement des clics WhatsApp :', err);
      setClicks([]);
      setClickCount(0);
      setError('Impossible de charger les clics WhatsApp. Réessayez.');
    } finally {
      setLoading(false);
    }
  }, [getWhatsAppClicks, page]);

  useEffect(() => {
    loadClicks();
  }, [loadClicks, analyticsRevision]);

  const totalPages = Math.ceil(clickCount / pageSize);

  useEffect(() => {
    if (page > 0 && page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  if (dataMode === 'loading') {
    return <LoadingSpinner text="Synchronisation du suivi WhatsApp..." />;
  }
  if (dataMode === 'error') {
    return <div role="alert" className="bg-red-50 border border-red-200 p-4 text-sm text-red-900">Le suivi WhatsApp est indisponible ; actualisez avant de consulter les clics.</div>;
  }

  if (loading) {
    return <LoadingSpinner text="Chargement des demandes WhatsApp..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-neutral-200">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
            Suivi des demandes
          </span>
          <h2 className="text-xl font-bold font-display uppercase tracking-tight text-[#111111] mt-0.5">
            Gestion WhatsApp
          </h2>
        </div>
        <button
          type="button"
          onClick={loadClicks}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border border-neutral-300 hover:border-neutral-500"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualiser
        </button>
      </div>

      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-950">
        <MessageCircle className="w-5 h-5 shrink-0 text-emerald-700" />
        <p>
          Cette liste enregistre les clics et les détails du produit. Le nom et le numéro du client
          ne sont pas transmis au site par WhatsApp : demandez-les dans la conversation, où le
          message de commande propose déjà ces champs. Seuls les clics enregistrés avec le
          consentement requis apparaissent ici ; un clic ne confirme pas l’envoi d’un message.
          {dataMode === 'local' && ' En mode local, seuls les 500 événements les plus récents sont conservés.'}
        </p>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white border border-neutral-200">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111]">
              Clics WhatsApp récents
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {error
                ? 'Historique indisponible'
                : `${clickCount} ${clickCount > 1 ? 'clics enregistrés' : 'clic enregistré'}`}
            </p>
          </div>
          <CalendarClock className="w-4 h-4 text-neutral-400" />
        </div>

        {error ? (
          <div className="p-10 text-center text-sm text-red-700">
            Historique non disponible. Réessayez avant de conclure qu’aucun clic n’a été enregistré.
          </div>
        ) : clicks.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500">
            Aucun clic WhatsApp enregistré pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-neutral-200 text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Produit et choix</th>
                  <th className="py-3 px-4">Visiteur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {clicks.map((click) => {
                  const details = click.metadata || {};
                  return (
                    <tr key={click.id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-600">
                        {formatDate(click.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-neutral-700 block">À demander</span>
                        <span className="text-[11px] text-neutral-400">Dans WhatsApp</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#111111] block">
                          {details.productName || 'Produit non précisé'}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {[details.category, details.color, details.size && `Taille ${details.size}`]
                            .filter(Boolean)
                            .join(' • ') || 'Options non précisées'}
                          {details.quantity ? ` • Qté ${details.quantity}` : ''}
                          {details.price ? ` • ${formatFCFA(details.price)}` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-neutral-500" title={click.visitor_id}>
                          <UserRound className="w-3.5 h-3.5" />
                          {click.visitor_id ? `${click.visitor_id.slice(0, 12)}…` : 'Anonyme'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-200 p-4">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0 || loading}
              className="px-3 py-2 border border-neutral-300 text-xs font-bold uppercase disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-xs text-neutral-500">
              Page {page + 1} sur {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
              disabled={page + 1 >= totalPages || loading}
              className="px-3 py-2 border border-neutral-300 text-xs font-bold uppercase disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
