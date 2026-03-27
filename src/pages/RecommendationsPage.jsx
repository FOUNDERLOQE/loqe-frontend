import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { sanity } from '../lib/sanity'
import { urlFor } from '../lib/image'

function scoreDestination(brief, destination) {
  let score = 0
  const reasons = []

  if (brief?.budgetBand && destination?.budgetBand === brief.budgetBand) {
    score += 3
    reasons.push(`Matches the ${brief.budgetBand} budget profile`)
  }

  const briefStyles = brief?.travelStyle || []
  const destinationVibes = destination?.vibeTags || []
  const vibeMatches = briefStyles.filter((style) =>
    destinationVibes.some((tag) => tag.toLowerCase() === style.toLowerCase())
  )

  if (vibeMatches.length) {
    score += vibeMatches.length * 2
    reasons.push(`Aligned with travel style: ${vibeMatches.join(', ')}`)
  }

  const briefClimates = brief?.preferredClimate || []
  const destinationTypes = destination?.destinationType || []
  const climateMap = {
    Tropical: ['Beach', 'Island'],
    Cold: ['Mountain', 'Snow'],
    Snow: ['Snow', 'Mountain'],
    Warm: ['Beach', 'Desert', 'Island'],
    Mild: ['City', 'Countryside', 'Cultural'],
  }

  const climateMatches = []
  briefClimates.forEach((climate) => {
    const mapped = climateMap[climate] || []
    mapped.forEach((mappedType) => {
      if (destinationTypes.includes(mappedType) && !climateMatches.includes(climate)) {
        climateMatches.push(climate)
      }
    })
  })

  if (climateMatches.length) {
    score += climateMatches.length * 2
    reasons.push(`Fits preferred climate profile: ${climateMatches.join(', ')}`)
  }

  const tripType = (brief?.tripType || '').toLowerCase()
  const suitableFor = destination?.suitableFor || []

  if (
    (tripType.includes('honeymoon') || tripType.includes('romantic')) &&
    suitableFor.includes('Couples')
  ) {
    score += 2
    reasons.push('Strong fit for couples')
  }

  if (tripType.includes('family') && suitableFor.includes('Families')) {
    score += 2
    reasons.push('Strong fit for families')
  }

  if (tripType.includes('celebration') && suitableFor.includes('Celebrations')) {
    score += 2
    reasons.push('Strong fit for celebration-led travel')
  }

  const avoidTerms = brief?.mustAvoid || []
  const searchableText = [
    destination?.title || '',
    destination?.summary || '',
    ...(destination?.vibeTags || []),
    ...(destination?.destinationType || []),
  ]
    .join(' ')
    .toLowerCase()

  avoidTerms.forEach((term) => {
    if (searchableText.includes(term.toLowerCase())) {
      score -= 2
      reasons.push(`Potential conflict with avoid term: ${term}`)
    }
  })

  return { score, reasons }
}

function RecommendationsPage() {
  const [latestBrief, setLatestBrief] = useState(null)
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [brief, destinationData] = await Promise.all([
          sanity.fetch(`
            *[_type == "tripBrief"] | order(createdAt desc)[0]{
              _id,
              title,
              clientName,
              tripType,
              originCity,
              tripLengthDays,
              travellerCount,
              budgetBand,
              preferredClimate,
              travelStyle,
              desiredExperiences,
              mustAvoid,
              notes,
              autoSummary,
              createdAt
            }
          `),
          sanity.fetch(`
            *[_type == "destination"] | order(title asc){
              _id,
              title,
              slug,
              country,
              region,
              summary,
              heroImage,
              budgetBand,
              vibeTags,
              suitableFor,
              destinationType
            }
          `),
        ])

        setLatestBrief(brief)
        setDestinations(destinationData)
        setLoading(false)
      } catch (err) {
        console.error('RECOMMENDATION LOAD ERROR:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const rankedDestinations = useMemo(() => {
    if (!latestBrief || !destinations.length) return []

    return destinations
      .map((destination) => {
        const result = scoreDestination(latestBrief, destination)
        return {
          ...destination,
          score: result.score,
          reasons: result.reasons,
        }
      })
      .sort((a, b) => b.score - a.score)
  }, [latestBrief, destinations])

  if (loading) {
    return (
      <div className="page">
        <p>Loading recommendations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <p>Error: {error}</p>
      </div>
    )
  }

  if (!latestBrief) {
    return (
      <div className="page">
        <p>No trip brief found yet.</p>
        <Link to="/client-intake" className="primary-button">
          Create client intake
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-topbar">
        <Link to="/" className="back-link">
          ← Back to home
        </Link>
      </div>

      <header className="hero">
        <p className="eyebrow">LOQE</p>
        <h1>Recommendations</h1>
        <p className="subtext">
          Using the latest saved client brief to rank destination fit.
        </p>
      </header>

      <section className="recommendation-brief">
        <div className="preview-card">
          <p className="preview-label">Latest trip brief</p>
          <h2>{latestBrief.title}</h2>
          <p className="preview-summary">
            {latestBrief.autoSummary || 'No auto summary available.'}
          </p>

          <div className="tags">
            {latestBrief.budgetBand && <span className="tag">{latestBrief.budgetBand}</span>}
            {latestBrief.tripType && <span className="tag">{latestBrief.tripType}</span>}
            {latestBrief.preferredClimate?.map((item) => (
              <span key={item} className="tag">{item}</span>
            ))}
            {latestBrief.travelStyle?.map((item) => (
              <span key={item} className="tag">{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="detail-section">
        <h2>Ranked destination matches</h2>

        <div className="grid">
          {rankedDestinations.map((destination) => (
            <article className="card recommendation-card" key={destination._id}>
              {destination.heroImage && (
                <img
                  src={urlFor(destination.heroImage).width(900).height(600).url()}
                  alt={destination.title}
                  className="card-image"
                />
              )}

              <div className="card-body">
                <div className="score-row">
                  <p className="meta">
                    {destination.country}
                    {destination.region ? ` • ${destination.region}` : ''}
                  </p>
                  <span className="score-badge">Score {destination.score}</span>
                </div>

                <h3>{destination.title}</h3>

                {destination.summary && <p>{destination.summary}</p>}

                <div className="tags">
                  {destination.budgetBand && <span className="tag">{destination.budgetBand}</span>}
                  {destination.destinationType?.map((item) => (
                    <span key={item} className="tag">{item}</span>
                  ))}
                </div>

                <div className="reason-block">
                  <p className="reason-title">Why it matched</p>
                  {destination.reasons.length ? (
                    <ul className="reason-list">
                      {destination.reasons.map((reason, index) => (
                        <li key={`${destination._id}-${index}`}>{reason}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="reason-empty">No strong explicit match found yet.</p>
                  )}
                </div>

                <Link to={`/destination/${destination.slug?.current}`} className="card-link">
                  View destination
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default RecommendationsPage