import { createContext, useContext, useState, useEffect } from 'react'

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

  useEffect(() => {
    // Инициализируем тестового пользователя, если пользователей еще нет
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    if (users.length === 0) {
      const testUser = {
        name: 'Тестовый пользователь',
        email: 'test@test.com',
        password: 'test123'
      }
      localStorage.setItem('users', JSON.stringify([testUser]))
    }

    // Проверяем, есть ли сохраненный пользователь в localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    // В реальном приложении здесь был бы API вызов
    // Для демо используем простую проверку
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const foundUser = users.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      const userData = { email: foundUser.email, name: foundUser.name }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, error: 'Неверный email или пароль' }
  }

  const register = async (name, email, password) => {
    // В реальном приложении здесь был бы API вызов
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    // Проверяем, не существует ли уже пользователь с таким email
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Пользователь с таким email уже существует' }
    }

    const newUser = { name, email, password }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))

    const userData = { email, name }
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

