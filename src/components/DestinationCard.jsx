import { useRef } from 'react'
import { urlFor } from '../lib/image'

export default function DestinationCard({ destination }) {
  const videoRef = useRef(null)

  const title = destination?.title || ''
  const country = destination?.country || ''
  const region = destination?.region || ''
  const summary = destination?.summary || ''
  const heroImage = destination?.heroImage || null
  const heroVideoUrl = destination?.heroVideoUrl || ''
  const budgetBand = destination?.budgetBand || ''
  const vibeTags = Array.isArray(destination?.vibeTags) ? destination.vibeTags : []
  const suitableFor = Array.isArray(destination?.suitableFor) ? destination.suitableFor : []

  let imageUrl = ''
  try {
    imageUrl = heroImage ? urlFor(heroImage).width(800).height(500).url() : ''
  } catch (error) {
    console.error('Invalid heroImage for destination:', title, heroImage, error)
  }

  function handleMouseEnter() {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }

  function handleMouseLeave() {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <article
      className="destination-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="destination-media">
        {imageUrl && (
          <img
            className={`destination-image ${heroVideoUrl ? 'with-video' : ''}`}
            src={imageUrl}
            alt={title}
          />
        )}

        {heroVideoUrl && (
          <video
            ref={videoRef}
            className="destination-video hover-video"
            src={heroVideoUrl}
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}

        {!imageUrl && !heroVideoUrl && (
          <div className="destination-image-placeholder" />
        )}
      </div>

      <div className="destination-card-body">
        <div className="destination-card-top">
          <div>
            <h3>{title}</h3>
            <p className="destination-location">
              {[region, country].filter(Boolean).join(', ')}
            </p>
          </div>

          {budgetBand && (
            <span className="destination-budget">{budgetBand}</span>
          )}
        </div>

        {summary && <p className="destination-summary">{summary}</p>}

        {vibeTags.length > 0 && (
          <div className="destination-tag-group">
            {vibeTags.map((tag) => (
              <span key={tag} className="destination-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {suitableFor.length > 0 && (
          <div className="destination-tag-group secondary-tags">
            {suitableFor.map((tag) => (
              <span key={tag} className="destination-tag secondary">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}