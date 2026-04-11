import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DestinationCard from '../components/DestinationCard'
import { client } from '../lib/sanity'
import { destinationsQuery } from '../lib/queries'
import { profileToSignals } from '../lib/profileToSignals'
import { scoreDestinations } from '../lib/scoreDestinations'

function buildFallbackSignals(state) {
  if (!state) {
    return {
      preferredTags: [],
      avoidTags: [],
      destinationTypes: [],
      budgetBand: '',
      tripType: '',
      tripLengthDays: null,
      travellerCount: null,
      themeWeights: {
        luxury: 0,
        romance: 0,
        wellness: 0,
        adventure: 0,
        culture: 0,
        food: 0,
        family: 0,
        nightlife: 0,
        nature: 0,
        shopping: 0,
        slowTravel: 0,
        privacy: 0,
        beach: 0,
        mountain: 0,
      },
    }
  }

  return {
    preferredTags: [],
    avoidTags: [],
    destinationTypes: [],
    budgetBand: state.budgetBand || '',
    tripType: state.tripType || '',
    tripLengthDays: state.tripLengthDays || null,
    travellerCount: state.travellerCount || null,
    themeWeights: {
      luxury: 0,
      romance: 0,
      wellness: 0,
      adventure: 0,
      culture: 0,
      food: 0,
      family: 0,
      nightlife: 0,
      nature: 0,
      shopping: 0,
      slowTravel: 0,
      privacy: 0,
      beach: 0,
      mountain: 0,
    },
  }
}

function getPlannerLens(signals) {
  const preferred = signals.preferredTags || []
  const types = signals.destinationTypes || []

  if (preferred.includes('romantic')) {
    return 'Position these as intimate, high-emotion escapes with strong privacy and atmosphere.'
  }

  if (preferred.includes('wellness')) {
    return 'Position these as restorative, slow-paced stays built around calm, space, and recovery.'
  }

  if (preferred.includes('adventure')) {
    return 'Position these as high-engagement destinations with movement, discovery, and experience density.'
  }

  if (preferred.includes('luxury')) {
    return 'Position these as premium, polished, high-service destinations with strong lifestyle appeal.'
  }

  if (types.includes('beach') || types.includes('island')) {
    return 'Position these as soft-luxury escapes with visual beauty, easy sell-through, and emotional appeal.'
  }

  if (types.includes('mountain')) {
    return 'Position these as secluded, atmospheric retreats with nature-led luxury.'
  }

  return 'Position these around fit, ease, and the strongest emotional hooks from the client profile.'
}

function getTopReasons(destination, signals) {
  const reasons = []
  const rawReasons = Array.isArray(destination?.matchReasons)
    ? destination.matchReasons
    : []

  rawReasons.forEach((reason) => {
    if (reasons.length < 3 && reason && !reasons.includes(reason)) {
      reasons.push(reason)
    }
  })

  const allTags = [...(destination?.vibeTags || []), ...(destination?.suitableFor || [])].map((tag) =>
    String(tag).toLowerCase()
  )

  if (
    reasons.length < 3 &&
    signals.budgetBand &&
    destination?.budgetBand === signals.budgetBand
  ) {
    reasons.push(`Aligned with ${signals.budgetBand} budget band`)
  }

  if (
    reasons.length < 3 &&
    (signals.tripType || '').toLowerCase().includes('honeymoon') &&
    allTags.includes('romantic')
  ) {
    reasons.push('Strong honeymoon positioning')
  }

  if (
    reasons.length < 3 &&
    (signals.tripType || '').toLowerCase().includes('family') &&
    allTags.includes('family')
  ) {
    reasons.push('Works well for family-led planning')
  }

  if (
    reasons.length < 3 &&
    (signals.tripType || '').toLowerCase().includes('wellness') &&
    allTags.includes('wellness')
  ) {
    reasons.push('Strong wellness-led fit')
  }

  if (reasons.length === 0) {
    reasons.push('Good broad fit against overall trip brief')
  }

  return reasons.slice(0, 3)
}

function getWarnings(destination, signals) {
  const warnings = []
  const rawWarnings = Array.isArray(destination?.matchWarnings)
    ? destination.matchWarnings
    : []

  rawWarnings.forEach((warning) => {
    if (warnings.length < 2 && warning && !warnings.includes(warning)) {
      warnings.push(warning)
    }
  })

  if (
    warnings.length < 2 &&
    signals.budgetBand &&
    destination?.budgetBand &&
    destination.budgetBand !== signals.budgetBand
  ) {
    warnings.push(`Budget band differs from requested ${signals.budgetBand}`)
  }

  return warnings.slice(0, 2)
}

