import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser  = localStorage.getItem('foodifly_user')
    const savedToken = localStorage.getItem('foodifly_token')

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, motDePasse) => {
    const { data } = await authApi.login(email, motDePasse)
    localStorage.setItem('foodifly_token', data.token)
    localStorage.setItem('foodifly_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try { await authApi.logout() } catch (_) {}
    localStorage.removeItem('foodifly_token')
    localStorage.removeItem('foodifly_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
