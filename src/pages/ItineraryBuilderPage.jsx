import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { client } from '../lib/sanity'

const clientProfileByIdQuery = `
  *[_type == "clientProfile" && _id == $id][0]{
    _id,
    _createdAt,
    _updatedAt,
    clientName,
    fullName,
    name,
    firstName,
    lastName,
    email,
    phone,
    company,
    nationality,
    location,
    cityOfResidence,
    tripName,
    tripType,
    purposeOfTravel,
    travelStyle,
    luxuryStyle,
    pace,
    vibe,
    occasion,
    tripLength,
    tripLengthDays,
    duration,
    nights,
    days,
    budget,
    budgetBand,
    budgetRange,
    budgetPerPerson,
    totalBudget,
    partySize,
    travellerCount,
    travelers,
    adults,
    children,
    kids,
    departureCity,
    originCity,
    preferredDeparture,
    preferredTravelMonth,
    preferredMonths,
    travelMonths,
    dateFlexibility,
    notes,
    summary,
    autoSummary,
    questionnaireOutput,
    profilePayload
  }
`

const itineraryDraftsByProfileQuery = `
  *[
    _type == "itineraryDraft" &&
    (
      clientProfile._ref == $id ||
      clientProfile->_id == $id ||
      clientProfile._ref == $draftId ||
      clientProfile->_id == $draftId ||
      profileId == $id ||
      profileId == $draftId
    )
  ] | order(coalesce(updatedAt, _updatedAt, _createdAt) desc){
    _id,
    _createdAt,
    _updatedAt,
    title,
    name,
    status,
    summary,
    notes,
    tripName,
    version,
    dayCount,
    nights,
    startDate,
    endDate,
    clientProfile,
    profileId
  }
`

