import PodcastCard from '../PodcastCard/PodcastCard'
import './Library.css'

function Library({ podcasts = [], onPodcastSelect }) {
  if (!podcasts || podcasts.length === 0) {
    return (
      <div className="library-container">
        <div className="library-header">
          <h2 className="library-title">Моя библиотека</h2>
        </div>
        <div className="library-empty">
          <p>Ваша библиотека пуста</p>
          <p className="library-empty-hint">Добавьте подкасты в библиотеку, чтобы они отображались здесь</p>
        </div>
      </div>
    )
  }

  return (
    <div className="library-container">
      <div className="library-header">
        <h2 className="library-title">Моя библиотека</h2>
        <p className="library-count">{podcasts.length} подкастов</p>
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

export default Library

