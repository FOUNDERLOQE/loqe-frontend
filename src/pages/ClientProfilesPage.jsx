import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { client } from '../lib/sanity'
import { clientProfilesQuery } from '../lib/queries'

function formatClientType(value) {
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

function ClientProfilesPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    client
      .fetch(clientProfilesQuery)
      .then((data) => {
        if (!mounted) return
        setProfiles(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        console.error('CLIENT_PROFILES_FETCH_ERROR', err)
        if (!mounted) return
        setError(err.message || 'Failed to load client profiles')
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
          {profiles.map((profile) => (
            <Link
              key={profile._id}
              to={`/client-profiles/${profile._id}`}
              className="profile-card-link"
            >
              <article className="profile-card glass-card">
                <div className="profile-card-top">
                  <div>
                    <p className="section-kicker">
                      {formatClientType(profile.clientType)}
                    </p>
                    <h3>{profile.fullName || 'Untitled Client'}</h3>
                  </div>

                  <span className="profile-date">
                    {formatDate(profile.createdAt)}
                  </span>
                </div>

                <div className="profile-meta">
                  {profile.tripType && (
                    <span className="profile-meta-pill">{profile.tripType}</span>
                  )}

                  {profile.budgetBand && (
                    <span className="profile-meta-pill">{profile.budgetBand}</span>
                  )}

                  {profile.originCity && (
                    <span className="profile-meta-pill">{profile.originCity}</span>
                  )}

                  {profile.cityOfResidence && !profile.originCity && (
                    <span className="profile-meta-pill">{profile.cityOfResidence}</span>
                  )}

                  {profile.tripLengthDays && (
                    <span className="profile-meta-pill">
                      {profile.tripLengthDays} days
                    </span>
                  )}

                  {profile.travellerCount && (
                    <span className="profile-meta-pill">
                      {profile.travellerCount} traveller{profile.travellerCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {!!(profile.travelSignalTags || []).length && (
                  <div className="destination-tag-group">
                    {profile.travelSignalTags.map((tag) => (
                      <span key={tag} className="destination-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="destination-summary profile-summary">
                  {profile.autoSummary || 'No summary available.'}
                </p>

                <div className="profile-card-footer">
                  <span>Open profile →</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClientProfilesPage
