import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import Tabs from './components/Tabs/Tabs'
import PodcastList from './components/PodcastList/PodcastList'
import PodcastDetails from './components/PodcastDetails/PodcastDetails'
import CreatePodcast from './components/CreatePodcast/CreatePodcast'
import Search from './components/Search/Search'
import Library from './components/Library/Library'
import Favorites from './components/Favorites/Favorites'
import Downloads from './components/Downloads/Downloads'
import Login from './components/Login/Login'
import Register from './components/Register/Register'
import Player from './components/Player/Player'
import { mockPodcasts } from './data/mockData'
import './App.css'

const HOME_TAB = { id: 'home', title: 'Главная', type: 'home', description: 'Список всех подкастов' }

function AppContent() {
  const { user, isLoading } = useAuth()
  const [authMode, setAuthMode] = useState(null) // 'login' | 'register' | null
  const [tabs, setTabs] = useState([HOME_TAB])
  const [activeTabId, setActiveTabId] = useState('home')
  const [podcasts, setPodcasts] = useState(mockPodcasts)
  const [favorites, setFavorites] = useState([])
  const [library, setLibrary] = useState([])
  const [currentEpisode, setCurrentEpisode] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    // Загружаем подкасты из localStorage при загрузке
    const savedPodcasts = localStorage.getItem('podcasts')
    if (savedPodcasts) {
      const parsed = JSON.parse(savedPodcasts)
      setPodcasts([...mockPodcasts, ...parsed])
    }

    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      const parsedFavorites = JSON.parse(savedFavorites)
      setFavorites(parsedFavorites)
    }

    const savedLibrary = localStorage.getItem('library')
    if (savedLibrary) {
      const parsedLibrary = JSON.parse(savedLibrary)
      setLibrary(parsedLibrary)
    }
  }, [])

  const handleTabChange = (tabId) => {
    setActiveTabId(tabId)
  }

  const handleTabClose = (tabId) => {
    if (tabs.length === 1) return // Не закрываем последнюю вкладку
    
    const newTabs = tabs.filter(tab => tab.id !== tabId)
    setTabs(newTabs)
    
    if (activeTabId === tabId) {
      // Если закрыли активную вкладку, переключаемся на последнюю
      setActiveTabId(newTabs[newTabs.length - 1].id)
    }
  }

  const handleNewTab = () => {
    const newTabId = `tab-${Date.now()}`
    const newTab = {
      id: newTabId,
      title: 'Новая вкладка',
      type: 'home',
      description: 'Список всех подкастов',
    }
    setTabs([...tabs, newTab])
    setActiveTabId(newTabId)
  }

  const handleCloseAllTabs = () => {
    setTabs([HOME_TAB])
    setActiveTabId('home')
  }

  const handlePodcastSelect = (podcast) => {
    const tabId = `podcast-${podcast.id}`
    const existingTab = tabs.find(tab => tab.id === tabId)
    
    if (existingTab) {
      setActiveTabId(tabId)
    } else {
      const newTab = {
        id: tabId,
        title: podcast.title,
        type: 'podcast',
        podcast: podcast,
        description: podcast.description || 'Детали подкаста',
      }
      setTabs([...tabs, newTab])
      setActiveTabId(tabId)
    }
  }

  const handleToggleFavorite = (podcast) => {
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === podcast.id)
      const updated = exists
        ? prev.filter((p) => p.id !== podcast.id)
        : [...prev, podcast]

      localStorage.setItem('favorites', JSON.stringify(updated))
      return updated
    })
  }

  const handleToggleLibrary = (podcast) => {
    setLibrary((prev) => {
      const exists = prev.some((p) => p.id === podcast.id)
      const updated = exists
        ? prev.filter((p) => p.id !== podcast.id)
        : [...prev, podcast]

      localStorage.setItem('library', JSON.stringify(updated))
      return updated
    })
  }

  const handleAddEpisode = (podcastId, episodeData) => {
    // Обновляем список подкастов в состоянии
    const updatedPodcasts = podcasts.map((p) => {
      if (p.id !== podcastId) return p

      const newEpisode = {
        id: Date.now(),
        ...episodeData,
        podcastTitle: p.title,
        podcastImage: p.image || null,
      }

      return {
        ...p,
        episodes: [...(p.episodes || []), newEpisode],
      }
    })

    setPodcasts(updatedPodcasts)

    // Обновляем подкаст в localStorage (только для созданных подкастов)
    try {
      const saved = JSON.parse(localStorage.getItem('podcasts') || '[]')
      const updatedSaved = saved.map((p) => {
        if (p.id !== podcastId) return p
        const newEpisode = {
          id: Date.now(),
          ...episodeData,
          podcastTitle: p.title,
          podcastImage: p.image || null,
        }
        return {
          ...p,
          episodes: [...(p.episodes || []), newEpisode],
        }
      })
      localStorage.setItem('podcasts', JSON.stringify(updatedSaved))
    } catch {
      // игнорируем ошибки работы с localStorage
    }

    // Обновляем подкаст во всех открытых вкладках с этим подкастом
    const updatedPodcast = updatedPodcasts.find((p) => p.id === podcastId)
    if (updatedPodcast) {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.type === 'podcast' && tab.podcast.id === podcastId
            ? { ...tab, podcast: updatedPodcast }
            : tab,
        ),
      )
    }
  }

  const handleNavigate = (type) => {
    const tabId = type
    const existingTab = tabs.find(tab => tab.id === tabId)
    
    if (existingTab) {
      setActiveTabId(tabId)
    } else {
      const tabConfigs = {
        home: { title: 'Главная', description: 'Список всех подкастов' },
        search: { title: 'Поиск', description: 'Поиск подкастов' },
        library: { title: 'Библиотека', description: 'Моя библиотека подкастов' },
        favorites: { title: 'Избранное', description: 'Избранные подкасты' },
        downloads: { title: 'Загрузки', description: 'Загруженные подкасты' },
      }
      
      const config = tabConfigs[type] || { title: type, description: '' }
      const newTab = {
        id: tabId,
        title: config.title,
        type: type,
        description: config.description,
      }
      setTabs([...tabs, newTab])
      setActiveTabId(tabId)
    }
  }

  const handleCreatePodcastClick = () => {
    const tabId = 'create-podcast'
    const existingTab = tabs.find(tab => tab.id === tabId)
    
    if (existingTab) {
      setActiveTabId(tabId)
    } else {
      const newTab = {
        id: tabId,
        title: 'Создать подкаст',
        type: 'create',
        description: 'Форма создания нового подкаста',
      }
      setTabs([...tabs, newTab])
      setActiveTabId(tabId)
    }
  }

  const handlePodcastCreated = (newPodcast) => {
    setPodcasts([...podcasts, newPodcast])
    // Закрываем вкладку создания и открываем новый подкаст
    const newTabs = tabs.filter(tab => tab.id !== 'create-podcast')
    const tabId = `podcast-${newPodcast.id}`
    const newTab = {
      id: tabId,
      title: newPodcast.title,
      type: 'podcast',
      podcast: newPodcast,
      description: newPodcast.description || 'Детали подкаста',
    }
    setTabs([...newTabs, newTab])
    setActiveTabId(tabId)
  }

  const handleEpisodeSelect = (episode) => {
    setCurrentEpisode(episode)
    setIsPlaying(true)
    setCurrentTime(0)
    setDuration(episode.duration || 0)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = (time) => {
    setCurrentTime(time)
  }

  const getActiveTabContent = () => {
    const activeTab = tabs.find(tab => tab.id === activeTabId)
    if (!activeTab) return null

    switch (activeTab.type) {
      case 'home':
        return (
          <PodcastList
            podcasts={podcasts}
            onPodcastSelect={handlePodcastSelect}
          />
        )
      case 'search':
        return (
          <Search
            podcasts={podcasts}
            onPodcastSelect={handlePodcastSelect}
          />
        )
      case 'library':
        return (
          <Library
            podcasts={library}
            onPodcastSelect={handlePodcastSelect}
          />
        )
      case 'favorites':
        return (
          <Favorites
            podcasts={favorites}
            onPodcastSelect={handlePodcastSelect}
          />
        )
      case 'downloads':
        return (
          <Downloads
            onPodcastSelect={handlePodcastSelect}
          />
        )
      case 'podcast':
        return (
          <PodcastDetails
            podcast={activeTab.podcast}
            onEpisodeSelect={handleEpisodeSelect}
            isFavorite={favorites.some((p) => p.id === activeTab.podcast.id)}
            onToggleFavorite={handleToggleFavorite}
            isInLibrary={library.some((p) => p.id === activeTab.podcast.id)}
            onToggleLibrary={handleToggleLibrary}
            onAddEpisode={handleAddEpisode}
            onBack={() => {
              // Можно вернуться к списку, закрыв вкладку или переключившись
              const homeTab = tabs.find(t => t.type === 'home')
              if (homeTab) {
                setActiveTabId(homeTab.id)
              }
            }}
          />
        )
      case 'create':
        return (
          <CreatePodcast
            onPodcastCreated={handlePodcastCreated}
            onCancel={() => {
              handleTabClose('create-podcast')
            }}
          />
        )
      default:
        return null
    }
  }

  const activeTab = tabs.find(tab => tab.id === activeTabId)
  const activeTabType = activeTab?.type || 'home'

  // Показываем форму авторизации, если пользователь не авторизован
  if (isLoading) {
    return <div className="app-loading">Загрузка...</div>
  }

  if (!user) {
    return (
      <div className="app">
        {authMode === 'register' ? (
          <Register onSwitchToLogin={() => setAuthMode('login')} />
        ) : (
          <Login onSwitchToRegister={() => setAuthMode('register')} />
        )}
      </div>
    )
  }

  return (
    <div className="app">
      <Header onLoginClick={() => setAuthMode('login')} />
      <Tabs
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={handleTabChange}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
        onCloseAll={handleCloseAllTabs}
      />
      <div className="app-content">
        <Sidebar
          onCreatePodcast={handleCreatePodcastClick}
          onNavigate={handleNavigate}
          activeTabType={activeTabType}
        />
        <div className="main-content">
          {getActiveTabContent()}
        </div>
      </div>
      {currentEpisode && (
        <Player
          episode={currentEpisode}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={handlePlayPause}
          onTimeUpdate={handleTimeUpdate}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

