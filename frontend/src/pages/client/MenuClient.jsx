import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { catalogueApi, commandeApi, restaurantApi } from '../../lib/api'
import { ShoppingCart, Plus, Minus, X, CheckCircle, UtensilsCrossed } from 'lucide-react'

function CartItem({ item, onInc, onDec, onRemove }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-sm font-medium text-gray-900 truncate">{item.plat}</p>
        <p className="text-xs text-orange-600">{Number(item.prix_unitaire * item.quantite).toLocaleString('fr-FR')} FCFA</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onDec(item.id)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <Minus size={12} />
        </button>
        <span className="w-6 text-center text-sm font-medium">{item.quantite}</span>
        <button onClick={() => onInc(item.id)} className="w-6 h-6 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors">
          <Plus size={12} className="text-orange-600" />
        </button>
        <button onClick={() => onRemove(item.id)} className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center ml-1 transition-colors">
          <X size={12} className="text-red-500" />
        </button>
      </div>
    </div>
  )
}

export default function MenuClient() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [menu, setMenu]             = useState([])
  const [cart, setCart]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [step, setStep]             = useState('menu') // 'menu' | 'checkout' | 'success'
  const [form, setForm]             = useState({ client_nom: '', client_telephone: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [orderData, setOrderData]   = useState(null)
  const [filterCat, setFilterCat]   = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [restRes, menuRes] = await Promise.all([
          restaurantApi.get(restaurantId),
          catalogueApi.list({ restaurant_id: restaurantId, dispo_only: true }),
        ])
        setRestaurant(restRes.data)
        setMenu(menuRes.data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [restaurantId])

  const categories = [...new Set(menu.map((m) => m.categorie).filter(Boolean))]
  const filtered   = filterCat ? menu.filter((m) => m.categorie === filterCat) : menu

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id)
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, quantite: c.quantite + 1 } : c)
      return [...prev, { ...item, quantite: 1, prix_unitaire: parseFloat(item.prix) }]
    })
  }

  const incCart    = (id) => setCart((p) => p.map((c) => c.id === id ? { ...c, quantite: c.quantite + 1 } : c))
  const decCart    = (id) => setCart((p) => p.map((c) => c.id === id ? { ...c, quantite: c.quantite - 1 } : c).filter((c) => c.quantite > 0))
  const removeCart = (id) => setCart((p) => p.filter((c) => c.id !== id))

  const cartTotal = cart.reduce((s, c) => s + c.prix_unitaire * c.quantite, 0)
  const cartCount = cart.reduce((s, c) => s + c.quantite, 0)

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!form.client_nom) return
    setSubmitting(true)
    try {
      const res = await commandeApi.create({
        client_nom:       form.client_nom,
        client_telephone: form.client_telephone || undefined,
        restaurant_id:    parseInt(restaurantId),
        notes:            form.notes || undefined,
        items: cart.map((c) => ({ catalogue_id: c.id, quantite: c.quantite })),
      })
      setOrderData(res.data)
      setCart([])
      setStep('success')
    } catch (err) {
      alert(err.response?.data?.message ?? 'Erreur lors de la commande.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Commande envoyée !</h2>
          <p className="text-gray-500 text-sm mt-2">
            Commande #{orderData?.id} bien reçue. Vous serez informé de l'avancement.
          </p>
          <p className="text-orange-600 font-semibold mt-4">
            Total : {Number(orderData?.total).toLocaleString('fr-FR')} FCFA
          </p>
          <button
            onClick={() => setStep('menu')}
            className="mt-6 w-full bg-orange-500 text-white rounded-lg py-3 font-semibold hover:bg-orange-600 transition-colors"
          >
            Commander à nouveau
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header restaurant */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <UtensilsCrossed size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{restaurant?.nom}</h1>
              <p className="text-sm text-gray-500">{restaurant?.adresse}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {step === 'menu' ? (
          <>
            {/* Filtres catégories */}
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
                <button
                  onClick={() => setFilterCat('')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!filterCat ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                  Tout
                </button>
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setFilterCat(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterCat === cat ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Plats */}
            <div className="space-y-3">
              {filtered.map((item) => {
                const inCart = cart.find((c) => c.id === item.id)
                return (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{item.plat}</p>
                      {item.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>}
                      <p className="text-orange-600 font-bold mt-2">{Number(item.prix).toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    {inCart ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => decCart(item.id)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-medium">{inCart.quantite}</span>
                        <button onClick={() => incCart(item.id)} className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors">
                          <Plus size={14} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)}
                        className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors shrink-0"
                      >
                        <Plus size={14} className="text-white" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Bouton panier flottant */}
            {cart.length > 0 && (
              <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-10">
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full max-w-sm bg-orange-500 text-white rounded-xl px-6 py-4 flex items-center justify-between shadow-lg hover:bg-orange-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={20} />
                    <span className="font-semibold">{cartCount} article(s)</span>
                  </div>
                  <span className="font-bold">{cartTotal.toLocaleString('fr-FR')} FCFA →</span>
                </button>
              </div>
            )}
          </>
        ) : (
          // Checkout
          <div className="space-y-4">
            <button onClick={() => setStep('menu')} className="text-sm text-orange-600 font-medium flex items-center gap-1 hover:underline">
              ← Retour au menu
            </button>
            <h2 className="text-xl font-bold text-gray-900">Votre commande</h2>

            {/* Récap panier */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="divide-y divide-gray-50">
                {cart.map((item) => (
                  <CartItem key={item.id} item={item} onInc={incCart} onDec={decCart} onRemove={removeCart} />
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between font-bold text-orange-600">
                <span>Total</span>
                <span>{cartTotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* Formulaire client */}
            <form onSubmit={handleOrder} className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Vos informations</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom *</label>
                <input required value={form.client_nom} onChange={(e) => setForm({ ...form, client_nom: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Marie Dupont" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (optionnel)</label>
                <input value={form.client_telephone} onChange={(e) => setForm({ ...form, client_telephone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="+237 6XX XXX XXX" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarques (optionnel)</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Sans sauce, bien cuit…" />
              </div>

              <button type="submit" disabled={submitting || cart.length === 0}
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60"
              >
                {submitting ? 'Envoi en cours…' : `Commander · ${cartTotal.toLocaleString('fr-FR')} FCFA`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
