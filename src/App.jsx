import { useEffect, useState } from 'react'
import { sanity } from './lib/sanity'
import { urlFor } from './lib/image'
import './App.css'

function App() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    sanity
      .fetch(`
        *[_type == "destination" && active == true] | order(title asc){
          _id,
          title,
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
        console.error(err)
        setError('Failed to load destinations')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="page"><p>Loading destinations...</p></div>
  }

  if (error) {
    return <div className="page"><p>{error}</p></div>
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">LOQE</p>
        <h1>Curated luxury travel, tailored to the client.</h1>
        <p className="subtext">
          Early frontend connected to live Sanity content.
        </p>
      </header>

      <section>
        <h2 className="section-title">Destinations</h2>

        <div className="grid">
          {destinations.map((destination) => (
            <article className="card" key={destination._id}>
              {destination.heroImage && (
                <img
                  src={urlFor(destination.heroImage).width(800).height(500).url()}
                  alt={destination.title}
                  className="card-image"
                />
              )}

              <div className="card-body">
                <p className="meta">
                  {destination.country}
                  {destination.region ? ` • ${destination.region}` : ''}
                </p>

                <h3>{destination.title}</h3>

                {destination.summary && <p>{destination.summary}</p>}

                {destination.budgetBand && (
                  <p><strong>Budget:</strong> {destination.budgetBand}</p>
                )}

                {destination.vibeTags?.length > 0 && (
                  <div className="tags">
                    {destination.vibeTags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
