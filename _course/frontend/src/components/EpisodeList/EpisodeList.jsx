import EpisodeItem from '../EpisodeItem/EpisodeItem'
import './EpisodeList.css'

function EpisodeList({ episodes, onEpisodeSelect }) {
  if (!episodes || episodes.length === 0) {
    return (
      <div className="episode-list-empty">
        <p>Эпизоды не найдены</p>
      </div>
    )
  }

  return (
    <div className="episode-list">
      <div className="episode-list-header">
        <span className="episode-list-header-number">#</span>
        <span className="episode-list-header-title">Название</span>
        <span className="episode-list-header-date">Дата</span>
        <span className="episode-list-header-duration">Длительность</span>
      </div>
      {episodes.map((episode, index) => (
        <EpisodeItem
          key={episode.id}
          episode={episode}
          index={index + 1}
          onClick={() => onEpisodeSelect(episode)}
        />
      ))}
    </div>
  )
}

export default EpisodeList

