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
import MyPodcasts from './components/MyPodcasts/MyPodcasts'
import Login from './components/Login/Login'
import Register from './components/Register/Register'
import Player from './components/Player/Player'
import { api } from './services/api'
import './App.css'

const HOME_TAB = { id: 'home', title: 'Главная', type: 'home', description: 'Список всех подкастов', pinned: true }
const tabsStorageKey = (user) => (user ? `tabs_state_${user.id}` : null)

function AppContent() {
  const { user, isLoading } = useAuth()
  const [authMode, setAuthMode] = useState(null) // 'login' | 'register' | null
  const [tabs, setTabs] = useState([HOME_TAB])
  const [activeTabId, setActiveTabId] = useState('home')
  const [podcasts, setPodcasts] = useState([])
  const [favorites, setFavorites] = useState([])
  const [library, setLibrary] = useState([])
  const [likedEpisodeIds, setLikedEpisodeIds] = useState([])
  const [currentEpisode, setCurrentEpisode] = useState(null)
  const [currentPlaylist, setCurrentPlaylist] = useState([])
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [eventsSource, setEventsSource] = useState(null)

  const sortTabs = (items) => {
    const pinned = items.filter((t) => t.pinned)
    const rest = items.filter((t) => !t.pinned)
    return [...pinned, ...rest]
  }

  const ensureBaseTabs = (items) => {
    const list = items?.length ? items : [HOME_TAB]
    const hasHome = list.some((t) => t.id === 'home')
    return sortTabs(hasHome ? list : [HOME_TAB, ...list])
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [all, favs, lib, likedEps] = await Promise.all([
          api.getAllPodcasts(),
          api.getFavorites(),
          api.getLibrary(),
          api.getEpisodeLikes(),
        ])
        setPodcasts(all || [])
        setFavorites(favs || [])
        setLibrary(lib || [])
        setLikedEpisodeIds(likedEps || [])
      } catch (e) {
        console.error('Load data error', e)
      }
    }
    if (user) loadData()
  }, [user])

  // SSE события для моментального обновления (лайки эпизодов и т.п.)
  useEffect(() => {
    if (!user) {
      if (eventsSource) {
        eventsSource.close()
        setEventsSource(null)
      }
      return
    }

    const tokenData = localStorage.getItem('auth')
    let token = null
    if (tokenData) {
      try {
        token = JSON.parse(tokenData).token
      } catch {
        token = null
      }
    }
    if (!token) return

    const src = new EventSource(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/events?token=${encodeURIComponent(token)}`)
    src.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'episode_likes') {
          const { episodeId, likes } = payload.data || {}
          if (!episodeId) return
          setPodcasts((prevPods) => {
            const updatedPods = prevPods.map((p) => ({
              ...p,
              episodes: (p.episodes || []).map((ep) =>
                ep.id === episodeId ? { ...ep, likes } : ep
              ),
            }))
            // синхронизируем подкасты во вкладках, в том числе закреплённых
            setTabs((prevTabs) =>
              prevTabs.map((tab) =>
                tab.type === 'podcast'
                  ? {
                      ...tab,
                      podcast:
                        updatedPods.find((p) => p.id === tab.podcast.id) ||
                        tab.podcast,
                    }
                  : tab
              )
            )
            return updatedPods
          })
        }
      } catch {
        // игнорируем некорректные события
      }
    }
    src.onerror = () => {
      src.close()
    }
    setEventsSource(src)

    return () => {
      src.close()
      setEventsSource(null)
    }
  }, [user])

  // Load / reset tabs state per user
  useEffect(() => {
    if (!user) {
      // при логауте или до логина всегда сбрасываемся на главную
      setTabs([HOME_TAB])
      setActiveTabId('home')
      return
    }

    const key = tabsStorageKey(user)
    const savedRaw = key ? localStorage.getItem(key) : null

    const restoreAndRefresh = async () => {
      let restored = []
      let active = 'home'

      if (savedRaw) {
        try {
          const saved = JSON.parse(savedRaw)
          restored = ensureBaseTabs(saved.tabs || [])
          active =
            restored.find((t) => t.id === saved.activeTabId)?.id || restored[0].id
        } catch (e) {
          console.error('Tabs restore error', e)
          restored = ensureBaseTabs([])
          active = restored[0].id
        }
      } else {
        restored = ensureBaseTabs([])
        active = restored[0].id
      }

      // Обновляем данные подкастов для всех вкладок типа 'podcast'
      const podcastTabs = restored.filter((t) => t.type === 'podcast' && t.podcast?.id)
      if (podcastTabs.length > 0) {
        try {
          const refreshPromises = podcastTabs.map((tab) =>
            api
              .getPodcastById(tab.podcast.id)
              .then((fresh) => ({ tabId: tab.id, fresh }))
              .catch(() => ({ tabId: tab.id, fresh: null }))
          )
          const refreshed = await Promise.all(refreshPromises)
          const freshMap = new Map(
            refreshed.filter((r) => r.fresh).map((r) => [r.tabId, r.fresh])
          )

          // Обновляем вкладки с актуальными данными
          restored = restored.map((tab) =>
            tab.type === 'podcast' && freshMap.has(tab.id)
              ? { ...tab, podcast: freshMap.get(tab.id) }
              : tab
          )

          // Также обновляем глобальное состояние подкастов
          refreshed.forEach(({ fresh }) => {
            if (fresh) {
              setPodcasts((prev) =>
                prev.map((p) => (p.id === fresh.id ? fresh : p))
              )
            }
          })
        } catch (e) {
          console.error('Error refreshing podcast tabs', e)
        }
      }

      setTabs(restored)
      setActiveTabId(active)
    }

    restoreAndRefresh()
  }, [user])

  // Persist tabs per user
  useEffect(() => {
    if (!user) return
    const key = tabsStorageKey(user)
    if (!key) return
    const payload = { tabs, activeTabId }
    localStorage.setItem(key, JSON.stringify(payload))
  }, [user, tabs, activeTabId])

  const handleTabChange = async (tabId) => {
    setActiveTabId(tabId)
    
    // Обновляем данные подкаста при активации вкладки типа 'podcast'
    const tab = tabs.find((t) => t.id === tabId)
    if (tab?.type === 'podcast' && tab.podcast?.id) {
      try {
        const fresh = await api.getPodcastById(tab.podcast.id)
        if (fresh) {
          setPodcasts((prev) =>
            prev.map((p) => (p.id === fresh.id ? fresh : p))
          )
          setTabs((prevTabs) =>
            prevTabs.map((t) =>
              t.id === tabId ? { ...t, podcast: fresh } : t
            )
          )
        }
      } catch (e) {
        console.error('Error refreshing podcast on tab change', e)
      }
    }
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
      pinned: false,
    }
    setTabs(sortTabs([...tabs, newTab]))
    setActiveTabId(newTabId)
  }

  const handleCloseAllTabs = () => {
    setTabs((prev) => {
      const pinned = prev.filter((t) => t.pinned)
      const base = pinned.length > 0 ? pinned : [HOME_TAB]
      const normalized = sortTabs(base)
      setActiveTabId(normalized[0].id)
      return normalized
    })
  }

  const handlePodcastSelect = async (podcast) => {
    const tabId = `podcast-${podcast.id}`
    const existingTab = tabs.find(tab => tab.id === tabId)

    // всегда пытаемся получить свежие данные по подкасту (в т.ч. лайки эпизодов)
    let fresh = podcast
    try {
      const fromApi = await api.getPodcastById(podcast.id)
      if (fromApi) {
        fresh = fromApi
        setPodcasts((prev) =>
          prev.map((p) => (p.id === fromApi.id ? fromApi : p))
        )
      }
    } catch {
      // если запрос упал, просто используем локальные данные
    }
    
    if (existingTab) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === tabId ? { ...tab, podcast: fresh } : tab
        )
      )
      setActiveTabId(tabId)
    } else {
      const newTab = {
        id: tabId,
        title: fresh.title,
        type: 'podcast',
        podcast: fresh,
        description: fresh.description || 'Детали подкаста',
        pinned: false,
      }
      setTabs(sortTabs([...tabs, newTab]))
      setActiveTabId(tabId)
    }
  }

  const handleToggleFavorite = (podcast) => {
    api.toggleFavorite(podcast.id)
      .then(() => api.getFavorites().then(setFavorites))
      .catch((e) => console.error('favorite error', e))
  }

  const handleToggleLibrary = (podcast) => {
    api.toggleLibrary(podcast.id)
      .then(() => api.getLibrary().then(setLibrary))
      .catch((e) => console.error('library error', e))
  }

  const handleLikeEpisode = (episode) => {
    api.likeEpisode(episode.id)
      .then((res) => {
        const liked = likedEpisodeIds.includes(episode.id)
        const nextLiked = liked
          ? likedEpisodeIds.filter((id) => id !== episode.id)
          : [...likedEpisodeIds, episode.id]
        setLikedEpisodeIds(nextLiked)

        // обновить likes в текущих подкастах
        setPodcasts((prev) =>
          prev.map((p) => ({
            ...p,
            episodes: (p.episodes || []).map((ep) =>
              ep.id === episode.id ? { ...ep, likes: res.likes ?? ep.likes } : ep
            ),
          }))
        )
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.type === 'podcast'
              ? {
                  ...tab,
                  podcast: {
                    ...tab.podcast,
                    episodes: (tab.podcast.episodes || []).map((ep) =>
                      ep.id === episode.id ? { ...ep, likes: res.likes ?? ep.likes } : ep
                    ),
                  },
                }
              : tab
          )
        )
      })
      .catch((e) => console.error('like episode error', e))
  }

  const handleAddEpisode = (podcastId, episodeData) => {
    api.addEpisode(podcastId, episodeData)
      .then(() => api.getPodcastById(podcastId))
      .then((updated) => {
        if (!updated) return
        setPodcasts((prev) =>
          prev.map((p) => (p.id === podcastId ? updated : p))
        )
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.type === 'podcast' && tab.podcast.id === podcastId
              ? { ...tab, podcast: updated }
              : tab,
          ),
        )
      })
      .catch((e) => console.error('add episode error', e))
  }

  const handleUpdatePodcast = (podcastId, updatedData) => {
    api.updatePodcast(podcastId, updatedData)
      .then((updated) => {
        if (!updated) return
        setPodcasts((prev) =>
          prev.map((p) => (p.id === podcastId ? updated : p))
        )
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.type === 'podcast' && tab.podcast.id === podcastId
              ? { ...tab, podcast: updated }
              : tab,
          ),
        )
      })
      .catch((e) => console.error('update podcast error', e))
  }

  const handleUpdateEpisode = (episode, data) => {
    api.updateEpisode(episode.id, data)
      .then(() => api.getPodcastById(episode.podcastId))
      .then((updated) => {
        if (!updated) return
        setPodcasts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.type === 'podcast' && tab.podcast.id === updated.id
              ? { ...tab, podcast: updated }
              : tab
          )
        )
        if (currentEpisode && currentEpisode.id === episode.id) {
          const found = updated.episodes?.find((ep) => ep.id === episode.id)
          if (found) {
            setCurrentEpisode(found)
            setDuration(found.duration || duration)
          }
        }
      })
      .catch((e) => console.error('update episode error', e))
  }

  const handleDeleteEpisode = (episode) => {
    if (!window.confirm('Удалить эпизод?')) return
    api.deleteEpisode(episode.id)
      .then(() => api.getPodcastById(episode.podcastId))
      .then((updated) => {
        if (!updated) return
        setPodcasts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.type === 'podcast' && tab.podcast.id === updated.id
              ? { ...tab, podcast: updated }
              : tab
          )
        )
        if (currentEpisode && currentEpisode.id === episode.id) {
          setCurrentEpisode(null)
          setIsPlaying(false)
        }
      })
      .catch((e) => console.error('delete episode error', e))
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
        mypodcasts: { title: 'Мои подкасты', description: 'Подкасты, которые вы создали' },
      }
      
      const config = tabConfigs[type] || { title: type, description: '' }
      const newTab = {
        id: tabId,
        title: config.title,
        type: type,
        description: config.description,
        pinned: false,
      }
      setTabs(sortTabs([...tabs, newTab]))
      setActiveTabId(tabId)
    }
  }

  const handleReorderTabs = (sourceId, targetId) => {
    if (!targetId || sourceId === targetId) return
    setTabs((prev) => {
      const items = [...prev]
      const from = items.findIndex((t) => t.id === sourceId)
      let to = items.findIndex((t) => t.id === targetId)
      if (from === -1 || to === -1) return prev
      const [moved] = items.splice(from, 1)
      if (from < to) to -= 1
      items.splice(to, 0, moved)
      return sortTabs(items)
    })
  }

  const handlePinTab = (tabId) => {
    setTabs((prev) => {
      const updated = prev.map((t) =>
        t.id === tabId ? { ...t, pinned: !t.pinned } : t
      )
      return sortTabs(updated)
    })
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
        pinned: false,
      }
      setTabs(sortTabs([...tabs, newTab]))
      setActiveTabId(tabId)
    }
  }

  const handlePodcastCreated = (newPodcast) => {
    setPodcasts([...podcasts, newPodcast])
    const newTabs = tabs.filter(tab => tab.id !== 'create-podcast')
    const tabId = `podcast-${newPodcast.id}`
    const newTab = {
      id: tabId,
      title: newPodcast.title,
      type: 'podcast',
      podcast: newPodcast,
      description: newPodcast.description || 'Детали подкаста',
      pinned: false,
    }
    setTabs(sortTabs([...newTabs, newTab]))
    setActiveTabId(tabId)
  }

  const handleEpisodeSelect = (episode, playlist = []) => {
    const effectivePlaylist = playlist && playlist.length ? playlist : currentPlaylist
    const index = effectivePlaylist.findIndex((ep) => ep.id === episode.id)
    setCurrentPlaylist(effectivePlaylist)
    setCurrentEpisodeIndex(index >= 0 ? index : 0)
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

  const handleSeek = (time) => {
    setCurrentTime(time)
  }

  const handleLoadedMetadata = (d) => {
    setDuration(Math.round(d || 0))
  }

  const handlePrev = () => {
    if (!currentPlaylist.length) return
    const prevIndex = (currentEpisodeIndex - 1 + currentPlaylist.length) % currentPlaylist.length
    const nextEp = currentPlaylist[prevIndex]
    handleEpisodeSelect(nextEp, currentPlaylist)
  }

  const handleNext = () => {
    if (!currentPlaylist.length) return
    const nextIndex = (currentEpisodeIndex + 1) % currentPlaylist.length
    const nextEp = currentPlaylist[nextIndex]
    handleEpisodeSelect(nextEp, currentPlaylist)
  }

  const handleRateChange = (rate) => {
    setPlaybackRate(rate)
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
      case 'mypodcasts':
        return (
          <MyPodcasts
            podcasts={podcasts.filter((p) => user && p.authorId === user.id)}
            onPodcastSelect={handlePodcastSelect}
          />
        )
      case 'podcast':
        return (
          <PodcastDetails
            podcast={activeTab.podcast}
            onEpisodeSelect={(ep) => handleEpisodeSelect(ep, activeTab.podcast.episodes || [])}
            isFavorite={favorites.some((p) => p.id === activeTab.podcast.id)}
            onToggleFavorite={handleToggleFavorite}
            isInLibrary={library.some((p) => p.id === activeTab.podcast.id)}
            onToggleLibrary={handleToggleLibrary}
            onAddEpisode={handleAddEpisode}
            onUpdatePodcast={handleUpdatePodcast}
            likedEpisodeIds={likedEpisodeIds}
            onLikeEpisode={handleLikeEpisode}
            onUpdateEpisode={handleUpdateEpisode}
            onDeleteEpisode={handleDeleteEpisode}
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
        onReorder={handleReorderTabs}
        onPinToggle={handlePinTab}
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
          playbackRate={playbackRate}
          onPlayPause={handlePlayPause}
          onTimeUpdate={handleTimeUpdate}
          onSeek={handleSeek}
          onPrev={handlePrev}
          onNext={handleNext}
          onRateChange={handleRateChange}
          onLoadedMetadata={handleLoadedMetadata}
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

