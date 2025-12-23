import { useEffect, useRef } from 'react'
import './Player.css'

function Player({
  episode,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onTimeUpdate,
}) {
  const progressBarRef = useRef(null)

  useEffect(() => {
    if (progressBarRef.current) {
      const percentage = duration > 0 ? (currentTime / duration) * 100 : 0
      progressBarRef.current.style.width = `${percentage}%`
    }
  }, [currentTime, duration])

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e) => {
    if (!progressBarRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    onTimeUpdate(newTime)
  }

  return (
    <div className="player">
      <div className="player-content">
        <div className="player-left">
          {episode.podcastImage && (
            <img
              src={episode.podcastImage}
              alt={episode.podcastTitle}
              className="player-image"
            />
          )}
          <div className="player-info">
            <h4 className="player-title">{episode.title}</h4>
            <p className="player-author">{episode.podcastTitle || 'Подкаст'}</p>
          </div>
        </div>
        <div className="player-center">
          <div className="player-controls">
            <button className="player-control-button">⏮</button>
            <button
              className="player-control-button player-play-button"
              onClick={onPlayPause}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="player-control-button">⏭</button>
          </div>
          <div className="player-progress-container" onClick={handleProgressClick}>
            <div className="player-progress-bar">
              <div className="player-progress-fill" ref={progressBarRef}></div>
            </div>
            <div className="player-time">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
        <div className="player-right">
          <button className="player-button">🔊</button>
          <button className="player-button">⋯</button>
        </div>
      </div>
    </div>
  )
}

export default Player

