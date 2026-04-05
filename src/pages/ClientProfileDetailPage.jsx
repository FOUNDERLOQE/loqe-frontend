import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { client } from '../lib/sanity'
import { clientProfileDetailQuery } from '../lib/queries'

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

function renderText(value) {
  if (!value) return '—'
  return value
}

function renderArray(value) {
  if (!Array.isArray(value) || value.length === 0) return []
  return value.filter(Boolean)
}

function SectionBlock({ title, items }) {
  const visibleItems = items.filter((item) => {
    if (Array.isArray(item.value)) return item.value.length > 0
    return item.value && item.value !== '—'
  })

  if (visibleItems.length === 0) return null

  return (
    <section className="profile-detail-section glass-card">
      <div className="profile-detail-head">
        <p className="section-kicker">{title}</p>
      </div>

      <div className="profile-detail-grid">
        {visibleItems.map((item) => (
          <div key={item.label} className="profile-detail-item">
            <p className="profile-detail-label">{item.label}</p>

            {Array.isArray(item.value) ? (
              <div className="destination-tag-group">
                {item.value.map((entry) => (
                  <span key={entry} className="destination-tag">
                    {entry}
                  </span>
                ))}
              </div>
            ) : (
              <p className="profile-detail-value">{item.value}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function AnnualReviewBlock({ entries }) {
  if (!Array.isArray(entries) || entries.length === 0) return null

  return (
    <section className="profile-detail-section glass-card">
      <div className="profile-detail-head">
        <p className="section-kicker">Annual Review Log</p>
      </div>

      <div className="field-stack">
        {entries.map((entry, index) => (
          <div key={index} className="annual-review-card">
            <div className="profile-detail-grid">
              <div className="profile-detail-item">
                <p className="profile-detail-label">Year</p>
                <p className="profile-detail-value">{renderText(entry.year)}</p>
              </div>
              <div className="profile-detail-item">
                <p className="profile-detail-label">Major Life Changes</p>
                <p className="profile-detail-value">
                  {renderText(entry.majorLifeChanges)}
                </p>
              </div>
              <div className="profile-detail-item">
                <p className="profile-detail-label">Updated Travel Preferences</p>
                <p className="profile-detail-value">
                  {renderText(entry.updatedTravelPreferences)}
                </p>
              </div>
              <div className="profile-detail-item">
                <p className="profile-detail-label">Upcoming Important Dates</p>
                <p className="profile-detail-value">
                  {renderText(entry.upcomingImportantDates)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ClientProfileDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    client
      .fetch(clientProfileDetailQuery, { id })
      .then((data) => {
        if (!mounted) return
        setProfile(data || null)
      })
      .catch((err) => {
        console.error('CLIENT_PROFILE_DETAIL_FETCH_ERROR', err)
        if (!mounted) return
        setError(err.message || 'Failed to load client profile')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id])

  const payload = profile?.profilePayload || {}

  const overviewItems = useMemo(() => ([
    { label: 'Trip Type', value: renderText(profile?.tripType) },
    { label: 'Trip Length', value: profile?.tripLengthDays ? `${profile.tripLengthDays} days` : '—' },
    { label: 'Traveller Count', value: profile?.travellerCount ? `${profile.travellerCount}` : '—' },
    { label: 'Budget Band', value: renderText(profile?.budgetBand) },
    { label: 'Origin City', value: renderText(profile?.originCity) },
    { label: 'City of Residence', value: renderText(profile?.cityOfResidence) },
    { label: 'Created On', value: formatDate(profile?.createdAt) },
    { label: 'Signal Tags', value: renderArray(profile?.travelSignalTags) },
  ]), [profile])

  const identityItems = [
    { label: 'Name We’ll Greet You With', value: renderText(payload.greetName) },
    { label: 'Preferred Pronouns', value: renderText(payload.preferredPronouns) },
    { label: 'Current Location', value: renderText(payload.currentLocation) },
    { label: 'Best Way To Reach', value: renderText(payload.bestWayToReach) },
    { label: 'Next Escape Window', value: renderText(payload.nextEscapeWindow) },
    { label: 'Tiny Humans Or Pets', value: renderText(payload.tinyHumansOrPets) },
  ]

  const lifestyleItems = [
    { label: 'Where They Live Now', value: renderText(payload.liveNow) },
    { label: 'Living Situation', value: renderText(payload.livingSituation) },
    { label: 'Career / Current Focus', value: renderText(payload.careerCurrentFocus) },
    { label: 'Typical Escape Windows', value: renderText(payload.typicalEscapeWindows) },
    { label: 'Average Trip Length Preference', value: renderText(payload.averageTripLengthPreference) },
    { label: 'Recent Major Life Changes', value: renderText(payload.recentMajorLifeChanges) },
  ]

  const personalityItems = [
    { label: 'Travel Energy', value: renderText(payload.travelEnergyDrink) },
    { label: 'Ocean or Mountain', value: renderText(payload.wouldYouRatherOceanOrMountain) },
    { label: 'Explore or Lounge', value: renderText(payload.wouldYouRatherExploreOrLounge) },
    { label: 'Street Food or Michelin', value: renderText(payload.wouldYouRatherStreetFoodOrMichelin) },
    { label: 'Plan or Flow', value: renderText(payload.wouldYouRatherPlanOrFlow) },
    { label: 'Preferred Climate', value: renderText(payload.preferredClimate) },
    { label: 'Ideal Travel Soundtrack', value: renderText(payload.idealTravelSoundtrack) },
    { label: 'Holiday Movie', value: renderText(payload.holidayMovie === 'Other' ? payload.holidayMovieOther || 'Other' : payload.holidayMovie) },
    { label: 'Travel Excitement', value: renderArray(payload.travelExcitement) },
    { label: 'Trip Vibe Words', value: renderText(payload.tripVibeWords) },
    { label: 'Travel Spirit Animal', value: renderText(payload.travelSpiritAnimal) },
  ]

  const planningItems = [
    { label: 'Accommodation Must-Haves', value: renderText(payload.accommodationMustHaves) },
    { label: 'Absolute Deal-Breakers', value: renderText(payload.absoluteDealBreakers) },
    { label: 'Preferred Airlines / Loyalty Programs', value: renderText(payload.preferredAirlinesLoyaltyPrograms) },
    { label: 'Dietary Preferences & Restrictions', value: renderText(payload.dietaryPreferencesRestrictions) },
    { label: 'Health / Mobility Considerations', value: renderText(payload.healthMobilityConsiderations) },
  ]

  const historyItems = [
    { label: 'Favourite Past Destinations & Why', value: renderText(payload.favoritePastDestinationsWhy) },
    { label: 'Places They Won’t Return To & Why', value: renderText(payload.wontReturnDestinationsWhy) },
    { label: 'Most Memorable Experiences Ever', value: renderText(payload.mostMemorableExperiencesEver) },
    { label: 'Repeat Destination Comfort Zones', value: renderText(payload.repeatDestinationComfortZones) },
  ]

  const wishlistItems = [
    { label: 'Top 5 Bucket List Destinations', value: renderText(payload.top5BucketListDestinations) },
    { label: 'Dream Experiences', value: renderText(payload.dreamExperiences) },
    { label: 'Special Events They’d Travel For', value: renderText(payload.specialEventsTravelFor) },
    { label: 'Surprise Tolerance', value: renderText(payload.surpriseTolerance) },
  ]

  const luxuryItems = [
    { label: 'Favourite Cuisines & Dishes', value: renderText(payload.favoriteCuisinesDishes) },
    { label: 'Preferred Wine / Drink Choices', value: renderText(payload.preferredWineDrinkChoices) },
    { label: 'Favourite Colour Palette In Interiors', value: renderText(payload.favoriteColourPaletteInInteriors) },
    { label: 'Fashion Style Reference', value: renderText(payload.fashionStyleReference) },
    { label: 'Hobbies & Passions', value: renderText(payload.hobbiesPassions) },
    { label: 'Music Playlist For Travels', value: renderText(payload.musicPlaylistForTravels) },
  ]

  function handleGenerateRecommendations() {
    navigate('/recommendations', {
      state: {
        source: 'saved-profile',
        clientProfileId: profile?._id,
        clientProfile: profile,
      },
    })
  }

  if (loading) {
    return (
      <div className="page page-luxury">
        <div className="glass-card profiles-empty-state">
          <p>Loading client profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="page page-luxury">
        <div className="page-topbar">
          <Link to="/client-profiles" className="back-link">
            ← Back to saved profiles
          </Link>
        </div>

        <div className="glass-card profiles-empty-state">
          <p>{error || 'Client profile not found.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page page-luxury">
      <div className="page-topbar">
        <Link to="/client-profiles" className="back-link">
          ← Back to saved profiles
        </Link>
      </div>

      <header className="hero luxury-hero">
        <div className="hero-badge">LŌQÉ Profile Brief</div>
        <h1>{profile.fullName || 'Untitled Client'}</h1>
        <p className="subtext hero-subtext">
          This profile is structured to make destination recommendation and itinerary planning easier.
        </p>
      </header>

      <div className="profile-detail-layout">
        <div className="profile-detail-main">
          <section className="profile-detail-summary glass-card">
            <div className="profile-detail-head">
              <p className="section-kicker">Auto Summary</p>
            </div>
            <p className="profile-summary-large">
              {profile.autoSummary || 'No summary available.'}
            </p>

            <div className="profile-detail-actions">
              <button
                type="button"
                className="primary-button luxury-button"
                onClick={handleGenerateRecommendations}
              >
                Generate Recommendations
              </button>
            </div>
          </section>

          <SectionBlock title="Trip Overview" items={overviewItems} />
          <SectionBlock title="Identity" items={identityItems} />
          <SectionBlock title="Lifestyle Snapshot" items={lifestyleItems} />
          <SectionBlock title="Travel Personality DNA" items={personalityItems} />
          <SectionBlock title="Planning Essentials" items={planningItems} />
          <SectionBlock title="Past Travel History" items={historyItems} />
          <SectionBlock title="Future Wishlist" items={wishlistItems} />
          <SectionBlock title="Luxury & Signature Extras" items={luxuryItems} />
          <AnnualReviewBlock entries={payload.annualReviewLog} />
        </div>

        <aside className="profile-detail-sidebar">
          <div className="glass-card profile-planner-brief">
            <p className="section-kicker">Planner View</p>
            <h3>How to use this profile</h3>

            <ul className="planner-brief-list">
              <li>Start with the auto summary and signal tags.</li>
              <li>Use the trip overview to filter duration, budget, and trip type.</li>
              <li>Use travel personality and planning essentials to decide fit.</li>
              <li>Check past history and wishlist before finalizing recommendations.</li>
              <li>Use deal-breakers to eliminate mismatched destinations fast.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ClientProfileDetailPage
