import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8888/Foodifly/backend/public/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

// Injecte automatiquement le token JWT dans chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodifly_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirige vers /login si le token est expiré (401)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('foodifly_token')
      localStorage.removeItem('foodifly_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  login:  (email, mot_de_passe) => api.post('/auth/login', { email, mot_de_passe }),
  me:     ()                    => api.get('/auth/me'),
  logout: ()                    => api.post('/auth/logout'),
}

// ── Catalogue ─────────────────────────────────────────────────────
export const catalogueApi = {
  list:    (params) => api.get('/catalogue', { params }),
  get:     (id)     => api.get(`/catalogue/${id}`),
  create:  (data)   => api.post('/catalogue', data),
  update:  (id, d)  => api.put(`/catalogue/${id}`, d),
  delete:  (id)     => api.delete(`/catalogue/${id}`),
}

// ── Commandes ─────────────────────────────────────────────────────
export const commandeApi = {
  list:         (params) => api.get('/commandes', { params }),
  get:          (id)     => api.get(`/commandes/${id}`),
  create:       (data)   => api.post('/commandes', data),
  updateStatut: (id, s)  => api.patch(`/commandes/${id}/statut`, { statut: s }),
  stats:        (params) => api.get('/commandes/statistiques', { params }),
}

// ── Restaurants ───────────────────────────────────────────────────
export const restaurantApi = {
  list: () => api.get('/restaurants'),
  get:  (id) => api.get(`/restaurants/${id}`),
}

export default api
