import { useEffect, useState } from 'react'
import { sanity } from '../lib/sanity'
import DestinationCard from '../components/DestinationCard'

function HomePage() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    sanity
      .fetch(`
        *[_type == "destination"] | order(title asc){
          _id,
          title,
          slug,
          country,
          region,
          summary,
          heroImage,
          budgetBand,
          vibeTags,
          suitableFor
        }
      `)
      .then((data) => {
        setDestinations(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('SANITY ERROR:', err)
        setError(`Failed to load destinations: ${err.message}`)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="page">
        <p>Loading destinations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">LOQE</p>
        <h1>Curated luxury travel, tailored to the client.</h1>
        <p className="subtext">
          Discover destinations shaped for high-intent, personalized travel planning.
        </p>
      </header>

      <section>
        <h2 className="section-title">Destinations</h2>

        <div className="grid">
          {destinations.map((destination) => (
            <DestinationCard key={destination._id} destination={destination} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage