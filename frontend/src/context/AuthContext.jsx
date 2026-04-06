import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const normalizeAuthError = (err) => {
  if (err?.response?.data) {
    throw err
  }

  const message =
    err?.message ||
    err?.data?.message ||
    'Something went wrong'

  const normalizedError = {
    ...err,
    response: {
      ...(err?.response || {}),
      data: {
        success: false,
        message
      }
    }
  }

  throw normalizedError
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('cegp_token'))
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const t = localStorage.getItem('cegp_token')

    if (!t) {
      setLoading(false)
      setToken(null)
      return
    }

    try {
      setToken(t)
      const { data } = await api.get('/auth/me')
      setUser(data.user)
    } catch {
      localStorage.removeItem('cegp_token')
      setUser(null)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('cegp_token', data.token)
      setToken(data.token)
      setUser(data.user)
      return data
    } catch (err) {
      normalizeAuthError(err)
    }
  }

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      localStorage.setItem('cegp_token', data.token)
      setToken(data.token)
      setUser(data.user)
      return data
    } catch (err) {
      normalizeAuthError(err)
    }
  }

  const logout = () => {
    localStorage.removeItem('cegp_token')
    setUser(null)
    setToken(null)
  }

  const updateUser = (updated) => setUser((prev) => ({ ...prev, ...updated }))

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)