import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { sanity } from '../lib/sanity'

function ItineraryBuilderPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileDoc, setProfileDoc] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [creatingDraft, setCreatingDraft] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    async function loadLatestProfile() {
      try {
        setLoading(true)
        setError('')
        setSaveMessage('')

        const profiles = await sanity.fetch(`
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
            status,
            submittedAt,
            recommendationSnapshots
          }
        `)

        if (!profiles || profiles.length === 0) {
          throw new Error('No saved client travel personality found yet.')
        }

        setProfileDoc(profiles[0])
      } catch (err) {
        console.error('ITINERARY_BUILDER_LOAD_ERROR', err)
        setError(err?.message || 'Failed to load itinerary builder')
      } finally {
        setLoading(false)
      }
    }

    loadLatestProfile()
  }, [])

  const latestSnapshot = useMemo(() => {
    if (!Array.isArray(profileDoc?.recommendationSnapshots)) return null
    if (!profileDoc.recommendationSnapshots.length) return null
    return profileDoc.recommendationSnapshots[profileDoc.recommendationSnapshots.length - 1]
  }, [profileDoc])

  const topDestinations = Array.isArray(latestSnapshot?.topDestinations)
    ? latestSnapshot.topDestinations
    : []

  const selectedRecommendation = topDestinations[selectedIndex] || null

  async function handleCreateDraft() {
    try {
      if (!profileDoc?._id) {
        throw new Error('No client profile available.')
      }

      if (!selectedRecommendation) {
        throw new Error('Please select a destination recommendation first.')
      }

      setCreatingDraft(true)
      setSaveMessage('')

      const response = await fetch('/api/create-itinerary-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: profileDoc._id,
          profile: {
            clientName: profileDoc.clientName,
            tripType: profileDoc.tripType,
            originCity: profileDoc.originCity,
            tripLengthDays: profileDoc.tripLengthDays,
            travellerCount: profileDoc.travellerCount,
            budgetBand: profileDoc.budgetBand,
          },
          destination: {
            title: selectedRecommendation.title,
            slug: selectedRecommendation.slug,
            country: selectedRecommendation.country,
            region: selectedRecommendation.region,
            budgetBand: selectedRecommendation.budgetBand,
          },
          recommendation: selectedRecommendation,
          travelStyleSummary: [
            profileDoc.tripType,
            profileDoc.budgetBand,
            selectedRecommendation.title,
          ].filter(Boolean),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create itinerary draft')
      }

      setSaveMessage('Itinerary draft created successfully in Sanity.')
    } catch (err) {
      console.error('CREATE_ITINERARY_DRAFT_CLIENT_ERROR', err)
      setSaveMessage(`Error creating itinerary draft: ${err?.message || 'Unknown error'}`)
    } finally {
      setCreatingDraft(false)
    }
  }

  if (loading) {
    return (
      <div className="page page-luxury">
        <div className="page-topbar">
          <Link to="/" className="back-link">
            ← Back to home
          </Link>
        </div>
        <div className="glass-card">
          <p>Loading itinerary builder...</p>
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

  return (
    <div className="page page-luxury">
      <div className="page-topbar">
        <Link to="/" className="back-link">
          ← Back to home
        </Link>
      </div>

      <header className="hero luxury-hero">
        <div className="hero-badge">LŌQÉ Itinerary Builder</div>
        <h1>Turn saved recommendations into a draft itinerary</h1>
        <p className="subtext hero-subtext">
          Select from the latest saved recommendation snapshot and create a structured
          itinerary draft in Sanity without disturbing the current recommendation flow.
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
            <p><strong>Origin city:</strong> {profileDoc.originCity || '—'}</p>
            <p><strong>Trip length:</strong> {profileDoc.tripLengthDays || '—'} days</p>
            <p><strong>Travellers:</strong> {profileDoc.travellerCount || '—'}</p>
            <p><strong>Budget band:</strong> {profileDoc.budgetBand || '—'}</p>
          </div>
        </section>
      )}

      <section className="glass-card" style={{ marginBottom: '24px' }}>
        <p className="preview-label">Latest saved recommendation snapshot</p>
        <h2>Select a destination to build from</h2>

        {!topDestinations.length ? (
          <p>No saved recommendation snapshot found yet. Save recommendations first.</p>
        ) : (
          <div className="field-stack">
            {topDestinations.map((item, index) => (
              <button
                key={`${item.destinationId || item.title}-${index}`}
                type="button"
                className="secondary-button"
                onClick={() => setSelectedIndex(index)}
                style={{
                  textAlign: 'left',
                  border:
                    selectedIndex === index ? '1px solid rgba(255,255,255,0.4)' : undefined,
                }}
              >
                <strong>{item.title}</strong> — Score {item.recommendationScore}
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedRecommendation && (
        <section className="glass-card" style={{ marginBottom: '24px' }}>
          <p className="preview-label">Selected recommendation</p>
          <h2>{selectedRecommendation.title}</h2>

          <div className="field-stack">
            <p>
              <strong>Location:</strong>{' '}
              {[selectedRecommendation.region, selectedRecommendation.country]
                .filter(Boolean)
                .join(', ') || '—'}
            </p>
            <p><strong>Budget band:</strong> {selectedRecommendation.budgetBand || '—'}</p>
            <p><strong>Score:</strong> {selectedRecommendation.recommendationScore || '—'}</p>
            <p>
              <strong>Top reasons:</strong>{' '}
              {Array.isArray(selectedRecommendation.matchReasons) &&
              selectedRecommendation.matchReasons.length
                ? selectedRecommendation.matchReasons.join(', ')
                : '—'}
            </p>
          </div>

          <div className="preview-divider" />

          <div className="form-actions">
            <button
              type="button"
              className="primary-button luxury-button"
              onClick={handleCreateDraft}
              disabled={creatingDraft}
            >
              {creatingDraft ? 'Creating itinerary draft...' : 'Create itinerary draft'}
            </button>
          </div>

          {saveMessage && <p className="save-message">{saveMessage}</p>}
        </section>
      )}
    </div>
  )
}

export default ItineraryBuilderPage