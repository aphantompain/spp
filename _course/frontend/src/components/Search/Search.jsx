import { useState } from 'react'
import { api } from '../../services/api'
import PodcastCard from '../PodcastCard/PodcastCard'
import './Search.css'

function Search({ podcasts, onPodcastSelect }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await api.searchPodcasts(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Ошибка поиска:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value.trim()) {
      handleSearch(e)
    } else {
      setSearchResults([])
    }
  }

  return (
    <div className="search-container">
      <div className="search-header">
        <h2 className="search-title">Поиск подкастов</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Введите название подкаста, автора или описание..."
            value={searchQuery}
            onChange={handleInputChange}
          />
          <button type="submit" className="search-button" disabled={isSearching}>
            🔍
          </button>
        </form>
      </div>
      <div className="search-results">
        {searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="search-empty">Ничего не найдено</div>
        )}
        {searchResults.length > 0 && (
          <>
            <div className="search-results-header">
              <h3>Найдено: {searchResults.length}</h3>
            </div>
            <div className="podcast-grid">
              {searchResults.map((podcast) => (
                <PodcastCard
                  key={podcast.id}
                  podcast={podcast}
                  onClick={() => onPodcastSelect(podcast)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Search