function getPitchLine(destination, signals) {
  const allTags = [...(destination?.vibeTags || []), ...(destination?.suitableFor || [])].map((tag) =>
    String(tag).toLowerCase()
  )

  if (allTags.includes('romantic')) {
    return 'Pitch this as an emotionally strong, easy-to-desire romantic choice.'
  }

  if (allTags.includes('wellness')) {
    return 'Pitch this as a refined reset with strong calm and recovery value.'
  }

  if (allTags.includes('adventure')) {
    return 'Pitch this as an active recommendation with high experience value.'
  }

  if (allTags.includes('luxury') || allTags.includes('ultra luxury')) {
    return 'Pitch this as a polished luxury option with strong service-led appeal.'
  }

  if ((signals.destinationTypes || []).includes('beach')) {
    return 'Pitch this as a clean visual sell with soft-luxury beach energy.'
  }

  return 'Pitch this based on fit, ease, and the strongest overlapping client preferences.'
}

function getDisplayTags(destination, signals) {
  const allTags = [...(destination?.vibeTags || []), ...(destination?.suitableFor || [])]
  const cleaned = [...new Set(allTags.filter(Boolean))]

  const priority = cleaned.filter((tag) => {
    const lower = String(tag).toLowerCase()
    return (
      (signals.preferredTags || []).some((item) => lower.includes(item)) ||
      (signals.destinationTypes || []).some((item) => lower.includes(item)) ||
      lower.includes('luxury') ||
      lower.includes('romantic') ||
      lower.includes('wellness') ||
      lower.includes('beach') ||
      lower.includes('culture') ||
      lower.includes('family')
    )
  })

  return [...new Set(priority)].slice(0, 6)
}

function RecommendationsPage() {
  const location = useLocation()
  const routeState = location.state || {}

  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingSnapshot, setSavingSnapshot] = useState(false)
  const [snapshotMessage, setSnapshotMessage] = useState('')

  useEffect(() => {
    let mounted = true

    client
      .fetch(destinationsQuery)
      .then((data) => {
        if (!mounted) return
        setDestinations(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        console.error('DESTINATIONS_FETCH_ERROR', err)
        if (!mounted) return
        setError(err.message || 'Failed to load destinations')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const recommendationInput = useMemo(() => {
    if (routeState?.source === 'saved-profile' && routeState?.clientProfile) {
      return routeState.clientProfile
    }

    if (routeState?.clientProfile) {
      return routeState
    }

    return null
  }, [routeState])

  const signals = useMemo(() => {
    if (recommendationInput?.profilePayload) {
      return profileToSignals(recommendationInput)
    }

    if (recommendationInput?.clientProfile) {
      return profileToSignals(recommendationInput)
    }

    return buildFallbackSignals(routeState)
  }, [recommendationInput, routeState])

  const rankedDestinations = useMemo(() => {
    if (!Array.isArray(destinations) || destinations.length === 0) return []
    return scoreDestinations(destinations, signals)
  }, [destinations, signals])

  const topDestinations = rankedDestinations.slice(0, 6)

  const bestOverall = topDestinations[0] || null
  const bestRomantic = topDestinations.find((item) =>
    [...(item?.vibeTags || []), ...(item?.suitableFor || [])]
      .map((tag) => String(tag).toLowerCase())
      .some((tag) => tag.includes('romantic'))
  )
  const bestWellness = topDestinations.find((item) =>
    [...(item?.vibeTags || []), ...(item?.suitableFor || [])]
      .map((tag) => String(tag).toLowerCase())
      .some((tag) => tag.includes('wellness'))
  )
  const bestAdventure = topDestinations.find((item) =>
    [...(item?.vibeTags || []), ...(item?.suitableFor || [])]
      .map((tag) => String(tag).toLowerCase())
      .some((tag) => tag.includes('adventure'))
  )

  const pageTitle =
    routeState?.source === 'saved-profile'
      ? 'Curated Destination Matches'
      : 'Luxury Travel Recommendations'

  const pageSubtitle = routeState?.clientProfile?.fullName
    ? `Curated destination options for ${routeState.clientProfile.fullName}, prioritised for fit, style, and pitchability.`
    : 'Curated destination options ranked against the current trip brief.'

  async function handleSaveSnapshot() {
    try {
      const profileId =
        routeState?.clientProfile?._id ||
        recommendationInput?._id ||
        ''

      if (!profileId) {
        throw new Error('No saved client profile is attached to this recommendation session.')
      }

      if (!topDestinations.length) {
        throw new Error('No recommendations available to save.')
      }

      setSavingSnapshot(true)
      setSnapshotMessage('')

      const response = await fetch('/api/save-recommendation-snapshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          summaryTitle: `Top Recommendations - ${new Date().toLocaleDateString('en-IN')}`,
          topDestinations,
        }),
      })

      const rawText = await response.text()
      let result = {}

      try {
        result = rawText ? JSON.parse(rawText) : {}
      } catch (parseError) {
        throw new Error(
          `API did not return valid JSON. Raw response: ${rawText || 'empty response'}`
        )
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save recommendation snapshot')
      }

      setSnapshotMessage('Recommendation snapshot saved successfully.')
    } catch (err) {
      console.error('SAVE_RECOMMENDATION_SNAPSHOT_CLIENT_ERROR', err)
      setSnapshotMessage(
        `Error saving recommendations: ${err?.message || 'Unknown error'}`
      )
    } finally {
      setSavingSnapshot(false)
    }
  }

  return (
    <div className="page page-luxury">
      <div className="page-topbar">
        <Link to="/" className="back-link">
          ← Back to home
        </Link>
      </div>

      <header className="hero luxury-hero">
        <div className="hero-badge">LŌQÉ Recommendation Board</div>
        <h1>{pageTitle}</h1>
        <p className="subtext hero-subtext">{pageSubtitle}</p>
      </header>

      <section className="glass-card recommendation-hero-card">
        <div className="recommendation-hero-top">
          <div>
            <p className="section-kicker">Planner Lens</p>
            <h2>What should be prioritised</h2>
            <p className="recommendation-hero-copy">{getPlannerLens(signals)}</p>
          </div>

          <div className="recommendation-hero-meta">
            <div className="recommendation-meta-pill">
              <span>Trip Type</span>
              <strong>{signals.tripType || '—'}</strong>
            </div>
            <div className="recommendation-meta-pill">
              <span>Budget</span>
              <strong>{signals.budgetBand || '—'}</strong>
            </div>
            <div className="recommendation-meta-pill">
              <span>Trip Length</span>
              <strong>{signals.tripLengthDays ? `${signals.tripLengthDays} days` : '—'}</strong>
            </div>
            <div className="recommendation-meta-pill">
              <span>Travellers</span>
              <strong>
                {signals.travellerCount
                  ? `${signals.travellerCount} traveller${signals.travellerCount > 1 ? 's' : ''}`
                  : '—'}
              </strong>
            </div>
          </div>
        </div>

        <div className="recommendation-signal-groups">
          <div className="recommendation-signal-block">
            <p className="profile-detail-label">Priority tags</p>
            <div className="destination-tag-group">
              {(signals.preferredTags || []).length > 0 ? (
                signals.preferredTags.slice(0, 8).map((tag) => (
                  <span key={tag} className="destination-tag">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="destination-tag">No strong tags yet</span>
              )}
            </div>
          </div>

          <div className="recommendation-signal-block">
            <p className="profile-detail-label">Avoid</p>
            <div className="destination-tag-group">
              {(signals.avoidTags || []).length > 0 ? (
                signals.avoidTags.slice(0, 6).map((tag) => (
                  <span key={tag} className="destination-tag secondary">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="destination-tag">No active warnings</span>
              )}
            </div>
          </div>

          <div className="recommendation-signal-block">
            <p className="profile-detail-label">Preferred settings</p>
            <div className="destination-tag-group">
              {(signals.destinationTypes || []).length > 0 ? (
                signals.destinationTypes.slice(0, 6).map((tag) => (
                  <span key={tag} className="destination-tag">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="destination-tag">No specific setting yet</span>
              )}
            </div>
          </div>
        </div>

        <div className="recommendation-top-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleSaveSnapshot}
            disabled={savingSnapshot || topDestinations.length === 0}
          >
            {savingSnapshot ? 'Saving snapshot...' : 'Save Recommendation Snapshot'}
          </button>

          {snapshotMessage && <p className="save-message">{snapshotMessage}</p>}
        </div>
      </section>

      {!loading && !error && topDestinations.length > 0 && (
        <section className="recommendation-highlights-grid">
          <div className="glass-card recommendation-highlight-card">
            <p className="section-kicker">Best Overall Match</p>
            <h3>{bestOverall?.title || '—'}</h3>
            <p>{bestOverall ? getPitchLine(bestOverall, signals) : '—'}</p>
          </div>

          <div className="glass-card recommendation-highlight-card">
            <p className="section-kicker">Most Romantic</p>
            <h3>{bestRomantic?.title || '—'}</h3>
            <p>{bestRomantic ? getPitchLine(bestRomantic, signals) : 'No strong romantic standout yet.'}</p>
          </div>

          <div className="glass-card recommendation-highlight-card">
            <p className="section-kicker">Best Wellness Fit</p>
            <h3>{bestWellness?.title || '—'}</h3>
            <p>{bestWellness ? getPitchLine(bestWellness, signals) : 'No strong wellness-led standout yet.'}</p>
          </div>

          <div className="glass-card recommendation-highlight-card">
            <p className="section-kicker">Most Experiential</p>
            <h3>{bestAdventure?.title || '—'}</h3>
            <p>{bestAdventure ? getPitchLine(bestAdventure, signals) : 'No strong adventure standout yet.'}</p>
          </div>
        </section>
      )}

      {loading && (
        <div className="glass-card profiles-empty-state">
          <p>Loading recommendations...</p>
        </div>
      )}

      {!loading && error && (
        <div className="glass-card profiles-empty-state">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && topDestinations.length === 0 && (
        <div className="glass-card profiles-empty-state">
          <p>No destinations available right now.</p>
        </div>
      )}

      {!loading && !error && topDestinations.length > 0 && (
        <>
          <section className="section-head recommendations-head">
            <div>
              <p className="section-kicker">Curated Matches</p>
              <h2>Best-fit destinations</h2>
            </div>
          </section>

          <div className="recommendation-luxury-grid">
            {topDestinations.map((destination, index) => {
              const reasons = getTopReasons(destination, signals)
              const warnings = getWarnings(destination, signals)
              const displayTags = getDisplayTags(destination, signals)
              const pitchLine = getPitchLine(destination, signals)

              return (
                <article key={destination._id} className="glass-card recommendation-luxury-card">
                  <div className="recommendation-luxury-top">
                    <div>
                      <p className="section-kicker">Recommendation #{index + 1}</p>
                      <h3>{destination.title}</h3>
                      <p className="recommendation-location">
                        {[destination.region, destination.country].filter(Boolean).join(', ')}
                      </p>
                    </div>

                    <div className="recommendation-score-block">
                      <span>Fit Score</span>
                      <strong>{destination.recommendationScore}</strong>
                    </div>
                  </div>

                  <div className="recommendation-luxury-media">
                    <DestinationCard destination={destination} />
                  </div>

                  <div className="recommendation-luxury-sections">
                    <div className="recommendation-copy-block">
                      <p className="profile-detail-label">Why it fits</p>
                      <ul className="recommendation-bullet-list">
                        {reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="recommendation-copy-block">
                      <p className="profile-detail-label">Recommended positioning</p>
                      <p className="profile-detail-value">{pitchLine}</p>
                    </div>

                    <div className="recommendation-copy-block">
                      <p className="profile-detail-label">Watchouts</p>
                      {warnings.length > 0 ? (
                        <ul className="recommendation-bullet-list warning-list">
                          {warnings.map((warning) => (
                            <li key={warning}>{warning}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="profile-detail-value">No major warnings.</p>
                      )}
                    </div>

                    <div className="recommendation-copy-block">
                      <p className="profile-detail-label">Best-fit tags</p>
                      <div className="destination-tag-group">
                        {displayTags.length > 0 ? (
                          displayTags.map((tag) => (
                            <span key={tag} className="destination-tag">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="destination-tag">General fit</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="recommendation-actions">
                    <Link
                      to={`/destination/${destination.slug?.current || destination.slug}`}
                      className="secondary-button recommendation-action-link"
                    >
                      View Destination
                    </Link>

                    <Link
                      to="/itinerary-builder"
                      state={{
                        selectedDestination: {
                          ...destination,
                          matchReasons: reasons,
                        },
                        clientProfile: routeState?.clientProfile || recommendationInput || null,
                      }}
                      className="primary-button luxury-button recommendation-action-link"
                    >
                      Add to Itinerary
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default RecommendationsPage
