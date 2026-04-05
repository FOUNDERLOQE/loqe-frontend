import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { client } from '../lib/sanity'
import { clientProfilesQuery } from '../lib/queries'

function ItineraryBuilderPage() {
  const location = useLocation()
  const routeState = location.state || {}

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileDoc, setProfileDoc] = useState(null)
  const [selectedRecommendation, setSelectedRecommendation] = useState(
    routeState?.selectedDestination || null
  )
  const [creatingDraft, setCreatingDraft] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setError('')
        setSaveMessage('')

        if (routeState?.clientProfile) {
          setProfileDoc(routeState.clientProfile)
          setLoading(false)
          return
        }

        const profiles = await client.fetch(clientProfilesQuery)

        if (!profiles || profiles.length === 0) {
          throw new Error('No saved client profile found yet.')
        }

        setProfileDoc(profiles[0])
      } catch (err) {
        console.error('ITINERARY_BUILDER_LOAD_ERROR', err)
        setError(err?.message || 'Failed to load itinerary builder')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [routeState])

  const travelStyleSummary = useMemo(() => {
    const payload = profileDoc?.profilePayload || {}

    return [
      profileDoc?.tripType,
      profileDoc?.budgetBand,
      payload?.travelEnergyDrink,
      payload?.preferredClimate,
      payload?.tripVibeWords,
    ].filter(Boolean)
  }, [profileDoc])

  async function handleCreateDraft() {
    try {
      if (!profileDoc?._id) {
        throw new Error('No saved client profile available.')
      }

      if (!selectedRecommendation) {
        throw new Error('No destination selected for itinerary creation.')
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
            clientName: profileDoc.fullName || profileDoc.clientName || '',
            tripType: profileDoc.tripType || '',
            originCity: profileDoc.originCity || profileDoc.cityOfResidence || '',
            tripLengthDays: profileDoc.tripLengthDays || null,
            travellerCount: profileDoc.travellerCount || null,
            budgetBand: profileDoc.budgetBand || '',
          },
          destination: {
            title: selectedRecommendation.title || '',
            slug:
              selectedRecommendation.slug?.current ||
              selectedRecommendation.slug ||
              '',
            country: selectedRecommendation.country || '',
            region: selectedRecommendation.region || '',
            budgetBand: selectedRecommendation.budgetBand || '',
          },
          recommendation: {
            recommendationScore: selectedRecommendation.recommendationScore || 0,
            matchReasons: selectedRecommendation.matchReasons || [],
          },
          travelStyleSummary,
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
        throw new Error(result.error || 'Failed to create itinerary draft')
      }

      setSaveMessage('Itinerary draft created successfully in Sanity.')
    } catch (err) {
      console.error('CREATE_ITINERARY_DRAFT_CLIENT_ERROR', err)
      setSaveMessage(
        `Error creating itinerary draft: ${err?.message || 'Unknown error'}`
      )
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
        <h1>Turn a recommendation into a first-draft itinerary</h1>
        <p className="subtext hero-subtext">
          Build a structured itinerary draft directly from the selected recommendation
          and saved client profile.
        </p>
      </header>

      {profileDoc && (
        <section className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
          <p className="preview-label">Saved client profile</p>
          <h2>{profileDoc.fullName || 'Untitled Client'}</h2>
          <p className="preview-summary">{profileDoc.autoSummary || 'No summary available.'}</p>

          <div className="preview-divider" />

          <div className="field-stack">
            <p><strong>Trip type:</strong> {profileDoc.tripType || '—'}</p>
            <p><strong>Origin city:</strong> {profileDoc.originCity || profileDoc.cityOfResidence || '—'}</p>
            <p><strong>Trip length:</strong> {profileDoc.tripLengthDays || '—'} days</p>
            <p><strong>Travellers:</strong> {profileDoc.travellerCount || '—'}</p>
            <p><strong>Budget band:</strong> {profileDoc.budgetBand || '—'}</p>
          </div>
        </section>
      )}

      <section className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <p className="preview-label">Selected destination</p>
        {!selectedRecommendation ? (
          <p>No recommendation selected yet. Go back to Recommendations and choose “Add to Itinerary”.</p>
        ) : (
          <>
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
          </>
        )}
      </section>
    </div>
  )
}

export default ItineraryBuilderPage
