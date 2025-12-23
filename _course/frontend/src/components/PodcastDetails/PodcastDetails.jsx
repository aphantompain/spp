import { useState } from 'react'
import EpisodeList from '../EpisodeList/EpisodeList'
import './PodcastDetails.css'

function PodcastDetails({
  podcast,
  onEpisodeSelect,
  onBack,
  isFavorite,
  onToggleFavorite,
  isInLibrary,
  onToggleLibrary,
  onAddEpisode,
}) {
  const [newEpisode, setNewEpisode] = useState({
    title: '',
    description: '',
    date: '',
    durationMinutes: '',
  })

  const handleEpisodeFieldChange = (e) => {
    const { name, value } = e.target
    setNewEpisode((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddEpisodeClick = (e) => {
    e.preventDefault()
    if (!onAddEpisode || !newEpisode.title) return

    const durationMinutes = Number(newEpisode.durationMinutes || 0)
    const duration = durationMinutes * 60

    onAddEpisode(podcast.id, {
      title: newEpisode.title,
      description: newEpisode.description,
      date: newEpisode.date || new Date().toISOString().slice(0, 10),
      duration,
    })

    setNewEpisode({
      title: '',
      description: '',
      date: '',
      durationMinutes: '',
    })
  }

  return (
    <div className="podcast-details">
      <button className="podcast-details-back" onClick={onBack}>
        ← Назад
      </button>
      <div className="podcast-details-header">
        <div className="podcast-details-image-wrapper">
          <img
            src={podcast.image || '/placeholder-podcast.png'}
            alt={podcast.title}
            className="podcast-details-image"
            onError={(e) => {
              e.target.src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23333" width="300" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="30" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EПодкаст%3C/text%3E%3C/svg%3E'
            }}
          />
        </div>
        <div className="podcast-details-info">
          <span className="podcast-details-type">Подкаст</span>
          <h1 className="podcast-details-title">{podcast.title}</h1>
          <p className="podcast-details-author">{podcast.author}</p>
          <p className="podcast-details-description">{podcast.description}</p>
          <div className="podcast-details-stats">
            <span>{podcast.episodes?.length || 0} эпизодов</span>
            {podcast.category && <span>• {podcast.category}</span>}
          </div>
          <div className="podcast-details-actions">
            {onToggleFavorite && (
              <button
                className={`podcast-details-action-button ${
                  isFavorite ? 'active' : ''
                }`}
                onClick={() => onToggleFavorite(podcast)}
              >
                {isFavorite ? 'Убрать из избранного' : 'В избранное ⭐'}
              </button>
            )}
            {onToggleLibrary && (
              <button
                className={`podcast-details-action-button ${
                  isInLibrary ? 'active' : ''
                }`}
                onClick={() => onToggleLibrary(podcast)}
              >
                {isInLibrary ? 'Убрать из библиотеки' : 'В библиотеку 📚'}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="podcast-details-episodes">
        <div className="podcast-details-episodes-header">
          <h2 className="podcast-details-episodes-title">Эпизоды</h2>
        </div>
        {onAddEpisode && (
          <form className="podcast-details-add-episode" onSubmit={handleAddEpisodeClick}>
            <div className="podcast-details-add-episode-fields">
              <div className="podcast-details-add-episode-field">
                <label htmlFor="episode-title">Название эпизода *</label>
                <input
                  id="episode-title"
                  name="title"
                  type="text"
                  value={newEpisode.title}
                  onChange={handleEpisodeFieldChange}
                  placeholder="Введите название эпизода"
                  required
                />
              </div>
              <div className="podcast-details-add-episode-field">
                <label htmlFor="episode-description">Описание</label>
                <textarea
                  id="episode-description"
                  name="description"
                  rows={2}
                  value={newEpisode.description}
                  onChange={handleEpisodeFieldChange}
                  placeholder="Кратко опишите содержание эпизода"
                />
              </div>
              <div className="podcast-details-add-episode-row">
                <div className="podcast-details-add-episode-field small">
                  <label htmlFor="episode-date">Дата</label>
                  <input
                    id="episode-date"
                    name="date"
                    type="date"
                    value={newEpisode.date}
                    onChange={handleEpisodeFieldChange}
                  />
                </div>
                <div className="podcast-details-add-episode-field small">
                  <label htmlFor="episode-duration">Длительность (мин)</label>
                  <input
                    id="episode-duration"
                    name="durationMinutes"
                    type="number"
                    min="0"
                    value={newEpisode.durationMinutes}
                    onChange={handleEpisodeFieldChange}
                    placeholder="30"
                  />
                </div>
                <div className="podcast-details-add-episode-actions">
                  <button
                    type="submit"
                    className="podcast-details-add-episode-button"
                    disabled={!newEpisode.title}
                  >
                    Добавить эпизод
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
        <EpisodeList
          episodes={podcast.episodes || []}
          onEpisodeSelect={onEpisodeSelect}
        />
      </div>
    </div>
  )
}

export default PodcastDetails

