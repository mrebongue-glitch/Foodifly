import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import DashboardLayout from './components/dashboard/DashboardLayout'
import Login           from './pages/dashboard/Login'
import Overview        from './pages/dashboard/Overview'
import Catalogue       from './pages/dashboard/Catalogue'
import Commandes       from './pages/dashboard/Commandes'
import MenuClient      from './pages/client/MenuClient'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard restaurant (protégé) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index                element={<Overview />} />
            <Route path="catalogue"    element={<Catalogue />} />
            <Route path="commandes"    element={<Commandes />} />
          </Route>

          {/* Mini-site client public */}
          <Route path="/menu/:restaurantId" element={<MenuClient />} />

          {/* Redirect par défaut */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
