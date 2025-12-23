import './EpisodeItem.css'

function EpisodeItem({ episode, index, onClick }) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="episode-item" onClick={onClick}>
      <span className="episode-item-number">{index}</span>
      <div className="episode-item-info">
        <h3 className="episode-item-title">{episode.title}</h3>
        {episode.description && (
          <p className="episode-item-description">{episode.description}</p>
        )}
      </div>
      <span className="episode-item-date">{formatDate(episode.date)}</span>
      <span className="episode-item-duration">
        {formatDuration(episode.duration)}
      </span>
    </div>
  )
}

export default EpisodeItem

