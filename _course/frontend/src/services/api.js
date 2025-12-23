const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

let authToken = null

const request = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (authToken) headers.Authorization = `Bearer ${authToken}`
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch (e) {
    data = null
  }
  if (!res.ok) {
    const error = data?.error || res.statusText
    throw new Error(error)
  }
  return data
}

export const api = {
  setToken: (token) => {
    authToken = token
  },
  // Auth
  login: async (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: async (name, email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  // Podcasts
  getAllPodcasts: async () => request('/podcasts'),
  getPodcastById: async (id) => request(`/podcasts/${id}`),
  searchPodcasts: async (query) => request(`/podcasts/search?q=${encodeURIComponent(query)}`),
  createPodcast: async (data) => request('/podcasts', { method: 'POST', body: JSON.stringify(data) }),
  updatePodcast: async (id, data) =>
    request(`/podcasts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addEpisode: async (podcastId, data) =>
    request(`/podcasts/${podcastId}/episodes`, { method: 'POST', body: JSON.stringify(data) }),
  updateEpisode: async (episodeId, data) =>
    request(`/episodes/${episodeId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEpisode: async (episodeId) =>
    request(`/episodes/${episodeId}`, { method: 'DELETE' }),
  likeEpisode: async (episodeId) =>
    request(`/episodes/${episodeId}/like`, { method: 'POST' }),
  getEpisodeLikes: async () => request('/me/episode-likes'),

  // Favorites
  getFavorites: async () => request('/me/favorites'),
  toggleFavorite: async (podcastId) =>
    request(`/podcasts/${podcastId}/favorite`, { method: 'POST' }),

  // Library
  getLibrary: async () => request('/me/library'),
  toggleLibrary: async (podcastId) =>
    request(`/podcasts/${podcastId}/library`, { method: 'POST' }),
}

