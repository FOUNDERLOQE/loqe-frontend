import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { client } from '../lib/sanity'

const clientProfilesListQuery = `
  *[_type in ["clientProfile", "clientTravelPersonality"]] | order(coalesce(_updatedAt, _createdAt) desc){
    _id,
    _type,
    _createdAt,
    _updatedAt,

    clientType,

    title,
    clientName,
    fullName,
    name,
    firstName,
    lastName,
    email,
    phone,
    company,

    tripName,
    tripType,
    purposeOfTravel,

    budgetBand,
    budgetRange,
    budget,

    originCity,
    departureCity,
    cityOfResidence,
    location,

    tripLengthDays,
    tripLength,
    duration,
    nights,
    days,

    travellerCount,
    partySize,
    travelers,
    adults,
    children,
    kids,

    travelSignalTags,
    travelStyle,
    luxuryStyle,
    vibe,

    autoSummary,
    summary,
    questionnaireOutput
  }
`

function getDisplayName(profile) {
  if (!profile) return 'Untitled Client'

  const joined = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()

  return (
    profile.clientName ||
    profile.fullName ||
    profile.name ||
    profile.title ||
    joined ||
    profile.email ||
    'Untitled Client'
  )
}

function getClientType(profile) {
  const value = profile?.clientType
  if (!value) return 'Client'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

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

function getTripLabel(profile) {
  return profile.tripName || profile.tripType || profile.purposeOfTravel || ''
}

function getBudgetLabel(profile) {
  return profile.budgetBand || profile.budgetRange || profile.budget || ''
}

function getOriginLabel(profile) {
  return profile.originCity || profile.departureCity || profile.cityOfResidence || profile.location || ''
}

function getDurationLabel(profile) {
  const value =
    profile.tripLengthDays ||
    profile.tripLength ||
    profile.duration ||
    profile.nights ||
    profile.days

  return value ? `${value} days` : ''
}

function getTravellerLabel(profile) {
  if (profile.travellerCount) {
    return `${profile.travellerCount} traveller${Number(profile.travellerCount) > 1 ? 's' : ''}`
  }

  if (profile.partySize) {
    return `${profile.partySize} traveller${Number(profile.partySize) > 1 ? 's' : ''}`
  }

  if (profile.travelers) {
    return `${profile.travelers} traveller${Number(profile.travelers) > 1 ? 's' : ''}`
  }

  const parts = []
  if (profile.adults) parts.push(`${profile.adults} adult${Number(profile.adults) > 1 ? 's' : ''}`)
  if (profile.children || profile.kids) {
    const kids = profile.children || profile.kids
    parts.push(`${kids} child${Number(kids) > 1 ? 'ren' : ''}`)
  }

  return parts.join(', ')
}

function getSignalTags(profile) {
  if (Array.isArray(profile.travelSignalTags) && profile.travelSignalTags.length > 0) {
    return profile.travelSignalTags.slice(0, 6)
  }

  return [
    profile.travelStyle,
    profile.luxuryStyle,
    profile.vibe,
  ].filter(Boolean).slice(0, 6)
}

function getSummary(profile) {
  return (
    profile.autoSummary ||
    profile.summary ||
    profile.questionnaireOutput ||
    'No summary available.'
  )
}

function ClientProfilesPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadProfiles() {
      try {
        setLoading(true)
        setError('')

        const data = await client.fetch(clientProfilesListQuery)

        if (!mounted) return
        setProfiles(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('CLIENT_PROFILES_FETCH_ERROR', err)
        if (!mounted) return
        setError(err?.message || 'Failed to load client profiles')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    loadProfiles()

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
        <div className="hero-badge">LŌQÉ Archive</div>
        <h1>Saved Client Profiles</h1>
        <p className="subtext hero-subtext">
          Revisit past client profiles and use them as the base for future trip planning.
        </p>
      </header>

      {loading && (
        <div className="glass-card profiles-empty-state">
          <p>Loading saved client profiles...</p>
        </div>
      )}

      {!loading && error && (
        <div className="glass-card profiles-empty-state">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && profiles.length === 0 && (
        <div className="glass-card profiles-empty-state">
          <p>No saved client profiles yet.</p>
        </div>
      )}

      {!loading && !error && profiles.length > 0 && (
        <div className="profiles-grid">
          {profiles.map((profile) => {
            const tags = getSignalTags(profile)

            return (
              <Link
                key={profile._id}
                to={`/client-profiles/${profile._id}`}
                className="profile-card-link"
              >
                <article className="profile-card glass-card">
                  <div className="profile-card-top">
                    <div>
                      <p className="section-kicker">{getClientType(profile)}</p>
                      <h3>{getDisplayName(profile)}</h3>
                    </div>

                    <span className="profile-date">
                      {formatDate(profile._updatedAt || profile._createdAt)}
                    </span>
                  </div>

                  <div className="profile-meta">
                    {getTripLabel(profile) && (
                      <span className="profile-meta-pill">{getTripLabel(profile)}</span>
                    )}

                    {getBudgetLabel(profile) && (
                      <span className="profile-meta-pill">{getBudgetLabel(profile)}</span>
                    )}

                    {getOriginLabel(profile) && (
                      <span className="profile-meta-pill">{getOriginLabel(profile)}</span>
                    )}

                    {getDurationLabel(profile) && (
                      <span className="profile-meta-pill">{getDurationLabel(profile)}</span>
                    )}

                    {getTravellerLabel(profile) && (
                      <span className="profile-meta-pill">{getTravellerLabel(profile)}</span>
                    )}
                  </div>

                  {tags.length > 0 && (
                    <div className="destination-tag-group">
                      {tags.map((tag) => (
                        <span key={tag} className="destination-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="destination-summary profile-summary">
                    {getSummary(profile)}
                  </p>

                  <div className="profile-card-footer">
                    <span>Open profile →</span>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ClientProfilesPage