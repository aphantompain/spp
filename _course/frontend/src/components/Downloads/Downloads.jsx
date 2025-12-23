import { useState, useEffect } from 'react'
import PodcastCard from '../PodcastCard/PodcastCard'
import './Downloads.css'

function Downloads({ onPodcastSelect }) {
  const [downloadedPodcasts, setDownloadedPodcasts] = useState([])

  useEffect(() => {
    // Загружаем загруженные подкасты из localStorage
    const savedDownloads = localStorage.getItem('downloads')
    if (savedDownloads) {
      const parsed = JSON.parse(savedDownloads)
      setDownloadedPodcasts(parsed)
    }
  }, [])

  if (downloadedPodcasts.length === 0) {
    return (
      <div className="downloads-container">
        <div className="downloads-header">
          <h2 className="downloads-title">Загрузки</h2>
        </div>
        <div className="downloads-empty">
          <p>📥</p>
          <p>У вас пока нет загруженных подкастов</p>
          <p className="downloads-empty-hint">Загрузите подкасты для офлайн прослушивания</p>
        </div>
      </div>
    )
  }

  return (
    <div className="downloads-container">
      <div className="downloads-header">
        <h2 className="downloads-title">Загрузки</h2>
        <p className="downloads-count">{downloadedPodcasts.length} подкастов</p>
      </div>
      <div className="podcast-grid">
        {downloadedPodcasts.map((podcast) => (
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

export default Downloads

