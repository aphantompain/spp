import './PodcastCard.css'

function PodcastCard({ podcast, onClick }) {
  return (
    <div className="podcast-card" onClick={onClick}>
      <div className="podcast-card-image-wrapper">
        <img
          src={podcast.image || '/placeholder-podcast.png'}
          alt={podcast.title}
          className="podcast-card-image"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23333" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EПодкаст%3C/text%3E%3C/svg%3E'
          }}
        />
        <div className="podcast-card-overlay">
          <button className="podcast-card-play-button">▶</button>
        </div>
      </div>
      <div className="podcast-card-info">
        <h3 className="podcast-card-title">{podcast.title}</h3>
        <p className="podcast-card-author">{podcast.author}</p>
      </div>
    </div>
  )
}

export default PodcastCard

