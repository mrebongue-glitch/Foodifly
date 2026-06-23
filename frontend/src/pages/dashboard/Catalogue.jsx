import { useEffect, useState } from 'react'
import { catalogueApi } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react'

const EMPTY_FORM = { plat: '', description: '', prix: '', categorie: '', dispo: true }

function PlatForm({ initial = EMPTY_FORM, onSave, onCancel }) {
  const [form, setForm]     = useState(initial)
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.plat || !form.prix) { setError('Nom et prix requis.'); return }
    setSaving(true)
    try {
      await onSave({ ...form, prix: parseFloat(form.prix) })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de l\'enregistrement.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat *</label>
          <input value={form.plat} onChange={(e) => set('plat', e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Ex : Ndolé au poisson" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) *</label>
          <input type="number" min="0" step="50" value={form.prix} onChange={(e) => set('prix', e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="2500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <input value={form.categorie} onChange={(e) => set('categorie', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Plats principaux" />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Description du plat…" />
        </div>

        <div className="col-span-2 flex items-center gap-3">
          <input type="checkbox" id="dispo" checked={form.dispo} onChange={(e) => set('dispo', e.target.checked)}
            className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500" />
          <label htmlFor="dispo" className="text-sm text-gray-700">Disponible à la commande</label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
      </div>
    </form>
  )
}

export default function Catalogue() {
  const { user }         = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | {item}
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    try {
      const res = await catalogueApi.list({ restaurant_id: user.restaurant_id })
      setItems(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (data) => {
    if (modal === 'add') {
      await catalogueApi.create(data)
    } else {
      await catalogueApi.update(modal.id, data)
    }
    setModal(null)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce plat ?')) return
    setDeleting(id)
    try {
      await catalogueApi.delete(id)
      setItems((p) => p.filter((i) => i.id !== id))
    } catch (e) { alert('Erreur lors de la suppression.') }
    finally { setDeleting(null) }
  }

  // Grouper par catégorie
  const byCategorie = items.reduce((acc, item) => {
    const cat = item.categorie || 'Sans catégorie'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} plat(s)</p>
        </div>
        <Button onClick={() => setModal('add')}>
          <Plus size={16} /> Ajouter un plat
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">Aucun plat dans votre catalogue.</p>
          <Button className="mt-4" onClick={() => setModal('add')}>
            <Plus size={16} /> Ajouter le premier plat
          </Button>
        </div>
      ) : (
        Object.entries(byCategorie).map(([cat, plats]) => (
          <div key={cat} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{cat}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {plats.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.dispo ? 'bg-green-400' : 'bg-gray-300'}`} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900">{item.plat}</p>
                      {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm font-semibold text-orange-600">
                      {Number(item.prix).toLocaleString('fr-FR')} FCFA
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setModal(item)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} disabled={deleting === item.id}>
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Ajouter un plat' : 'Modifier le plat'}
      >
        <PlatForm
          initial={modal === 'add' ? EMPTY_FORM : {
            plat:        modal?.plat ?? '',
            description: modal?.description ?? '',
            prix:        modal?.prix ?? '',
            categorie:   modal?.categorie ?? '',
            dispo:       modal?.dispo ?? true,
          }}
          onSave={handleSave}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </div>
  )
}