function formatDate(value) {
  if (!value) return '—'

  try {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function getDisplayName(profileDoc) {
  if (!profileDoc) return 'Untitled Client'

  const joined = [profileDoc.firstName, profileDoc.lastName].filter(Boolean).join(' ').trim()

  return (
    profileDoc.fullName ||
    profileDoc.clientName ||
    profileDoc.name ||
    joined ||
    profileDoc.email ||
    'Untitled Client'
  )
}

function getTripLength(profileDoc) {
  return (
    profileDoc?.tripLengthDays ||
    profileDoc?.tripLength ||
    profileDoc?.duration ||
    profileDoc?.nights ||
    profileDoc?.days ||
    '—'
  )
}

function getTravellerCount(profileDoc) {
  if (!profileDoc) return '—'

  if (profileDoc.travellerCount) return profileDoc.travellerCount
  if (profileDoc.partySize) return profileDoc.partySize
  if (profileDoc.travelers) return profileDoc.travelers

  const parts = []
  if (profileDoc.adults) parts.push(`${profileDoc.adults} adult${Number(profileDoc.adults) > 1 ? 's' : ''}`)
  if (profileDoc.children || profileDoc.kids) {
    const kids = profileDoc.children || profileDoc.kids
    parts.push(`${kids} child${Number(kids) > 1 ? 'ren' : ''}`)
  }

  return parts.length ? parts.join(', ') : '—'
}

function ItineraryBuilderPage() {
  const { id, profileId } = useParams()
  const location = useLocation()

  const routeClientProfile = location.state?.clientProfile || null
  const selectedDestinationFromState =
    location.state?.selectedDestination || location.state?.selectedRecommendation || null
  const stateProfileId = location.state?.profileId || ''
  const routedProfileId = routeClientProfile?._id || stateProfileId || ''

  const resolvedProfileId = id || profileId || routedProfileId || ''

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileDoc, setProfileDoc] = useState(routeClientProfile)
  const [itineraryDrafts, setItineraryDrafts] = useState([])
  const [selectedRecommendation, setSelectedRecommendation] = useState(selectedDestinationFromState)
  const [creatingDraft, setCreatingDraft] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadBuilderData() {
      try {
        setLoading(true)
        setError('')
        setSaveMessage('')

        if (!resolvedProfileId && !routeClientProfile?._id) {
          throw new Error('No client profile ID found for itinerary builder.')
        }

        let profile = routeClientProfile

        if (!profile?._id) {
          profile = await client.fetch(clientProfileByIdQuery, { id: resolvedProfileId })
        }

        if (!profile?._id) {
          throw new Error('Client profile not found.')
        }

        const drafts = await client.fetch(itineraryDraftsByProfileQuery, {
          id: profile._id,
          draftId: `drafts.${profile._id}`,
        })

        if (!cancelled) {
          setProfileDoc(profile)
          setItineraryDrafts(Array.isArray(drafts) ? drafts : [])
          setSelectedRecommendation(selectedDestinationFromState)
        }
      } catch (err) {
        console.error('ITINERARY_BUILDER_LOAD_ERROR', err)
        if (!cancelled) {
          setError(err?.message || 'Failed to load itinerary builder')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadBuilderData()

    return () => {
      cancelled = true
    }
  }, [resolvedProfileId, routeClientProfile, selectedDestinationFromState])

  const travelStyleSummary = useMemo(() => {
    const payload = profileDoc?.profilePayload || {}

    return [
      profileDoc?.tripType,
      profileDoc?.travelStyle,
      profileDoc?.luxuryStyle,
      profileDoc?.budgetBand,
      profileDoc?.budgetRange,
      profileDoc?.pace,
      profileDoc?.vibe,
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
            clientName: getDisplayName(profileDoc),
            tripName: profileDoc.tripName || '',
            tripType: profileDoc.tripType || profileDoc.purposeOfTravel || '',
            originCity:
              profileDoc.originCity ||
              profileDoc.departureCity ||
              profileDoc.cityOfResidence ||
              profileDoc.location ||
              '',
            tripLengthDays:
              profileDoc.tripLengthDays ||
              profileDoc.tripLength ||
              profileDoc.duration ||
              profileDoc.nights ||
              profileDoc.days ||
              null,
            travellerCount:
              profileDoc.travellerCount ||
              profileDoc.partySize ||
              profileDoc.travelers ||
              null,
            budgetBand:
              profileDoc.budgetBand ||
              profileDoc.budgetRange ||
              profileDoc.budget ||
              '',
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
      } catch {
        throw new Error(
          `API did not return valid JSON. Raw response: ${rawText || 'empty response'}`
        )
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create itinerary draft')
      }

      setSaveMessage('Itinerary draft created successfully in Sanity.')

      const drafts = await client.fetch(itineraryDraftsByProfileQuery, {
        id: profileDoc._id,
        draftId: `drafts.${profileDoc._id}`,
      })

      setItineraryDrafts(Array.isArray(drafts) ? drafts : [])
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
          <Link to={profileDoc?._id ? `/client-profiles/${profileDoc._id}` : '/client-profiles'} className="back-link">
            ← Back to client profile
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
          <Link to="/client-profiles" className="back-link">
            ← Back to client profiles
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
        <Link to={`/client-profiles/${profileDoc?._id}`} className="back-link">
          ← Back to client profile
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
          <h2>{getDisplayName(profileDoc)}</h2>
          <p className="preview-summary">
            {profileDoc.autoSummary || profileDoc.summary || profileDoc.questionnaireOutput || 'No summary available.'}
          </p>

          <div className="preview-divider" />

          <div className="field-stack">
            <p><strong>Trip name:</strong> {profileDoc.tripName || '—'}</p>
            <p><strong>Trip type:</strong> {profileDoc.tripType || profileDoc.purposeOfTravel || '—'}</p>
            <p><strong>Origin city:</strong> {profileDoc.originCity || profileDoc.departureCity || profileDoc.cityOfResidence || '—'}</p>
            <p><strong>Trip length:</strong> {getTripLength(profileDoc)} {getTripLength(profileDoc) !== '—' ? 'days' : ''}</p>
            <p><strong>Travellers:</strong> {getTravellerCount(profileDoc)}</p>
            <p><strong>Budget band:</strong> {profileDoc.budgetBand || profileDoc.budgetRange || profileDoc.budget || '—'}</p>
          </div>
        </section>
      )}

      <section className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <p className="preview-label">Selected destination</p>
        {!selectedRecommendation ? (
          <p>
            No recommendation selected yet. Go back to Recommendations and choose
            “Add to Itinerary”.
          </p>
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

      <section className="glass-card" style={{ padding: '24px' }}>
        <p className="preview-label">Existing itinerary drafts</p>

        {itineraryDrafts.length === 0 ? (
          <p>No itinerary drafts exist for this client yet.</p>
        ) : (
          <div className="field-stack">
            {itineraryDrafts.map((draft) => (
              <div
                key={draft._id}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <p><strong>{draft.title || draft.name || draft.tripName || 'Untitled Draft'}</strong></p>
                <p><strong>Status:</strong> {draft.status || 'draft'}</p>
                <p>
                  <strong>Updated:</strong>{' '}
                  {formatDate(draft.updatedAt || draft._updatedAt || draft._createdAt)}
                </p>
                <div style={{ marginTop: '10px' }}>
                  <Link to={`/itinerary-drafts/${draft._id}`} className="back-link">
                    Open draft →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default ItineraryBuilderPage