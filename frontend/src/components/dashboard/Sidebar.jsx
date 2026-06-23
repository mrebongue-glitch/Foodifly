import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  UtensilsCrossed,
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  LogOut,
  ChefHat,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',            icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/dashboard/catalogue',  icon: BookOpen,        label: 'Catalogue'       },
  { to: '/dashboard/commandes',  icon: ShoppingBag,     label: 'Commandes'       },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-gray-900 text-white flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
            <UtensilsCrossed size={20} />
          </div>
          <span className="font-bold text-lg">FoodiFly</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
            <ChefHat size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.nom}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
