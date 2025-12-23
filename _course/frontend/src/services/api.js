// API сервис для работы с подкастами
// В будущем здесь будет интеграция с Go бэкендом

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const podcastAPI = {
  // Получить все подкасты
  getAllPodcasts: async () => {
    // TODO: Заменить на реальный API вызов
    // const response = await fetch(`${API_BASE_URL}/podcasts`)
    // return response.json()
    
    // Временная заглушка
    const { mockPodcasts } = await import('../data/mockData')
    return mockPodcasts
  },

  // Получить подкаст по ID
  getPodcastById: async (id) => {
    // TODO: Заменить на реальный API вызов
    // const response = await fetch(`${API_BASE_URL}/podcasts/${id}`)
    // return response.json()
    
    // Временная заглушка
    const { mockPodcasts } = await import('../data/mockData')
    return mockPodcasts.find(p => p.id === id)
  },

  // Получить эпизоды подкаста
  getPodcastEpisodes: async (podcastId) => {
    // TODO: Заменить на реальный API вызов
    // const response = await fetch(`${API_BASE_URL}/podcasts/${podcastId}/episodes`)
    // return response.json()
    
    // Временная заглушка
    const { mockPodcasts } = await import('../data/mockData')
    const podcast = mockPodcasts.find(p => p.id === podcastId)
    return podcast?.episodes || []
  },

  // Поиск подкастов
  searchPodcasts: async (query) => {
    // TODO: Заменить на реальный API вызов
    // const response = await fetch(`${API_BASE_URL}/podcasts/search?q=${query}`)
    // return response.json()
    
    // Временная заглушка
    const { mockPodcasts } = await import('../data/mockData')
    const lowerQuery = query.toLowerCase()
    return mockPodcasts.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) ||
      p.author.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery)
    )
  },

  // Создать подкаст (для будущей реализации)
  createPodcast: async (podcastData) => {
    const response = await fetch(`${API_BASE_URL}/podcasts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(podcastData),
    })
    return response.json()
  },

  // Обновить подкаст (для будущей реализации)
  updatePodcast: async (id, podcastData) => {
    const response = await fetch(`${API_BASE_URL}/podcasts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(podcastData),
    })
    return response.json()
  },

  // Удалить подкаст (для будущей реализации)
  deletePodcast: async (id) => {
    const response = await fetch(`${API_BASE_URL}/podcasts/${id}`, {
      method: 'DELETE',
    })
    return response.json()
  },
}

