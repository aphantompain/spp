import PodcastCard from '../PodcastCard/PodcastCard'
import './Favorites.css'

function Favorites({ podcasts = [], onPodcastSelect }) {
  if (!podcasts || podcasts.length === 0) {
    return (
      <div className="favorites-container">
        <div className="favorites-header">
          <h2 className="favorites-title">Избранное</h2>
        </div>
        <div className="favorites-empty">
          <p>⭐</p>
          <p>У вас пока нет избранных подкастов</p>
          <p className="favorites-empty-hint">Добавьте подкасты в избранное, чтобы они отображались здесь</p>
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h2 className="favorites-title">Избранное</h2>
        <p className="favorites-count">{podcasts.length} подкастов</p>
      </div>
      <div className="podcast-grid">
        {podcasts.map((podcast) => (
          <PodcastCard
            key={podcast.id}
            podcast={podcast}
            onClick={() => onPodcastSelect(podcast)}
          />
        ))}
      </div>
    </div>
  )
}

export default Favorites

