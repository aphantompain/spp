import { useAuth } from '../../contexts/AuthContext'
import './Header.css'

function Header({ onLoginClick }) {
  const { user, logout } = useAuth()

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">Подкасты</h1>
        </div>
        <div className="header-right">
          {user ? (
            <>
              <span className="header-user">Привет, {user.name}!</span>
              <button className="header-button" onClick={logout}>
                Выйти
              </button>
            </>
          ) : (
            <button className="header-button" onClick={onLoginClick}>
              Войти
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

