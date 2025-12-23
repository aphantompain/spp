import PodcastCard from '../PodcastCard/PodcastCard'
import './PodcastList.css'

function PodcastList({ podcasts, onPodcastSelect }) {
  return (
    <div className="podcast-list">
      <div className="podcast-list-header">
        <h2 className="podcast-list-title">Все подкасты</h2>
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

export default PodcastList

