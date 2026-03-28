import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from '../lib/sanity'

const builder = createImageUrlBuilder(client)

function urlFor(source) {
  return builder.image(source)
}

export default function DestinationCard({ destination }) {
  const title = destination?.title || ''
  const country = destination?.country || ''
  const region = destination?.region || ''
  const summary = destination?.summary || ''
  const heroImage = destination?.heroImage || null
  const heroVideoUrl = destination?.heroVideoUrl || ''
  const budgetBand = destination?.budgetBand || ''
  const vibeTags = destination?.vibeTags || []
  const suitableFor = destination?.suitableFor || []

  return (
    <article className="destination-card">
      <div className="destination-media">
        {heroVideoUrl ? (
          <video
            className="destination-video"
            src={heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : heroImage ? (
          <img
            className="destination-image"
            src={urlFor(heroImage).width(800).height(500).url()}
            alt={title}
          />
        ) : (
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