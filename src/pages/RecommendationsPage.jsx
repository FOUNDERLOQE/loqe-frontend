import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sanity } from '../lib/sanity'
import { profileToSignals } from '../profileToSignals'
import { scoreDestinations } from '../scoreDestinations'

function RecommendationsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileDoc, setProfileDoc] = useState(null)
  const [signals, setSignals] = useState(null)
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true)
        setError('')

        const latestProfiles = await sanity.fetch(`
          *[_type == "clientTravelPersonality"] | order(submittedAt desc)[0...1]{
            _id,
            title,
            clientName,
            tripType,
            originCity,
            tripLengthDays,
            travellerCount,
            budgetBand,
            notes,
            autoSummary,
            clientProfileSnapshot,
            status,
            submittedAt
          }
        `)

        if (!latestProfiles || latestProfiles.length === 0) {
          throw new Error('No saved client travel personality found yet.')
        }

        const latestProfile = latestProfiles[0]

        let parsedClientProfile = {}
        try {
          parsedClientProfile = latestProfile.clientProfileSnapshot
            ? JSON.parse(latestProfile.clientProfileSnapshot)
            : {}
        } catch (parseError) {
          console.error('CLIENT_PROFILE_SNAPSHOT_PARSE_ERROR', parseError)
          parsedClientProfile = {}
        }

        const payload = {
          clientName: latestProfile.clientName || '',
          tripType: latestProfile.tripType || '',
          originCity: latestProfile.originCity || '',
          tripLengthDays: latestProfile.tripLengthDays || null,
          travellerCount: latestProfile.travellerCount || null,
          budgetBand: latestProfile.budgetBand || '',
          notes: latestProfile.notes || '',
          autoSummary: latestProfile.autoSummary || '',
          clientProfile: parsedClientProfile,
        }

        const derivedSignals = profileToSignals(payload)

        const destinations = await sanity.fetch(`
          *[_type == "destination"] | order(title asc){
            _id,
            title,
            "slug": slug.current,
            country,
            region,
            summary,
            heroImage,
            "heroVideoUrl": heroVideo.asset->url,
            budgetBand,
            vibeTags,
            suitableFor,
            destinationTypes,
            bestTripTypes,
            climateTags,
            paceTags,
            experienceTags,
            idealTripLength,
            travelLogistics
          }
        `)

        const ranked = scoreDestinations(destinations, derivedSignals)

        setProfileDoc(latestProfile)
        setSignals(derivedSignals)
        setRecommendations(ranked)
      } catch (err) {
        console.error('RECOMMENDATIONS_PAGE_ERROR', err)
        setError(err?.message || 'Failed to load recommendations')
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [])

  if (loading) {
    return (
      <div className="page page-luxury">
        <div className="page-topbar">
          <Link to="/" className="back-link">
            ← Back to home
          </Link>
        </div>

        <div className="glass-card">
          <p>Loading recommendations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page page-luxury">
        <div className="page-topbar">
          <Link to="/" className="back-link">
            ← Back to home
          </Link>
        </div>

        <div className="glass-card">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const topRecommendations = recommendations.slice(0, 6)

  return (
    <div className="page page-luxury">
      <div className="page-topbar">
        <Link to="/" className="back-link">
          ← Back to home
        </Link>
      </div>

      <header className="hero luxury-hero">
        <div className="hero-badge">LŌQÉ Recommendation Engine</div>
        <h1>Recommendations matched to the latest client profile</h1>
        <p className="subtext hero-subtext">
          Structured signals extracted from the latest saved client travel personality,
          then scored against your destination library.
        </p>
      </header>

      {profileDoc && (
        <section className="glass-card" style={{ marginBottom: '24px' }}>
          <p className="preview-label">Latest saved client</p>
          <h2>{profileDoc.title || 'Untitled Travel Brief'}</h2>
          <p className="preview-summary">{profileDoc.autoSummary || 'No summary available.'}</p>

          <div className="preview-divider" />

          <div className="field-stack">
            <p><strong>Client:</strong> {profileDoc.clientName || '—'}</p>
            <p><strong>Trip type:</strong> {profileDoc.tripType || '—'}</p>
            <p><strong>Budget band:</strong> {profileDoc.budgetBand || '—'}</p>
            <p><strong>Origin city:</strong> {profileDoc.originCity || '—'}</p>
            <p><strong>Trip length:</strong> {profileDoc.tripLengthDays || '—'} days</p>
            <p><strong>Travellers:</strong> {profileDoc.travellerCount || '—'}</p>
          </div>
        </section>
      )}

      {signals && (
        <section className="glass-card" style={{ marginBottom: '24px' }}>
          <p className="preview-label">Derived travel signals</p>
          <h2>Matching logic snapshot</h2>

          <div className="field-stack">
            <p>
              <strong>Preferred tags:</strong>{' '}
              {signals.preferredTags?.length ? signals.preferredTags.join(', ') : '—'}
            </p>
            <p>
              <strong>Avoid tags:</strong>{' '}
              {signals.avoidTags?.length ? signals.avoidTags.join(', ') : '—'}
            </p>
            <p>
              <strong>Destination types:</strong>{' '}
              {signals.destinationTypes?.length ? signals.destinationTypes.join(', ') : '—'}
            </p>
            <p>
              <strong>Travel style summary:</strong>{' '}
              {signals.travelStyleSummary?.length ? signals.travelStyleSummary.join(', ') : '—'}
            </p>
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">Top Recommendations</h2>

        <div className="field-stack">
          {topRecommendations.map((destination, index) => (
            <article
              key={destination._id}
              className="glass-card"
              style={{ marginBottom: '20px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '16px',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <p className="preview-label">Recommendation #{index + 1}</p>
                  <h3 style={{ marginBottom: '8px' }}>{destination.title}</h3>
                  <p className="destination-location">
                    {[destination.region, destination.country].filter(Boolean).join(', ')}
                  </p>
                </div>

                <div>
                  <p className="preview-label">Score</p>
                  <h3>{destination.recommendationScore}</h3>
                </div>
              </div>

              {destination.summary && (
                <p style={{ marginTop: '12px' }}>{destination.summary}</p>
              )}

              <div className="preview-divider" />

              <div style={{ marginBottom: '12px' }}>
                <p className="preview-label">Top match reasons</p>
                {destination.matchReasons?.length ? (
                  <ul>
                    {destination.matchReasons.slice(0, 3).map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No specific match reasons found.</p>
                )}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <p className="preview-label">Match warnings</p>
                {destination.matchWarnings?.length ? (
                  <ul>
                    {destination.matchWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No warnings.</p>
                )}
              </div>

              <div>
                <p className="preview-label">Tags</p>
                <p>
                  {[
                    ...(destination.vibeTags || []),
                    ...(destination.suitableFor || []),
                    ...(destination.destinationTypes || []),
                    ...(destination.bestTripTypes || []),
                    ...(destination.climateTags || []),
                    ...(destination.paceTags || []),
                    ...(destination.experienceTags || []),
                    ...(destination.travelLogistics || []),
                    destination.idealTripLength,
                  ]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default RecommendationsPage