import { useEffect, useState, useCallback } from 'react'
import { commandeApi } from '../../lib/api'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { RefreshCcw, ChevronRight } from 'lucide-react'

const STATUTS = [
  { value: '',              label: 'Toutes' },
  { value: 'en_attente',    label: 'En attente' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'pret',          label: 'Prêt' },
  { value: 'livre',         label: 'Livré' },
  { value: 'annule',        label: 'Annulé' },
]

const TRANSITIONS = {
  en_attente:    ['en_preparation', 'annule'],
  en_preparation: ['pret', 'annule'],
  pret:          ['livre'],
  livre:         [],
  annule:        [],
}

const TRANSITION_LABELS = {
  en_preparation: 'Démarrer préparation',
  pret:           'Marquer prêt',
  livre:          'Marquer livré',
  annule:         'Annuler',
}

export default function Commandes() {
  const [commandes, setCommandes]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [filtre, setFiltre]         = useState('')
  const [detail, setDetail]         = useState(null)
  const [updating, setUpdating]     = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await commandeApi.list({ statut: filtre || undefined })
      setCommandes(res.data.data ?? res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filtre])

  useEffect(() => { load() }, [load])

  // Auto-refresh 20 secondes
  useEffect(() => {
    const id = setInterval(load, 20_000)
    return () => clearInterval(id)
  }, [load])

  const handleStatut = async (id, statut) => {
    setUpdating(id)
    try {
      const res = await commandeApi.updateStatut(id, statut)
      setCommandes((prev) => prev.map((c) => (c.id === id ? res.data : c)))
      if (detail?.id === id) setDetail(res.data)
    } catch (e) { alert('Erreur mise à jour.') }
    finally { setUpdating(null) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        <Button variant="secondary" size="sm" onClick={load}>
          <RefreshCcw size={14} /> Actualiser
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUTS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFiltre(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filtre === value
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : commandes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          Aucune commande trouvée.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {commandes.map((cmd) => (
              <div
                key={cmd.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setDetail(cmd)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900">{cmd.client_nom}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      #{cmd.id} · {cmd.items?.length} article(s) · {new Date(cmd.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-orange-600">
                    {Number(cmd.total).toLocaleString('fr-FR')} FCFA
                  </span>
                  <StatusBadge statut={cmd.statut} />
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal détail */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={`Commande #${detail?.id}`}>
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{detail.client_nom}</p>
                {detail.client_telephone && (
                  <p className="text-sm text-gray-500">{detail.client_telephone}</p>
                )}
              </div>
              <StatusBadge statut={detail.statut} />
            </div>

            {/* Items */}
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 uppercase">Détail</div>
              <div className="divide-y divide-gray-50">
                {(detail.items ?? []).map((item, i) => (
                  <div key={i} className="flex justify-between px-4 py-2.5 text-sm">
                    <span className="text-gray-900">{item.plat} × {item.quantite}</span>
                    <span className="text-gray-600 font-medium">{Number(item.sous_total).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-4 py-3 bg-orange-50 font-semibold text-sm">
                <span>Total</span>
                <span className="text-orange-600">{Number(detail.total).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {detail.notes && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm text-yellow-800">
                <strong>Note :</strong> {detail.notes}
              </div>
            )}

            {/* Actions de statut */}
            {TRANSITIONS[detail.statut]?.length > 0 && (
              <div className="flex gap-2 pt-2">
                {TRANSITIONS[detail.statut].map((next) => (
                  <Button
                    key={next}
                    variant={next === 'annule' ? 'danger' : 'primary'}
                    onClick={() => handleStatut(detail.id, next)}
                    disabled={updating === detail.id}
                    className="flex-1"
                  >
                    {TRANSITION_LABELS[next]}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
