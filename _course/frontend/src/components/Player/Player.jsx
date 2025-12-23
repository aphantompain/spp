import { useEffect, useRef } from 'react'
import './Player.css'

function Player({
  episode,
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  onPlayPause,
  onTimeUpdate,
  onSeek,
  onPrev,
  onNext,
  onRateChange,
  onLoadedMetadata,
}) {
  const audioRef = useRef(null)
  const progressBarRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = playbackRate || 1
  }, [playbackRate])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isPlaying, episode])

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
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    onSeek(newTime)
    audio.currentTime = newTime
  }

  const handleTimeUpdateInternal = () => {
    const audio = audioRef.current
    if (!audio) return
    onTimeUpdate(audio.currentTime)
  }

  const handleLoadedMetadataInternal = () => {
    const audio = audioRef.current
    if (!audio) return
    const d = audio.duration
    onLoadedMetadata(d)
  }

  return (
    <div className="player">
      <audio
        ref={audioRef}
        src={episode.audioUrl}
        preload="metadata"
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdateInternal}
        onLoadedMetadata={handleLoadedMetadataInternal}
        onError={() => {
          // помогает диагностировать проблемы с урлом/сеткой
          // eslint-disable-next-line no-alert
          alert('Не удалось воспроизвести аудио. Проверьте ссылку или откройте её напрямую в браузере.')
        }}
      />
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
            <button className="player-control-button" onClick={onPrev}>⏮</button>
            <button
              className="player-control-button player-play-button"
              onClick={onPlayPause}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="player-control-button" onClick={onNext}>⏭</button>
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
          <div className="player-rate">
            {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <button
                key={rate}
                className={`player-rate-button ${playbackRate === rate ? 'active' : ''}`}
                onClick={() => onRateChange(rate)}
              >
                {rate}x
              </button>
            ))}
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

