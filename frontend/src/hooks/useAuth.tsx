import { createContext, useContext, useState, ReactNode } from 'react'
import { loginUser, registerUser, guestLogin } from '../services/api'

interface AuthState {
  token: string | null
  userId: string | null
  email: string | null
  isGuest: boolean
  isLoggedIn: boolean
}

interface AuthContextType {
  token: string | null
  userId: string | null
  email: string | null
  isGuest: boolean
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  loginAsGuest: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem('chartai_token'),
    userId: localStorage.getItem('chartai_userId'),
    email: localStorage.getItem('chartai_email'),
    isGuest: localStorage.getItem('chartai_isGuest') === 'true',
    isLoggedIn: !!localStorage.getItem('chartai_token'),
  })

  const saveAuth = (token: string, userId: string, email: string | null, isGuest = false) => {
    localStorage.setItem('chartai_token', token)
    localStorage.setItem('chartai_userId', userId)
    localStorage.setItem('chartai_email', email || '')
    localStorage.setItem('chartai_isGuest', String(isGuest))
    setState({ token, userId, email, isGuest, isLoggedIn: true })
  }

  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password)
    saveAuth(data.token, data.userId, data.email)
  }

  const register = async (email: string, password: string) => {
    const data = await registerUser(email, password)
    saveAuth(data.token, data.userId, data.email)
  }

  const loginAsGuest = async () => {
    const data = await guestLogin()
    saveAuth(data.token, 'guest', null, true)
  }

  const logout = () => {
    localStorage.clear()
    setState({ token: null, userId: null, email: null, isGuest: false, isLoggedIn: false })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
