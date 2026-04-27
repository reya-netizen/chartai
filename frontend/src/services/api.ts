import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''
const api = axios.create({ baseURL: BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chartai_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('chartai_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export interface OHLCV { o: number; h: number; l: number; c: number; v: number; t: number }
export interface TickerInfo { symbol: string; price: number; change: number; changePct: number; volume: number }
export interface ChartData { symbol: string; timeframe: string; info: TickerInfo; ohlcv: OHLCV[] }
export interface Alert { id: string; userId: string; symbol: string; condition: string; price: number; status: string; createdAt: string }

export const fetchChart = (symbol: string, timeframe = '1h') =>
  api.get<ChartData>(`/api/charts/${symbol}?timeframe=${timeframe}`).then(r => r.data)

export const fetchModels = () =>
  api.get<Array<{ id: string; name: string; provider: string }>>('/api/ai/models').then(r => r.data)

export const analyzeChart = (payload: {
  ticker: string; price: number; change: number; ohlcv: OHLCV[]
  rsi: number; question: string; model: string
  conversationHistory: Array<{ role: string; content: string }>
}) => api.post<{ reply: string; model: string }>('/api/ai/analyze', payload).then(r => r.data)

export const fetchAlerts = () => api.get<Alert[]>('/api/alerts').then(r => r.data)
export const createAlert = (p: { symbol: string; condition: string; price: number }) =>
  api.post<Alert>('/api/alerts', p).then(r => r.data)
export const deleteAlert = (id: string) => api.delete(`/api/alerts/${id}`).then(r => r.data)
export const loginUser = (email: string, password: string) =>
  api.post<{ token: string; userId: string; email: string }>('/api/auth/login', { email, password }).then(r => r.data)
export const registerUser = (email: string, password: string) =>
  api.post<{ token: string; userId: string; email: string }>('/api/auth/register', { email, password }).then(r => r.data)
export const guestLogin = () =>
  api.post<{ token: string; isGuest: boolean }>('/api/auth/guest').then(r => r.data)
export const reportIssue = (title: string, body: string) =>
  api.post('/api/issues', { title, body }).then(r => r.data)
