import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sanity } from '../lib/sanity'
import DestinationCard from '../components/DestinationCard'

export default function HomePage() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDestinations() {
      try {
        const data = await sanity.fetch(`
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

        setDestinations(data || [])
      } catch (err) {
        console.error('Failed to load destinations:', err)
        setError(`Failed to load destinations: ${err?.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    loadDestinations()
  }, [])

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <section style={heroStyle}>
          <div style={eyebrowStyle}>LOQE</div>

          <h1 style={titleStyle}>
            Luxury travel,
            <br />
            intelligently tailored.
          </h1>

          <p style={subtitleStyle}>
            Move from client conversation to curated recommendations and itinerary logic
            through a structured luxury travel engine.
          </p>

          <div style={heroActionsStyle}>
            <Link to="/client-profiles" style={primaryButtonStyle}>
              Open Client Profiles
            </Link>

            <Link to="/client-intake" style={secondaryButtonStyle}>
              Start Client Intake
            </Link>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>How LOQE Works</h2>

          <div style={infoGridStyle}>
            <div style={infoCardStyle}>
              <div style={cardNumberStyle}>01</div>
              <h3 style={cardTitleStyle}>Capture the Client</h3>
              <p style={cardTextStyle}>
                Use Client Intake to capture the full travel questionnaire once, cleanly
                and consistently.
              </p>
            </div>

            <div style={infoCardStyle}>
              <div style={cardNumberStyle}>02</div>
              <h3 style={cardTitleStyle}>Open the Client Record</h3>
              <p style={cardTextStyle}>
                Every saved client appears under Client Profiles with their travel
                personality, preferences, and profile context.
              </p>
            </div>

            <div style={infoCardStyle}>
              <div style={cardNumberStyle}>03</div>
              <h3 style={cardTitleStyle}>Operate from One Console</h3>
              <p style={cardTextStyle}>
                Recommendations, saved boards, and itinerary drafts should all sit under
                the same client record.
              </p>
            </div>
          </div>
        </section>

        <section style={destinationsSectionStyle}>
          <h2 style={sectionTitleStyle}>Featured Destinations</h2>

          {loading ? (
            <div style={messageCardStyle}>Loading destinations...</div>
          ) : error ? (
            <div style={messageCardStyle}>{error}</div>
          ) : destinations.length === 0 ? (
            <div style={messageCardStyle}>No destinations found yet.</div>
          ) : (
            <div style={destinationGridStyle}>
              {destinations.map((destination) => (
                <DestinationCard key={destination._id} destination={destination} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const pageStyle = {
  minHeight: 'calc(100vh - 80px)',
  background:
    'radial-gradient(circle at top, rgba(30,40,75,0.22), rgba(6,7,11,1) 45%), #06070b',
  color: '#ffffff',
}

const containerStyle = {
  maxWidth: '1320px',
  margin: '0 auto',
  padding: '56px 20px 72px',
}

const heroStyle = {
  padding: '72px 24px 48px',
  textAlign: 'center',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
}

const eyebrowStyle = {
  fontSize: '13px',
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.55)',
  marginBottom: '20px',
}

const titleStyle = {
  margin: 0,
  fontSize: 'clamp(48px, 8vw, 96px)',
  lineHeight: 0.95,
  fontWeight: 800,
  letterSpacing: '-0.04em',
}

const subtitleStyle = {
  maxWidth: '880px',
  margin: '24px auto 0',
  fontSize: 'clamp(18px, 2.3vw, 24px)',
  lineHeight: 1.5,
  color: 'rgba(255,255,255,0.72)',
}

const heroActionsStyle = {
  marginTop: '32px',
  display: 'flex',
  gap: '14px',
  justifyContent: 'center',
  flexWrap: 'wrap',
}

const buttonBaseStyle = {
  textDecoration: 'none',
  padding: '14px 20px',
  borderRadius: '999px',
  fontWeight: 700,
  fontSize: '15px',
  border: '1px solid rgba(255,255,255,0.1)',
}

const primaryButtonStyle = {
  ...buttonBaseStyle,
  background: '#ffffff',
  color: '#0b0e16',
}

const secondaryButtonStyle = {
  ...buttonBaseStyle,
  background: 'transparent',
  color: '#ffffff',
}

const sectionStyle = {
  paddingTop: '44px',
}

const destinationsSectionStyle = {
  paddingTop: '44px',
}

const sectionTitleStyle = {
  margin: '0 0 22px',
  fontSize: '36px',
  textAlign: 'center',
}

const infoGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '18px',
}

const destinationGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '18px',
}

const infoCardStyle = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 18px 48px rgba(0,0,0,0.2)',
}

const messageCardStyle = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '24px',
  padding: '24px',
  textAlign: 'center',
  color: 'rgba(255,255,255,0.72)',
}

const cardNumberStyle = {
  width: '40px',
  height: '40px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.8)',
  fontWeight: 800,
  marginBottom: '16px',
}

const cardTitleStyle = {
  margin: '0 0 10px',
  fontSize: '22px',
}

const cardTextStyle = {
  margin: 0,
  color: 'rgba(255,255,255,0.7)',
  lineHeight: 1.65,
  fontSize: '15px',
}