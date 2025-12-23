import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
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
  onUpdatePodcast,
  likedEpisodeIds = [],
  onLikeEpisode,
  onUpdateEpisode,
  onDeleteEpisode,
}) {
  const { user } = useAuth()
  const [newEpisode, setNewEpisode] = useState({
    title: '',
    description: '',
    date: '',
    audioUrl: '',
  })

  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({
    title: podcast.title || '',
    author: podcast.author || '',
    description: podcast.description || '',
    category: podcast.category || 'Технологии',
    image: podcast.image || '',
  })

  const handleEpisodeFieldChange = (e) => {
    const { name, value } = e.target
    setNewEpisode((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const isAuthor = user && podcast.authorId === user.id

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!onUpdatePodcast) return
    const payload = {
      title: editData.title || podcast.title,
      author: editData.author || podcast.author,
      description: editData.description,
      category: editData.category,
      image: editData.image || null,
      episodes: podcast.episodes || [],
      authorId: podcast.authorId,
      authorEmail: podcast.authorEmail,
    }
    onUpdatePodcast(podcast.id, payload)
    setEditMode(false)
  }

  const handleAddEpisodeClick = (e) => {
    e.preventDefault()
    if (!onAddEpisode || !newEpisode.title || !newEpisode.audioUrl) return

    const audio = new Audio()
    audio.src = newEpisode.audioUrl
    audio.onloadedmetadata = () => {
      const duration = Math.round(audio.duration || 0)
      onAddEpisode(podcast.id, {
        title: newEpisode.title,
        description: newEpisode.description,
        date: newEpisode.date || new Date().toISOString().slice(0, 10),
        duration,
        audioUrl: newEpisode.audioUrl,
      })
      setNewEpisode({
        title: '',
        description: '',
        date: '',
        audioUrl: '',
      })
    }
    audio.onerror = () => {
      alert('Не удалось загрузить аудио. Проверьте ссылку.')
    }
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
              // если внешний URL не загрузился, подставляем локальный плейсхолдер один раз
              if (e.target.src.endsWith('/placeholder-podcast.png')) return
              e.target.onerror = null
              e.target.src = '/placeholder-podcast.png'
            }}
          />
        </div>
        <div className="podcast-details-info">
          <span className="podcast-details-type">Подкаст</span>
          {editMode ? (
            <form className="podcast-details-edit-form" onSubmit={handleSaveEdit}>
              <div className="podcast-details-edit-grid">
                <div className="podcast-details-edit-field">
                  <label htmlFor="edit-title">Название</label>
                  <input
                    id="edit-title"
                    name="title"
                    type="text"
                    value={editData.title}
                    onChange={handleEditFieldChange}
                    required
                  />
                </div>
                <div className="podcast-details-edit-field">
                  <label htmlFor="edit-author">Автор</label>
                  <input
                    id="edit-author"
                    name="author"
                    type="text"
                    value={editData.author}
                    onChange={handleEditFieldChange}
                    required
                  />
                </div>
                <div className="podcast-details-edit-field">
                  <label htmlFor="edit-category">Категория</label>
                  <input
                    id="edit-category"
                    name="category"
                    type="text"
                    value={editData.category}
                    onChange={handleEditFieldChange}
                  />
                </div>
                <div className="podcast-details-edit-field">
                  <label htmlFor="edit-image">Ссылка на обложку</label>
                  <input
                    id="edit-image"
                    name="image"
                    type="url"
                    value={editData.image}
                    onChange={handleEditFieldChange}
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
              </div>
              <div className="podcast-details-edit-field">
                <label htmlFor="edit-description">Описание</label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={3}
                  value={editData.description}
                  onChange={handleEditFieldChange}
                  placeholder="Опишите ваш подкаст..."
                />
              </div>
              <div className="podcast-details-edit-actions">
                <button
                  type="button"
                  className="podcast-details-action-button"
                  onClick={() => {
                    setEditMode(false)
                    setEditData({
                      title: podcast.title || '',
                      author: podcast.author || '',
                      description: podcast.description || '',
                      category: podcast.category || 'Технологии',
                      image: podcast.image || '',
                    })
                  }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="podcast-details-action-button active"
                >
                  Сохранить
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="podcast-details-title">{podcast.title}</h1>
              <p className="podcast-details-author">
                {podcast.author || 'Автор не указан'}
              </p>
              {podcast.authorEmail && (
                <p className="podcast-details-author-email">{podcast.authorEmail}</p>
              )}
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
                {isAuthor && onUpdatePodcast && (
                  <button
                    type="button"
                    className="podcast-details-action-button"
                    onClick={() => setEditMode(true)}
                  >
                    ✏️ Редактировать
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="podcast-details-episodes">
        <div className="podcast-details-episodes-header">
          <h2 className="podcast-details-episodes-title">Эпизоды</h2>
        </div>
        {isAuthor && onAddEpisode && (
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
              <div className="podcast-details-add-episode-field">
                <label htmlFor="episode-audio">Ссылка на аудио *</label>
                <input
                  id="episode-audio"
                  name="audioUrl"
                  type="url"
                  value={newEpisode.audioUrl}
                  onChange={handleEpisodeFieldChange}
                  required
                  placeholder="https://example.com/audio.mp3"
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
                <div className="podcast-details-add-episode-actions">
                  <button
                    type="submit"
                    className="podcast-details-add-episode-button"
                    disabled={!newEpisode.title || !newEpisode.audioUrl}
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
          onEpisodeSelect={(ep, playlist) => onEpisodeSelect(ep, podcast.episodes || playlist)}
          onLike={onLikeEpisode}
          likedEpisodeIds={likedEpisodeIds}
          isAuthor={isAuthor}
          onEditEpisode={(ep) => onUpdateEpisode?.(ep, {
            title: prompt('Название', ep.title) || ep.title,
            description: prompt('Описание', ep.description || '') || ep.description,
            date: ep.date,
            duration: ep.duration,
            audioUrl: prompt('Ссылка на аудио', ep.audioUrl || '') || ep.audioUrl,
          })}
          onDeleteEpisode={onDeleteEpisode}
        />
      </div>
    </div>
  )
}

export default PodcastDetails

