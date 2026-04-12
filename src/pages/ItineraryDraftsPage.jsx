import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { client } from '../lib/sanity'
import { itineraryDraftsQuery } from '../lib/queries'

function formatDate(value) {
  if (!value) return 'No date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No date'

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function ItineraryDraftsPage() {
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    client
      .fetch(itineraryDraftsQuery)
      .then((data) => {
        if (!mounted) return
        setDrafts(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        console.error('ITINERARY_DRAFTS_FETCH_ERROR', err)
        if (!mounted) return
        setError(err.message || 'Failed to load itinerary drafts')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="page page-luxury">
      <div className="page-topbar">
        <Link to="/" className="back-link">
          ← Back to home
        </Link>
      </div>

      <header className="hero luxury-hero">
        <div className="hero-badge">LŌQÉ Draft Studio</div>
        <h1>Saved Itinerary Drafts</h1>
        <p className="subtext hero-subtext">
          Review generated itinerary drafts and use them as the planner’s working version.
        </p>
      </header>

      {loading && (
        <div className="glass-card profiles-empty-state">
          <p>Loading itinerary drafts...</p>
        </div>
      )}

      {!loading && error && (
        <div className="glass-card profiles-empty-state">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && drafts.length === 0 && (
        <div className="glass-card profiles-empty-state">
          <p>No itinerary drafts yet.</p>
        </div>
      )}

      {!loading && !error && drafts.length > 0 && (
        <div className="profiles-grid">
          {drafts.map((draft) => (
            <Link
              key={draft._id}
              to={`/itinerary-drafts/${draft._id}`}
              className="profile-card-link"
            >
              <article className="profile-card glass-card profile-card-clickable">
                <div className="profile-card-top">
                  <div>
                    <p className="section-kicker">{draft.status || 'Draft'}</p>
                    <h3>{draft.title || 'Untitled Itinerary Draft'}</h3>
                  </div>

                  <span className="profile-date">
                    {formatDate(draft.createdAt)}
                  </span>
                </div>

                <div className="profile-meta">
                  {draft.destinationTitle && (
                    <span className="profile-meta-pill">{draft.destinationTitle}</span>
                  )}
                  {draft.tripType && (
                    <span className="profile-meta-pill">{draft.tripType}</span>
                  )}
                  {draft.budgetBand && (
                    <span className="profile-meta-pill">{draft.budgetBand}</span>
                  )}
                  {draft.tripLengthDays && (
                    <span className="profile-meta-pill">{draft.tripLengthDays} days</span>
                  )}
                  {draft.travellerCount && (
                    <span className="profile-meta-pill">
                      {draft.travellerCount} traveller{draft.travellerCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <p className="destination-summary profile-summary">
                  {draft.plannerNotes || 'No planner notes available.'}
                </p>

                <div className="profile-card-footer">
                  <span>Open draft →</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ItineraryDraftsPage
