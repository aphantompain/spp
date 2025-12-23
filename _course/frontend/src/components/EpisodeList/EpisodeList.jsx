import { useState } from 'react'
import EpisodeItem from '../EpisodeItem/EpisodeItem'
import './EpisodeList.css'

function EpisodeList({
  episodes,
  onEpisodeSelect,
  onLike,
  likedEpisodeIds = [],
  isAuthor = false,
  onEditEpisode,
  onDeleteEpisode,
}) {
  const [filter, setFilter] = useState('all') // all | liked

  if (!episodes || episodes.length === 0) {
    return (
      <div className="episode-list-empty">
        <p>Эпизоды не найдены</p>
      </div>
    )
  }

  const visibleEpisodes =
    filter === 'liked'
      ? episodes.filter((ep) => likedEpisodeIds.includes(ep.id))
      : episodes

  return (
    <div className="episode-list">
      <div className="episode-list-header">
        <div className="episode-list-header-left">
          <span className="episode-list-header-number">#</span>
          <span className="episode-list-header-title">Название</span>
        </div>
        <div className="episode-list-header-right">
          <div className="episode-list-filter">
            <button
              className={`episode-list-filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Все
            </button>
            <button
              className={`episode-list-filter-button ${filter === 'liked' ? 'active' : ''}`}
              onClick={() => setFilter('liked')}
            >
              Лайкнутые
            </button>
          </div>
          <span className="episode-list-header-date">Дата</span>
          <span className="episode-list-header-duration">Длительность</span>
        </div>
      </div>
      {visibleEpisodes.map((episode, index) => (
        <EpisodeItem
          key={episode.id}
          episode={episode}
          index={index + 1}
          onClick={() => onEpisodeSelect(episode, episodes)}
          onLike={onLike}
          isLiked={likedEpisodeIds.includes(episode.id)}
          isAuthor={isAuthor}
          onEdit={onEditEpisode}
          onDelete={onDeleteEpisode}
        />
      ))}
    </div>
  )
}

export default EpisodeList

