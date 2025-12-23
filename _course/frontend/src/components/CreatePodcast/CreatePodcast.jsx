import { useState } from 'react'
import { api } from '../../services/api'
import './CreatePodcast.css'

function CreatePodcast({ onPodcastCreated, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: 'Технологии',
    image: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const categories = [
    'Технологии',
    'Бизнес',
    'Наука',
    'Культура',
    'Психология',
    'Здоровье',
    'Образование',
    'Развлечения',
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const podcastData = {
        ...formData,
        episodes: [],
      }

      const newPodcast = await api.createPodcast(podcastData)
      if (onPodcastCreated) onPodcastCreated(newPodcast)
    } catch (err) {
      setError('Ошибка при создании подкаста: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="create-podcast-container">
      <div className="create-podcast-card">
        <div className="create-podcast-header">
          <h2 className="create-podcast-title">Создать подкаст</h2>
          {onCancel && (
            <button className="create-podcast-close" onClick={onCancel}>
              ×
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="create-podcast-form">
          <div className="create-podcast-field">
            <label htmlFor="title">Название подкаста *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Введите название подкаста"
            />
          </div>
          <div className="create-podcast-field">
            <label htmlFor="author">Автор *</label>
            <input
              id="author"
              name="author"
              type="text"
              value={formData.author}
              onChange={handleChange}
              required
              placeholder="Введите имя автора"
            />
          </div>
          <div className="create-podcast-field">
            <label htmlFor="category">Категория</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="create-podcast-field">
            <label htmlFor="image">Обложка (URL)</label>
            <input
              id="image"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/cover.jpg"
            />
            {formData.image && (
              <div className="create-podcast-cover-preview">
                <img src={formData.image} alt="Обложка" />
              </div>
            )}
          </div>
          <div className="create-podcast-field">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Опишите ваш подкаст..."
            />
          </div>
          {error && <div className="create-podcast-error">{error}</div>}
          <div className="create-podcast-actions">
            {onCancel && (
              <button
                type="button"
                className="create-podcast-button cancel"
                onClick={onCancel}
              >
                Отмена
              </button>
            )}
            <button
              type="submit"
              className="create-podcast-button submit"
              disabled={isLoading}
            >
              {isLoading ? 'Создание...' : 'Создать подкаст'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePodcast

