import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('auth')
    if (saved) {
      const parsed = JSON.parse(saved)
      setUser(parsed.user)
      setToken(parsed.token)
      api.setToken(parsed.token)
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password)
      if (!res?.token) {
        return { success: false, error: res?.error || 'Ошибка входа' }
      }
      setUser(res.user)
      setToken(res.token)
      api.setToken(res.token)
      localStorage.setItem('auth', JSON.stringify({ user: res.user, token: res.token }))
      return { success: true }
    } catch (e) {
      const msg = e?.message || 'Ошибка входа'
      if (msg.toLowerCase().includes('invalid credentials')) {
        return { success: false, error: 'Неверный email или пароль' }
      }
      return { success: false, error: msg }
    }
  }

  const register = async (name, email, password) => {
    try {
      const res = await api.register(name, email, password)
      if (!res?.token) {
        return { success: false, error: res?.error || 'Ошибка регистрации' }
      }
      setUser(res.user)
      setToken(res.token)
      api.setToken(res.token)
      localStorage.setItem('auth', JSON.stringify({ user: res.user, token: res.token }))
      return { success: true }
    } catch (e) {
      const msg = e?.message || 'Ошибка регистрации'
      if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('exists')) {
        return { success: false, error: 'Пользователь с таким email уже существует' }
      }
      return { success: false, error: msg }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    api.setToken(null)
    localStorage.removeItem('auth')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

