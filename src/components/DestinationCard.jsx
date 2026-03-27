import { Link } from 'react-router-dom'
import { urlFor } from '../lib/image'

function DestinationCard({ destination }) {
  return (
    <article className="card">
      {destination.heroImage && (
        <img
          src={urlFor(destination.heroImage).width(800).height(500).url()}
          alt={destination.title}
          className="card-image"
        />
      )}

      <div className="card-body">
        <p className="meta">
          {destination.country}
          {destination.region ? ` • ${destination.region}` : ''}
        </p>

        <h3>{destination.title}</h3>

        {destination.summary && <p>{destination.summary}</p>}

        {destination.budgetBand && (
          <p>
            <strong>Budget:</strong> {destination.budgetBand}
          </p>
        )}

        {destination.vibeTags?.length > 0 && (
          <div className="tags">
            {destination.vibeTags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link to={`/destination/${destination.slug?.current}`} className="card-link">
          View destination
        </Link>
      </div>
    </article>
  )
}

export default DestinationCard