import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { client } from '../lib/sanity'
import { itineraryDraftDetailQuery } from '../lib/queries'

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

function renderArray(items) {
  if (!Array.isArray(items) || items.length === 0) return []
  return items.filter(Boolean)
}

function DayCard({ day }) {
  return (
    <article className="glass-card itinerary-day-card">
      <div className="itinerary-day-top">
        <div>
          <p className="section-kicker">Day {day.dayNumber}</p>
          <h3>{day.headline || `Day ${day.dayNumber}`}</h3>
        </div>
        <span className="profile-meta-pill">{day.overnight || 'Overnight TBC'}</span>
      </div>

      <div className="profile-detail-grid">
        <div className="profile-detail-item">
          <p className="profile-detail-label">Morning</p>
          <p className="profile-detail-value">{day.morning || '—'}</p>
        </div>
        <div className="profile-detail-item">
          <p className="profile-detail-label">Afternoon</p>
          <p className="profile-detail-value">{day.afternoon || '—'}</p>
        </div>
        <div className="profile-detail-item">
          <p className="profile-detail-label">Evening</p>
          <p className="profile-detail-value">{day.evening || '—'}</p>
        </div>
        <div className="profile-detail-item">
          <p className="profile-detail-label">Overnight</p>
          <p className="profile-detail-value">{day.overnight || '—'}</p>
        </div>
      </div>
    </article>
  )
}

function ItineraryDraftDetailPage() {
  const { id } = useParams()

  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    client
      .fetch(itineraryDraftDetailQuery, { id })
      .then((data) => {
        if (!mounted) return
        setDraft(data || null)
      })
      .catch((err) => {
        console.error('ITINERARY_DRAFT_DETAIL_FETCH_ERROR', err)
        if (!mounted) return
        setError(err.message || 'Failed to load itinerary draft')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="page page-luxury">
        <div className="glass-card profiles-empty-state">
          <p>Loading itinerary draft...</p>
        </div>
      </div>
    )
  }

  if (error || !draft) {
    return (
      <div className="page page-luxury">
        <div className="page-topbar">
          <Link to="/itinerary-drafts" className="back-link">
            ← Back to itinerary drafts
          </Link>
        </div>

        <div className="glass-card profiles-empty-state">
          <p>{error || 'Itinerary draft not found.'}</p>
        </div>
      </div>
    )
  }

  const whyThisDestination = renderArray(draft.whyThisDestination)
  const travelStyleSummary = renderArray(draft.travelStyleSummary)
  const days = Array.isArray(draft.days) ? draft.days : []

  return (
    <div className="page page-luxury">
      <div className="page-topbar">
        <Link to="/itinerary-drafts" className="back-link">
          ← Back to itinerary drafts
        </Link>
      </div>

      <header className="hero luxury-hero">
        <div className="hero-badge">LŌQÉ Itinerary Draft</div>
        <h1>{draft.title || 'Untitled Itinerary Draft'}</h1>
        <p className="subtext hero-subtext">
          Review the generated day-by-day structure before refining it into a client-facing itinerary.
        </p>
      </header>

      <section className="glass-card recommendation-hero-card">
        <div className="recommendation-hero-top">
          <div>
            <p className="section-kicker">Planner Notes</p>
            <h2>{draft.destinationTitle || 'Destination'}</h2>
            <p className="recommendation-hero-copy">
              {draft.plannerNotes || 'No planner notes available.'}
            </p>
          </div>

          <div className="recommendation-hero-meta">
            <div className="recommendation-meta-pill">
              <span>Client</span>
              <strong>{draft.clientName || '—'}</strong>
            </div>
            <div className="recommendation-meta-pill">
              <span>Trip Type</span>
              <strong>{draft.tripType || '—'}</strong>
            </div>
            <div className="recommendation-meta-pill">
              <span>Trip Length</span>
              <strong>{draft.tripLengthDays ? `${draft.tripLengthDays} days` : '—'}</strong>
            </div>
            <div className="recommendation-meta-pill">
              <span>Budget</span>
              <strong>{draft.budgetBand || '—'}</strong>
            </div>
          </div>
        </div>

        <div className="recommendation-signal-groups">
          <div className="recommendation-signal-block">
            <p className="profile-detail-label">Why this destination</p>
            <div className="destination-tag-group">
              {whyThisDestination.length > 0 ? (
                whyThisDestination.map((reason) => (
                  <span key={reason} className="destination-tag">
                    {reason}
                  </span>
                ))
              ) : (
                <span className="destination-tag">No reasons captured</span>
              )}
            </div>
          </div>

          <div className="recommendation-signal-block">
            <p className="profile-detail-label">Travel style summary</p>
            <div className="destination-tag-group">
              {travelStyleSummary.length > 0 ? (
                travelStyleSummary.map((item) => (
                  <span key={item} className="destination-tag">
                    {item}
                  </span>
                ))
              ) : (
                <span className="destination-tag">No travel style summary</span>
              )}
            </div>
          </div>

          <div className="recommendation-signal-block">
            <p className="profile-detail-label">Created</p>
            <p className="profile-detail-value">{formatDate(draft.createdAt)}</p>
          </div>
        </div>
      </section>

      <section className="section-head recommendations-head">
        <div>
          <p className="section-kicker">Day-by-Day Flow</p>
          <h2>Itinerary structure</h2>
        </div>
      </section>

      <div className="itinerary-days-stack">
        {days.length > 0 ? (
          days.map((day, index) => (
            <DayCard key={`${day.dayNumber}-${index}`} day={day} />
          ))
        ) : (
          <div className="glass-card profiles-empty-state">
            <p>No day plan available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItineraryDraftDetailPage