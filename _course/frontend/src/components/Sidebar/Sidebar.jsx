import './Sidebar.css'

function Sidebar({ onCreatePodcast, onNavigate, activeTabType }) {
  const handleNavClick = (e, type) => {
    e.preventDefault()
    if (onNavigate) {
      onNavigate(type)
    }
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <button
          className={`sidebar-item sidebar-button ${activeTabType === 'home' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'home')}
        >
          <span className="sidebar-icon">🏠</span>
          <span>Главная</span>
        </button>
        <button
          className={`sidebar-item sidebar-button ${activeTabType === 'search' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'search')}
        >
          <span className="sidebar-icon">🔍</span>
          <span>Поиск</span>
        </button>
        <button
          className={`sidebar-item sidebar-button ${activeTabType === 'mypodcasts' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'mypodcasts')}
        >
          <span className="sidebar-icon">🎙️</span>
          <span>Мои подкасты</span>
        </button>
        <button
          className={`sidebar-item sidebar-button ${activeTabType === 'library' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'library')}
        >
          <span className="sidebar-icon">📚</span>
          <span>Библиотека</span>
        </button>
        <button
          className={`sidebar-item sidebar-button ${activeTabType === 'favorites' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'favorites')}
        >
          <span className="sidebar-icon">⭐</span>
          <span>Избранное</span>
        </button>
        <button
          className={`sidebar-item sidebar-button ${activeTabType === 'downloads' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'downloads')}
        >
          <span className="sidebar-icon">📥</span>
          <span>Загрузки</span>
        </button>
        {onCreatePodcast && (
          <button className="sidebar-item sidebar-button" onClick={onCreatePodcast}>
            <span className="sidebar-icon">➕</span>
            <span>Создать подкаст</span>
          </button>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar

