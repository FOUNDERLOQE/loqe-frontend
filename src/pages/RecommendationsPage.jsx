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
  }
}

function RecommendationsPage() {
  const location = useLocation()
  const routeState = location.state || {}

  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const pageTitle = routeState?.source === 'saved-profile'
    ? 'Recommendations from Saved Profile'
    : 'Recommendations'

  const pageSubtitle = routeState?.clientProfile?.fullName
    ? `Best-fit destinations for ${routeState.clientProfile.fullName}.`
    : 'Ranked destination suggestions based on the current client profile.'

  return (
    <div className="page page-luxury">
      <div className="page-topbar">
        <Link to="/" className="back-link">
          ← Back to home
        </Link>
      </div>

      <header className="hero luxury-hero">
        <div className="hero-badge">LŌQÉ Recommendations</div>
        <h1>{pageTitle}</h1>
        <p className="subtext hero-subtext">{pageSubtitle}</p>
      </header>

      <section className="glass-card recommendation-summary-card">
        <div className="section-head">
          <div>
            <p className="section-kicker">Recommendation Signals</p>
            <h2>What the engine is prioritizing</h2>
          </div>
        </div>

        <div className="profile-detail-grid">
          <div className="profile-detail-item">
            <p className="profile-detail-label">Trip Type</p>
            <p className="profile-detail-value">{signals.tripType || '—'}</p>
          </div>

          <div className="profile-detail-item">
            <p className="profile-detail-label">Budget Band</p>
            <p className="profile-detail-value">{signals.budgetBand || '—'}</p>
          </div>

          <div className="profile-detail-item">
            <p className="profile-detail-label">Preferred Tags</p>
            {signals.preferredTags.length > 0 ? (
              <div className="destination-tag-group">
                {signals.preferredTags.map((tag) => (
                  <span key={tag} className="destination-tag">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="profile-detail-value">—</p>
            )}
          </div>

          <div className="profile-detail-item">
            <p className="profile-detail-label">Avoid Tags</p>
            {signals.avoidTags.length > 0 ? (
              <div className="destination-tag-group">
                {signals.avoidTags.map((tag) => (
                  <span key={tag} className="destination-tag secondary">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="profile-detail-value">—</p>
            )}
          </div>

          <div className="profile-detail-item">
            <p className="profile-detail-label">Destination Types</p>
            {signals.destinationTypes.length > 0 ? (
              <div className="destination-tag-group">
                {signals.destinationTypes.map((tag) => (
                  <span key={tag} className="destination-tag">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="profile-detail-value">—</p>
            )}
          </div>

          <div className="profile-detail-item">
            <p className="profile-detail-label">Trip Length / Travellers</p>
            <p className="profile-detail-value">
              {signals.tripLengthDays ? `${signals.tripLengthDays} days` : '—'}
              {signals.travellerCount ? ` · ${signals.travellerCount} traveller${signals.travellerCount > 1 ? 's' : ''}` : ''}
            </p>
          </div>
        </div>
      </section>

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
              <p className="section-kicker">Top Matches</p>
              <h2>Best-fit destinations</h2>
            </div>
          </section>

          <div className="destinations-grid">
            {topDestinations.map((destination) => (
              <div key={destination._id} className="recommendation-card-wrap">
                <div className="recommendation-score-pill">
                  Score: {destination.recommendationScore}
                </div>
                <DestinationCard destination={destination} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default RecommendationsPage
