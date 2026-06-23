import { useEffect, useState } from 'react'
import { commandeApi } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ShoppingBag, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { StatusBadge } from '../../components/ui/Badge'

function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function Overview() {
  const { user }       = useAuth()
  const [stats, setStats] = useState(null)
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, cmdRes] = await Promise.all([
          commandeApi.stats(),
          commandeApi.list({ statut: 'en_attente' }),
        ])
        setStats(statsRes.data)
        setCommandes(cmdRes.data.data ?? [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
    // Rafraîchissement toutes les 30 secondes
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const today = stats?.aujourd_hui

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Bonjour, {user?.nom} 👋</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Commandes aujourd'hui" value={today?.total_commandes ?? 0} icon={ShoppingBag}   color="bg-orange-500" />
        <StatCard title="En attente"             value={today?.en_attente ?? 0}     icon={Clock}         color="bg-yellow-500" />
        <StatCard title="Livrées"                value={today?.livrees ?? 0}         icon={CheckCircle}   color="bg-green-500"  />
        <StatCard
          title="Chiffre d'affaires"
          value={`${(today?.chiffre_affaires ?? 0).toLocaleString('fr-FR')} FCFA`}
          icon={TrendingUp}
          color="bg-blue-500"
          sub="commandes livrées/prêtes"
        />
      </div>

      {/* Graph */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Évolution sur 7 jours</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats?.evolution ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
            <Tooltip
              formatter={(v, name) => [v, name === 'commandes' ? 'Commandes' : 'CA (FCFA)']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
            />
            <Bar dataKey="commandes" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Commandes en attente */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <h2 className="text-base font-semibold text-gray-900">Commandes en attente</h2>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {commandes.length}
          </span>
        </div>
        {commandes.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Aucune commande en attente</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {commandes.slice(0, 5).map((cmd) => (
              <div key={cmd.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="font-medium text-sm text-gray-900">{cmd.client_nom}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {cmd.items?.length} article(s) · {Number(cmd.total).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <StatusBadge statut={cmd.statut} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
