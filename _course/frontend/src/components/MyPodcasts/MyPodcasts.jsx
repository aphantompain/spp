import PodcastCard from '../PodcastCard/PodcastCard'
import './MyPodcasts.css'

function MyPodcasts({ podcasts = [], onPodcastSelect }) {
  const hasData = podcasts && podcasts.length > 0

  return (
    <div className="mypodcasts">
      <div className="mypodcasts-header">
        <h2 className="mypodcasts-title">Мои подкасты</h2>
        {hasData && <p className="mypodcasts-count">{podcasts.length} шт.</p>}
      </div>
      {!hasData ? (
        <div className="mypodcasts-empty">
          <p>У вас ещё нет подкастов</p>
          <p className="mypodcasts-empty-hint">Создайте первый подкаст, чтобы увидеть его здесь</p>
        </div>
      ) : (
        <div className="podcast-grid">
          {podcasts.map((podcast) => (
            <PodcastCard
              key={podcast.id}
              podcast={podcast}
              onClick={() => onPodcastSelect(podcast)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyPodcasts

