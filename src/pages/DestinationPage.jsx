import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { sanity } from '../lib/sanity'
import { urlFor } from '../lib/image'

function DestinationPage() {
  const { slug } = useParams()
  const [destination, setDestination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    sanity
      .fetch(
        `
        *[_type == "destination" && slug.current == $slug][0]{
          _id,
          title,
          slug,
          country,
          region,
          summary,
          heroImage,
          gallery,
          budgetBand,
          vibeTags,
          suitableFor,
          destinationType,
          bestMonths,
          idealTripLength,
          "experiences": *[_type == "experience" && destination._ref == ^._id] | order(title asc){
            _id,
            title,
            summary,
            heroImage,
            experienceType,
            durationType,
            intensity
          }
        }
        `,
        { slug }
      )
      .then((data) => {
        setDestination(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('SANITY ERROR:', err)
        setError(`Failed to load destination: ${err.message}`)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="page">
        <p>Loading destination...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <p>{error}</p>
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="page">
        <p>Destination not found.</p>
        <Link to="/" className="back-link">
          Back to destinations
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← Back to destinations
      </Link>

      <section className="detail-hero">
        <div className="detail-copy">
          <p className="eyebrow">Destination</p>
          <h1>{destination.title}</h1>
          <p className="subtext">
            {destination.country}
            {destination.region ? ` • ${destination.region}` : ''}
          </p>

          {destination.summary && (
            <p className="detail-summary">{destination.summary}</p>
          )}

          <div className="detail-meta">
            {destination.budgetBand && (
              <span className="tag">Budget {destination.budgetBand}</span>
            )}

            {destination.destinationType?.map((item) => (
              <span key={item} className="tag">
                {item}
              </span>
            ))}
          </div>
        </div>

        {destination.heroImage && (
          <div className="detail-image-wrap">
            <img
              src={urlFor(destination.heroImage).width(1200).height(800).url()}
              alt={destination.title}
              className="detail-image"
            />
          </div>
        )}
      </section>

      <section className="detail-section">
        <h2>Quick fit</h2>

        <div className="info-grid">
          <div className="info-card">
            <h3>Best Months</h3>
            <p>
              {destination.bestMonths?.length
                ? destination.bestMonths.join(', ')
                : 'Not added yet'}
            </p>
          </div>

          <div className="info-card">
            <h3>Ideal Trip Length</h3>
            <p>
              {destination.idealTripLength?.min && destination.idealTripLength?.max
                ? `${destination.idealTripLength.min}–${destination.idealTripLength.max} days`
                : 'Not added yet'}
            </p>
          </div>

          <div className="info-card">
            <h3>Suitable For</h3>
            <p>
              {destination.suitableFor?.length
                ? destination.suitableFor.join(', ')
                : 'Not added yet'}
            </p>
          </div>

          <div className="info-card">
            <h3>Vibe</h3>
            <p>
              {destination.vibeTags?.length
                ? destination.vibeTags.join(', ')
                : 'Not added yet'}
            </p>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <h2>Experiences</h2>

        {destination.experiences?.length ? (
          <div className="grid">
            {destination.experiences.map((experience) => (
              <article className="card" key={experience._id}>
                {experience.heroImage && (
                  <img
                    src={urlFor(experience.heroImage).width(800).height(500).url()}
                    alt={experience.title}
                    className="card-image"
                  />
                )}

                <div className="card-body">
                  <h3>{experience.title}</h3>

                  {experience.summary && <p>{experience.summary}</p>}

                  <div className="tags">
                    {experience.experienceType?.map((type) => (
                      <span key={type} className="tag">
                        {type}
                      </span>
                    ))}
                    {experience.durationType && (
                      <span className="tag">{experience.durationType}</span>
                    )}
                    {experience.intensity && (
                      <span className="tag">{experience.intensity}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>No experiences added yet for this destination.</p>
        )}
      </section>
    </div>
  )
}

export default DestinationPage